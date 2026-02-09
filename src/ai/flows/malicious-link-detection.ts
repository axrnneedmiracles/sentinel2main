'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting malicious links.
 *
 * The flow takes a URL as input and returns a risk assessment indicating whether the link is potentially malicious.
 *
 * @interface MaliciousLinkDetectionInput - The input schema for the malicious link detection flow.
 * @interface MaliciousLinkDetectionOutput - The output schema for the malicious link detection flow.
 * @function maliciousLinkDetection - The main function to initiate the malicious link detection flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaliciousLinkDetectionInputSchema = z.object({
  url: z.string().url().describe('The URL to check for malicious content.'),
});
export type MaliciousLinkDetectionInput = z.infer<typeof MaliciousLinkDetectionInputSchema>;

const MaliciousLinkDetectionOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether the link is considered malicious.'),
  riskScore: z.number().describe('A score indicating the risk level of the link (0-1, higher is riskier).'),
  explanation: z.string().describe('An explanation of why the link is considered malicious or safe.'),
  recommendedActions: z.string().describe('Recommended actions if the user has already clicked the link.'),
});
export type MaliciousLinkDetectionOutput = z.infer<typeof MaliciousLinkDetectionOutputSchema>;

export async function maliciousLinkDetection(input: MaliciousLinkDetectionInput): Promise<MaliciousLinkDetectionOutput> {
  return maliciousLinkDetectionFlow(input);
}

const maliciousLinkDetectionPrompt = ai.definePrompt({
  name: 'maliciousLinkDetectionPrompt',
  input: {schema: MaliciousLinkDetectionInputSchema},
  output: {schema: MaliciousLinkDetectionOutputSchema},
  prompt: process.env.MALICIOUS_LINK_DETECTION_PROMPT!,
});

const maliciousLinkDetectionFlow = ai.defineFlow(
  {
    name: 'maliciousLinkDetectionFlow',
    inputSchema: MaliciousLinkDetectionInputSchema,
    outputSchema: MaliciousLinkDetectionOutputSchema,
  },
  async input => {
    const {output} = await maliciousLinkDetectionPrompt(input);
    return output!;
  }
);
