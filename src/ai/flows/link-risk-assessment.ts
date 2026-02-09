'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing the risk level of a given link.
 *
 * The flow takes a URL as input and returns a risk score and a determination of whether the link is malicious.
 *
 * @remarks
 * The flow uses a prompt to instruct the LLM to analyze the link and provide a risk assessment.
 *
 * @exports `assessLinkRisk` - The exported function that initiates the link risk assessment flow.
 * @exports `LinkRiskAssessmentInput` - The TypeScript type definition for the input to the flow.
 * @exports `LinkRiskAssessmentOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkRiskAssessmentInputSchema = z.object({
  url: z.string().url().describe('The URL to assess for risk.'),
});
export type LinkRiskAssessmentInput = z.infer<typeof LinkRiskAssessmentInputSchema>;

const LinkRiskAssessmentOutputSchema = z.object({
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A numerical score representing the risk level of the link (0-100).'),
  isMalicious: z.boolean().describe('Whether the link is determined to be malicious.'),
  reason: z.string().describe('The reason for the risk score and malicious determination'),
  solution: z.string().describe('If the link is malicious, what should the user do?'),
});
export type LinkRiskAssessmentOutput = z.infer<typeof LinkRiskAssessmentOutputSchema>;

export async function assessLinkRisk(input: LinkRiskAssessmentInput): Promise<LinkRiskAssessmentOutput> {
  return assessLinkRiskFlow(input);
}

const assessLinkRiskPrompt = ai.definePrompt({
  name: 'assessLinkRiskPrompt',
  input: {schema: LinkRiskAssessmentInputSchema},
  output: {schema: LinkRiskAssessmentOutputSchema},
  prompt: process.env.ASSESS_LINK_RISK_PROMPT!,
});

const assessLinkRiskFlow = ai.defineFlow(
  {
    name: 'assessLinkRiskFlow',
    inputSchema: LinkRiskAssessmentInputSchema,
    outputSchema: LinkRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await assessLinkRiskPrompt(input);
    return output!;
  }
);
