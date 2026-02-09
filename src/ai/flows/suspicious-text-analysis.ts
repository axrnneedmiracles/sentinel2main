'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing text for suspicious content.
 *
 * @exports `analyzeSuspiciousText` - The main function to initiate the text analysis flow.
 * @exports `SuspiciousTextInput` - The TypeScript type definition for the input to the flow.
 * @exports `SuspiciousTextOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuspiciousTextInputSchema = z.object({
  text: z.string().describe('The text to analyze for suspicious content.'),
});
export type SuspiciousTextInput = z.infer<typeof SuspiciousTextInputSchema>;

const SuspiciousTextOutputSchema = z.object({
  analysis: z.string().describe('A brief analysis of the text, highlighting any suspicious elements or confirming its safety.'),
  isSuspicious: z.boolean().describe('Whether the text is determined to be suspicious.'),
});
export type SuspiciousTextOutput = z.infer<typeof SuspiciousTextOutputSchema>;

export async function analyzeSuspiciousText(input: SuspiciousTextInput): Promise<SuspiciousTextOutput> {
  return suspiciousTextAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suspiciousTextAnalysisPrompt',
  input: {schema: SuspiciousTextInputSchema},
  output: {schema: SuspiciousTextOutputSchema},
  prompt: process.env.SUSPICIOUS_TEXT_ANALYSIS_PROMPT!,
});

const suspiciousTextAnalysisFlow = ai.defineFlow(
  {
    name: 'suspiciousTextAnalysisFlow',
    inputSchema: SuspiciousTextInputSchema,
    outputSchema: SuspiciousTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
