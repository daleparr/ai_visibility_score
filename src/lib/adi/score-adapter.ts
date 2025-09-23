// src/lib/adi/score-adapter.ts

import { ProbeResult } from './probe-harness';
import { DimensionScore, NewDimensionScore } from '../db/schema';

/**
 * Maps the unstructured results from the ProbeHarness to the structured
 * DimensionScore objects that the scoring engine expects.
 *
 * This acts as an anti-corruption layer, decoupling the new probe-based
 * evidence gathering from the existing scoring logic.
 *
 * @param probeResults The array of results from the ProbeHarness.
 * @param evaluationId The ID of the current evaluation.
 * @returns An array of NewDimensionScore objects.
 */
export function mapProbesToDimensionScores(probeResults: ProbeResult[], evaluationId: string): NewDimensionScore[] {
    const dimensionScores: NewDimensionScore[] = [];

    for (const result of probeResults) {
        let score = 0;
        let explanation = '';

        switch (result.probeName) {
            case 'schema_probe':
                score = scoreSchemaProbe(result.output);
                explanation = `Schema probe ${result.wasValid ? 'succeeded' : 'failed'}. Confidence: ${result.confidence}%.`;
                dimensionScores.push({
                    evaluationId,
                    dimensionName: 'schema_structured_data',
                    score,
                    explanation,
                });
                break;

            case 'policy_probe':
                score = scorePolicyProbe(result.output);
                explanation = `Policy probe ${result.wasValid ? 'succeeded' : 'failed'}. Confidence: ${result.confidence}%.`;
                dimensionScores.push({
                    evaluationId,
                    dimensionName: 'policies_logistics', // Example mapping
                    score,
                    explanation,
                });
                break;

            case 'kg_probe':
                score = scoreKgProbe(result.output);
                explanation = `KG probe ${result.wasValid ? 'succeeded' : 'failed'}. Confidence: ${result.confidence}%.`;
                dimensionScores.push({
                    evaluationId,
                    dimensionName: 'knowledge_graphs',
                    score,
                    explanation,
                });
                break;

            case 'semantics_probe':
                score = scoreSemanticsProbe(result.output);
                explanation = `Semantics probe ${result.wasValid ? 'succeeded' : 'failed'}. Confidence: ${result.confidence}%.`;
                dimensionScores.push({
                    evaluationId,
                    dimensionName: 'semantic_clarity',
                    score,
                    explanation,
                });
                break;
        }
    }

    return dimensionScores;
}

// --- Scoring Rubrics per Probe ---

function scoreSchemaProbe(output: any): number {
    if (!output) return 0;
    let score = 0;
    if (output.gtin) score += 30;
    if (output.price) score += 30;
    if (output.availability) score += 30;
    if (output.variant_count && output.variant_count > 1) score += 10;
    return Math.min(score, 100);
}

function scorePolicyProbe(output: any): number {
    if (!output?.has_returns) return 10;
    let score = 50;
    if (output.window_days && output.window_days >= 30) score += 30;
    if (output.restocking_fee_pct === 0) score += 20;
    return Math.min(score, 100);
}

function scoreKgProbe(output: any): number {
    if (!output) return 0;
    let score = 0;
    if (output.wikidata_id) score += 50;
    if (output.google_kg_id) score += 50;
    // Modulate by confidence
    return Math.round(score * (output.confidence || 0.5));
}

function scoreSemanticsProbe(output: any): number {
    if (!output) return 20;
    // Fewer ambiguous terms is better
    const termCount = output.ambiguous_terms?.length || 0;
    if (termCount === 0) return 100;
    if (termCount <= 2) return 80;
    if (termCount <= 5) return 50;
    return 30;
}