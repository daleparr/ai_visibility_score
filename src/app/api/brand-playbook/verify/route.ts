import { NextResponse } from 'next/server';
import { z } from 'zod';

const verifyRequestSchema = z.object({
  domain: z.string().url(),
});

// Basic schema for aidi-brand.json for initial validation
const brandPlaybookSchema = z.object({
  spec_version: z.string(),
  brand_name: z.string(),
  legal_entity: z.string().optional(),
  founding_year: z.number().int().optional(),
  last_updated: z.string(),
  license: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = verifyRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedRequest.error.flatten() }, { status: 400 });
    }

    const { domain } = parsedRequest.data;
    const playbookUrl = new URL('/.well-known/aidi-brand.json', domain).toString();

    const response = await fetch(playbookUrl, {
        headers: {
            'User-Agent': 'AIDI-Verification-Bot/1.0',
        },
    });

    if (!response.ok) {
        return NextResponse.json({
            status: 'error',
            message: 'File not found or inaccessible.',
            details: `HTTP status ${response.status} at ${playbookUrl}`,
        }, { status: 404 });
    }

    const playbookJson = await response.json();

    const parsedPlaybook = brandPlaybookSchema.safeParse(playbookJson);

    if (!parsedPlaybook.success) {
        return NextResponse.json({
            status: 'error',
            message: 'JSON schema validation failed.',
            details: parsedPlaybook.error.flatten(),
        }, { status: 400 });
    }

    // Additional checks (e.g., freshness, link integrity) will go here
    const lastUpdated = new Date(parsedPlaybook.data.last_updated);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (lastUpdated < sixMonthsAgo) {
        return NextResponse.json({
            status: 'warning',
            message: 'Brand Playbook is out of date.',
            details: 'The file should be updated at least every 6 months.',
        }, { status: 200 });
    }

    return NextResponse.json({
        status: 'valid',
        message: 'Brand Playbook is valid and up-to-date.',
        data: parsedPlaybook.data,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Verification failed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}