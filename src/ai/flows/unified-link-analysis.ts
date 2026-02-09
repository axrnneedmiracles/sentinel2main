'use server';
/**
 * @fileOverview This file defines a unified Genkit flow for comprehensive link analysis.
 *
 * This single flow performs risk assessment, malicious content detection, and provides safety advice,
 * consolidating the logic from multiple flows into one for improved performance.
 *
 * @exports `analyzeLink` - The main function to initiate the unified link analysis flow.
 * @exports `UnifiedLinkAnalysisInput` - The TypeScript type definition for the input to the flow.
 * @exports `UnifiedLinkAnalysisOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UnifiedLinkAnalysisInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze.'),
});
export type UnifiedLinkAnalysisInput = z.infer<typeof UnifiedLinkAnalysisInputSchema>;

const UnifiedLinkAnalysisOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether the link is determined to be malicious.'),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A numerical score representing the risk level of the link (0-100).'),
  explanation: z
    .string()
    .describe('A detailed explanation for the risk score and malicious determination.'),
  recommendedActions: z
    .string()
    .describe('Clear, actionable steps the user should take if the link is malicious.'),
  advice: z
    .string()
    .optional()
    .describe('If the link is malicious, advice on what to do if the user has already clicked it.'),
});
export type UnifiedLinkAnalysisOutput = z.infer<typeof UnifiedLinkAnalysisOutputSchema>;

export async function analyzeLink(input: UnifiedLinkAnalysisInput): Promise<UnifiedLinkAnalysisOutput> {
  return unifiedLinkAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'unifiedLinkAnalysisPrompt',
  input: {schema: UnifiedLinkAnalysisInputSchema},
  output: {schema: UnifiedLinkAnalysisOutputSchema},
  prompt: process.env.UNIFIED_LINK_ANALYSIS_PROMPT!,
});

const unifiedLinkAnalysisFlow = ai.defineFlow(
  {
    name: 'unifiedLinkAnalysisFlow',
    inputSchema: UnifiedLinkAnalysisInputSchema,
    outputSchema: UnifiedLinkAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
