import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/invoices - Get all invoices
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = sql`
      SELECT 
        i.*,
        u.email as user_email,
        u.name as user_name,
        COALESCE(
          json_agg(
            json_build_object(
              'description', il.description,
              'quantity', il.quantity,
              'unit_price', il.unit_price,
              'amount', il.amount
            ) ORDER BY il.display_order
          ) FILTER (WHERE il.id IS NOT NULL),
          '[]'
        ) as line_items
      FROM invoices i
      JOIN users u ON u.id = i.user_id
      LEFT JOIN invoice_line_items il ON il.invoice_id = i.id
    `;

    if (status) {
      query = sql`${query} WHERE i.status = ${status}`;
    }

    query = sql`
      ${query}
      GROUP BY i.id, u.email, u.name
      ORDER BY i.created_at DESC
      LIMIT ${limit}
    `;

    const result = await db.execute(query);

    return NextResponse.json({ invoices: result.rows });
  } catch (error) {
    console.error('Failed to get invoices:', error);
    return NextResponse.json(
      { error: 'Failed to load invoices' },
      { status: 500 }
    );
  }
}

// POST /api/admin/invoices - Create new invoice
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Calculate total
    const totalAmount = body.line_items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );

    // Generate invoice number
    const invoiceCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM invoices WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())`
    );
    const count = parseInt(invoiceCount.rows[0].count || '0') + 1;
    const invoiceNumber = `AIDI-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    // Create invoice
    const result = await db.execute(
      sql`
        INSERT INTO invoices (
          user_id, invoice_number, amount_due, currency, status,
          due_date, description
        )
        VALUES (
          ${body.user_id}, ${invoiceNumber}, ${totalAmount}, ${'GBP'},
          ${'draft'}, ${body.due_date || null}, ${body.description || null}
        )
        RETURNING id
      `
    );

    const invoiceId = result.rows[0].id;

    // Add line items
    for (let i = 0; i < body.line_items.length; i++) {
      const item = body.line_items[i];
      await db.execute(
        sql`
          INSERT INTO invoice_line_items (
            invoice_id, description, quantity, unit_price, amount, display_order
          )
          VALUES (
            ${invoiceId}, ${item.description}, ${item.quantity},
            ${item.unit_price}, ${item.amount}, ${i}
          )
        `
      );
    }

    return NextResponse.json({ id: invoiceId, invoice_number: invoiceNumber, success: true });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice', details: String(error) },
      { status: 500 }
    );
  }
}

