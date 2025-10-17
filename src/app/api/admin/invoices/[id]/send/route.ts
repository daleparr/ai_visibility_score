import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

// POST /api/admin/invoices/[id]/send - Send invoice via Stripe
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
        SELECT i.*, u.email, u.name,
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
        WHERE i.id = ${invoiceId}
        GROUP BY i.id, u.email, u.name
      `
    );

    if (!invoiceResult.rows[0]) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = invoiceResult.rows[0];

    // Get or create Stripe customer
    let customerId = invoice.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: invoice.email,
        name: invoice.name || invoice.email,
        metadata: {
          aidi_user_id: invoice.user_id
        }
      });
      customerId = customer.id;
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      description: invoice.description || `AIDI Invoice ${invoice.invoice_number}`,
      metadata: {
        aidi_invoice_id: invoiceId,
        aidi_invoice_number: invoice.invoice_number
      }
    });

    // Add line items to Stripe invoice
    const lineItems = JSON.parse(invoice.line_items || '[]');
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: stripeInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Convert to cents
        currency: 'gbp'
      });
    }

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    await stripe.invoices.sendInvoice(stripeInvoice.id);

    // Update our database
    await db.execute(
      sql`
        UPDATE invoices
        SET stripe_invoice_id = ${stripeInvoice.id},
            status = 'open',
            invoice_pdf_url = ${finalizedInvoice.invoice_pdf},
            hosted_invoice_url = ${finalizedInvoice.hosted_invoice_url},
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
          ${JSON.stringify({ stripe_invoice_id: stripeInvoice.id, amount: invoice.amount_due })}::jsonb
        )
      `
    );

    return NextResponse.json({ 
      success: true, 
      stripe_invoice_id: stripeInvoice.id,
      hosted_invoice_url: finalizedInvoice.hosted_invoice_url
    });
  } catch (error) {
    console.error('Failed to send invoice:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice', details: String(error) },
      { status: 500 }
    );
  }
}

