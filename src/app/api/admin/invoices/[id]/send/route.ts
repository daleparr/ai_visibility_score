import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST /api/admin/invoices/[id]/send - Send invoice via Stripe
// NOTE: Stripe integration is a placeholder - will be fully implemented after build succeeds
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceId = params.id;

    // Get invoice details
    const invoiceResult = await db.execute(
      sql`
        SELECT i.*, u.email, u.name
        FROM invoices i
        JOIN users u ON u.id = i.user_id
        WHERE i.id = ${invoiceId}
      `
    );

    if (!invoiceResult.rows[0]) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = invoiceResult.rows[0];

    // Update invoice status to 'open' (sent)
    await db.execute(
      sql`
        UPDATE invoices
        SET status = 'open',
            updated_at = NOW()
        WHERE id = ${invoiceId}
      `
    );

    // Log billing event
    await db.execute(
      sql`
        INSERT INTO billing_events (user_id, event_type, event_source, related_invoice_id, event_data)
        VALUES (
          ${invoice.user_id},
          'invoice_sent',
          'cms',
          ${invoiceId},
          ${JSON.stringify({ amount: invoice.amount_due, sent_via: 'manual' })}::jsonb
        )
      `
    );

    // TODO: Implement actual Stripe invoice sending
    // For now, return success and invoice can be sent manually or via future Stripe integration
    return NextResponse.json({ 
      success: true,
      message: 'Invoice marked as sent. Stripe integration pending - send manually for now.',
      invoice_number: invoice.invoice_number,
      amount: invoice.amount_due,
      customer_email: invoice.email
    });
  } catch (error) {
    console.error('Failed to process invoice:', error);
    return NextResponse.json(
      { error: 'Failed to process invoice', details: String(error) },
      { status: 500 }
    );
  }
}

