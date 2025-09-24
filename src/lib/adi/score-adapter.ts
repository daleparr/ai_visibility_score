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
    if (!output || typeof output !== 'object') return 15; // Base score for attempting schema markup
    let score = 20; // Base score for having any structured data
    
    // More realistic scoring - basic product info is valuable
    if (output.price || output.product_name) score += 25;
    if (output.availability || output.in_stock !== undefined) score += 20;
    if (output.gtin || output.sku) score += 20; // GTIN nice to have, not required
    if (output.variant_count && typeof output.variant_count === 'number' && output.variant_count > 1) score += 15;
    
    return Math.min(isNaN(score) ? 15 : score, 100);
}

function scorePolicyProbe(output: any): number {
    if (!output || typeof output !== 'object' || !output.has_returns) return 30; // Having any policy info is valuable
    let score = 60; // Good base score for having returns policy
    
    // Reward good policies but don't penalize reasonable ones
    if (typeof output.window_days === 'number' && output.window_days >= 14) score += 20; // 14 days is reasonable
    if (typeof output.window_days === 'number' && output.window_days >= 30) score += 10; // 30+ days is excellent
    if (typeof output.restocking_fee_pct === 'number' && output.restocking_fee_pct === 0) score += 10; // No fee is nice but not critical
    
    return Math.min(isNaN(score) ? 30 : score, 100);
}

function scoreSemanticsProbe(output: any): number {
    if (!output) return 20; // Base score for semantic analysis attempt
    let score = 30; // Base score for having semantic content
    
    // Reward clear semantic structure
    if (output.clarity_score && output.clarity_score >= 0.7) score += 25;
    if (output.terminology_consistent) score += 20;
    if (output.brand_voice_consistent) score += 15;
    if (output.navigation_clear) score += 10;
    
    return Math.min(score, 100);
}

function scoreKgProbe(output: any): number {
    if (!output) return 25; // Base score for being in search results
    let score = 40; // Base score for having online presence
    
    // Knowledge graph presence is bonus, not requirement
    if (output.wikidata_id) score += 30;
    if (output.google_kg_id) score += 30;
    
    // Brand recognition and mentions are also valuable
    if (output.mention_count && typeof output.mention_count === 'number' && output.mention_count > 0) score += 20;
    
    // Apply confidence but with generous minimum and NaN protection
    let confidenceValue = output.confidence;
    if (typeof confidenceValue !== 'number' || isNaN(confidenceValue)) {
        confidenceValue = 0.8; // Default confidence
    }
    const confidenceMultiplier = Math.max(0.7, confidenceValue);
    const finalScore = Math.round(score * confidenceMultiplier);
    
    return Math.min(isNaN(finalScore) ? 25 : finalScore, 100);
}

// Export scoring functions for testing
export { scoreSchemaProbe, scorePolicyProbe, scoreKgProbe, scoreSemanticsProbe };
