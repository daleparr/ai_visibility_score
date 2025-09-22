import { NextResponse } from 'next/server';
import { z } from 'zod';
import { triggerEvaluation } from '@/lib/evaluation-engine'; // Assuming this function exists

const rescanRequestSchema = z.object({
  brandId: z.string(), // We'll use brandId to trigger the rescan
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = rescanRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedRequest.error.flatten() }, { status: 400 });
    }

    const { brandId } = parsedRequest.data;

    // Here, we would look up the brand's domain from the database
    // For now, we'll simulate this and assume a function `triggerEvaluation`
    // is available to start the rescan process.

    console.log(`Received request to re-scan brand: ${brandId}`);

    // This function will need to be implemented or connected to your existing evaluation trigger
    // It should add the brand to a queue for re-evaluation by the AIDI agents.
    const evaluation = await triggerEvaluation(brandId);

    return NextResponse.json({
        status: 'pending',
        message: 'Re-scan initiated.',
        evaluationId: evaluation.id,
    }, { status: 202 }); // 202 Accepted, as the process is asynchronous

  } catch (error: any) {
    console.error('Re-scan initiation failed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}