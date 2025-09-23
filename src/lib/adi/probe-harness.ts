// src/lib/adi/probe-harness.ts

import { z } from 'zod';
import { AIProviderClient, AIProviderName } from '../ai-providers';
import { Brand } from '../db/schema';
import { SelectiveFetchAgent, PageFetchResult } from '../adapters/selective-fetch-agent';

export interface Probe {
    name: string;
    promptTemplate: (context: ProbeContext) => string;
    schema: any; // The JSON schema for the expected output
    zodSchema: z.ZodType<any, any>; // Zod schema for validation
}

export interface ProbeContext {
    brand: Brand;
    fetchedPages: PageFetchResult[];
    // Add other context as needed, e.g., KG results
}

export interface ProbeResult {
    probeName: string;
    wasValid: boolean;
    isTrusted: boolean; // Citations verified, etc.
    confidence: number;
    output: any; // The final, validated output
    allOutputs: any[]; // Outputs from all models
}

export class ProbeHarness {
    private probes: Probe[];
    private aiClients: Record<AIProviderName, AIProviderClient>;

    constructor(probes: Probe[], aiClients: Record<AIProviderName, AIProviderClient>) {
        this.probes = probes;
        this.aiClients = aiClients;
    }

    public async run(context: ProbeContext): Promise<ProbeResult[]> {
        const results: ProbeResult[] = [];

        for (const probe of this.probes) {
            const probeResult = await this.executeProbe(probe, context);
            results.push(probeResult);
        }

        return results;
    }

    private async executeProbe(probe: Probe, context: ProbeContext): Promise<ProbeResult> {
        const prompt = probe.promptTemplate(context);
        const modelsToRun = Object.keys(this.aiClients) as AIProviderName[];

        const modelPromises = modelsToRun.map(modelName => 
            this.runOnModel(this.aiClients[modelName], prompt, probe.schema, probe.zodSchema)
        );
        
        const outputs = await Promise.all(modelPromises);
        const validOutputs = outputs.filter(o => o.success);

        // Simple confidence score: ratio of models that returned valid data
        const confidence = validOutputs.length / modelsToRun.length;

        // In a real system, you would aggregate the outputs (e.g., majority vote, merge)
        const finalOutput = validOutputs.length > 0 ? validOutputs[0].data : null; 

        return {
            probeName: probe.name,
            wasValid: validOutputs.length > 0,
            isTrusted: true, // Placeholder for citation checking
            confidence: Math.round(confidence * 100),
            output: finalOutput,
            allOutputs: outputs.map(o => o.data),
        };
    }

    private async runOnModel(
        client: AIProviderClient, 
        prompt: string, 
        schema: any, 
        zodSchema: z.ZodType<any, any>,
        maxRetries = 1 // Allow one repair attempt
    ): Promise<{ success: boolean, data: any }> {
        let attempt = 0;
        let currentPrompt = prompt;

        while(attempt <= maxRetries) {
            const response = await client.queryWithSchema(currentPrompt, schema);
            
            if (response.error || typeof response.content !== 'object') {
                attempt++;
                continue;
            }

            const validationResult = zodSchema.safeParse(response.content);

            if (validationResult.success) {
                return { success: true, data: validationResult.data };
            } else {
                // Repair loop: send back the validation error
                attempt++;
                const errorDetails = JSON.stringify(validationResult.error.flatten());
                currentPrompt = `${prompt}\n\nThe previous attempt failed validation. Please correct the JSON output to match the schema. Errors: ${errorDetails}`;
            }
        }
        
        return { success: false, data: null };
    }

    // Placeholder for citation verification logic
    private async verifyCitations(data: any): Promise<boolean> {
        // Find all URL fields in the validated data
        // For each URL, perform an HTTP HEAD request
        // Return true if all citations return a 200-level status code
        return true;
    }
}