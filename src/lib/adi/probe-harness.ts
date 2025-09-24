// src/lib/adi/probe-harness.ts

import { z } from 'zod';
import { AIProviderClient, AIProviderName } from '../ai-providers';
import { Brand } from '../db/schema';
import { PageFetchResult } from '../adapters/selective-fetch-agent';

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
    model?: AIProviderName; // The model that produced the final output
    wasValid: boolean;
    isTrusted: boolean; // Citations verified, etc.
    confidence: number;
    output: any; // The final, validated output
    allOutputs: any[]; // Outputs from all models
}

export class ProbeHarness {
    private probes: Probe[];
    private aiClients: Partial<Record<AIProviderName, AIProviderClient>>;

    constructor(probes: Probe[], aiClients: Partial<Record<AIProviderName, AIProviderClient>>) {
        this.probes = probes;
        this.aiClients = aiClients;
    }

    public async run(context: ProbeContext): Promise<ProbeResult[]> {
        console.log(`🚀 [ProbeHarness] Starting ${this.probes.length} probes with ${Object.keys(this.aiClients).length} AI clients`);
        const results: ProbeResult[] = [];

        for (const probe of this.probes) {
            try {
                console.log(`🔍 [ProbeHarness] Executing probe: ${probe.name}`);
                const probeResult = await this.executeProbe(probe, context);
                console.log(`✅ [ProbeHarness] Probe ${probe.name} completed - Valid: ${probeResult.wasValid}, Confidence: ${probeResult.confidence}%`);
                results.push(probeResult);
            } catch (error) {
                console.error(`❌ [ProbeHarness] Probe ${probe.name} failed:`, error);
                // Create a failed probe result instead of stopping
                results.push({
                    probeName: probe.name,
                    model: Object.keys(this.aiClients)[0] as AIProviderName || 'openai',
                    wasValid: false,
                    isTrusted: false,
                    confidence: 0,
                    output: null,
                    allOutputs: []
                });
            }
        }

        console.log(`✅ [ProbeHarness] Completed all probes: ${results.length} results`);
        return results;
    }

    private async executeProbe(probe: Probe, context: ProbeContext): Promise<ProbeResult> {
        const prompt = probe.promptTemplate(context);
        const availableClients = Object.entries(this.aiClients).filter(([_, client]) => client !== undefined);
        const modelsToRun = availableClients.map(([modelName, _]) => modelName as AIProviderName);

        if (modelsToRun.length === 0) {
            console.warn(`⚠️ [ProbeHarness] No AI clients available for probe ${probe.name}`);
            return {
                probeName: probe.name,
                model: 'openai', // Default fallback
                wasValid: false,
                isTrusted: false,
                confidence: 0,
                output: null,
                allOutputs: []
            };
        }

        const modelPromises = availableClients.map(([modelName, client]) =>
            this.runOnModel(client!, prompt, probe.schema, probe.zodSchema)
        );

        const outputs = await Promise.all(modelPromises);
        const validOutputs = outputs.filter(o => o.success);

        // Simple confidence score: ratio of models that returned valid data
        const confidence = validOutputs.length / modelsToRun.length;

        // Find the first valid output. If none, fall back to the first attempted output for attribution.
        const finalOutput = this._findFinalOutput(validOutputs, outputs, modelsToRun);

        const probeResult: ProbeResult = {
            probeName: probe.name,
            model: finalOutput.model, // Guaranteed to be a valid AIProviderName
            wasValid: finalOutput.success,
            isTrusted: true, // Placeholder for citation checking
            confidence: Math.round(confidence * 100),
            output: finalOutput.data,
            allOutputs: outputs.map(o => o.data),
        };
        return probeResult;
    }

    private async runOnModel(
        client: AIProviderClient,
        prompt: string,
        schema: any,
        zodSchema: z.ZodType<any, any>,
        maxRetries = 1 // Allow one repair attempt
    ): Promise<{ success: boolean, data: any, model: AIProviderName }> {
        let attempt = 0;
        let currentPrompt = prompt;

        while (attempt <= maxRetries) {
            console.log(`🔍 [PROBE] ${client.provider} attempt ${attempt + 1} - Schema:`, JSON.stringify(schema, null, 2));
            
            const response = await client.queryWithSchema(currentPrompt, schema);
            
            console.log(`🔍 [PROBE] ${client.provider} raw response:`, {
                hasError: !!response.error,
                error: response.error,
                contentType: typeof response.content,
                contentPreview: typeof response.content === 'string' ? response.content.substring(0, 200) : JSON.stringify(response.content).substring(0, 200)
            });

            if (response.error) {
                console.error(`❌ [PROBE] ${client.provider} API error:`, response.error);
                attempt++;
                continue;
            }
            
            if (typeof response.content !== 'object') {
                console.error(`❌ [PROBE] ${client.provider} expected object, got:`, typeof response.content);
                attempt++;
                continue;
            }

            const validationResult = zodSchema.safeParse(response.content);
            
            console.log(`🔍 [PROBE] ${client.provider} validation result:`, {
                success: validationResult.success,
                errors: validationResult.success ? null : validationResult.error.flatten()
            });

            if (validationResult.success) {
                console.log(`✅ [PROBE] ${client.provider} SUCCESS - Valid response received`);
                return { success: true, data: validationResult.data, model: client.provider };
            } else {
                // Only retry for critical validation failures
                if (attempt === 0) {
                    attempt++;
                    const errorDetails = JSON.stringify(validationResult.error.flatten());
                    console.log(`🔧 [PROBE] ${client.provider} attempting repair with errors:`, errorDetails);
                    currentPrompt = `${prompt}\n\nThe previous attempt failed validation. Please correct the JSON output to match the schema. Errors: ${errorDetails}`;
                } else {
                    // [OPTIMIZATION] Use partial success for meaningful AI responses
                    console.log(`⚠️ [PROBE] ${client.provider} PARTIAL SUCCESS - Using AI response despite schema validation failure`);
                    return { success: true, data: response.content, model: client.provider };
                }
            }
        }

        console.error(`❌ [PROBE] ${client.provider} FAILED after ${maxRetries + 1} attempts`);
        return { success: false, data: null, model: client.provider };
    }
    
    private _findFinalOutput(
        validOutputs: { success: boolean; data: any; model: AIProviderName }[],
        allOutputs: { success: boolean; data: any; model: AIProviderName }[],
        modelsToRun: AIProviderName[]
    ): { success: boolean; data: any; model: AIProviderName } {
        if (validOutputs.length > 0) {
            return validOutputs[0];
        }
        if (allOutputs.length > 0) {
            return { ...allOutputs[0], success: false, data: null };
        }
        // This case handles a catastrophic failure where no models even return a result.
        // We attribute it to the first model we intended to run.
        return { success: false, data: null, model: modelsToRun[0] };
    }

    // Placeholder for citation verification logic
    private async verifyCitations(data: any): Promise<boolean> {
        // Find all URL fields in the validated data
        // For each URL, perform an HTTP HEAD request
        // Return true if all citations return a 200-level status code
        return true;
    }
}