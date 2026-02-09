'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing safety feedback on links identified as scams.
 *
 * It takes a URL as input and returns advice on what to do if the user has clicked on a malicious link.
 * @exports linkSafetyFeedback - The main function to get link safety feedback.
 * @exports LinkSafetyFeedbackInput - The input type for the linkSafetyFeedback function.
 * @exports LinkSafetyFeedbackOutput - The output type for the linkSafetyFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkSafetyFeedbackInputSchema = z.object({
  url: z.string().describe('The URL to check for safety.'),
  isScam: z.boolean().describe('Whether the link is identified as a scam.'),
});
export type LinkSafetyFeedbackInput = z.infer<typeof LinkSafetyFeedbackInputSchema>;

const LinkSafetyFeedbackOutputSchema = z.object({
  advice: z.string().describe('Advice on what to do if the user has clicked on the link, and general recourse steps.'),
});
export type LinkSafetyFeedbackOutput = z.infer<typeof LinkSafetyFeedbackOutputSchema>;

export async function linkSafetyFeedback(input: LinkSafetyFeedbackInput): Promise<LinkSafetyFeedbackOutput> {
  return linkSafetyFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'linkSafetyFeedbackPrompt',
  input: {schema: LinkSafetyFeedbackInputSchema},
  output: {schema: LinkSafetyFeedbackOutputSchema},
  prompt: process.env.LINK_SAFETY_FEEDBACK_PROMPT!,
});

const linkSafetyFeedbackFlow = ai.defineFlow(
  {
    name: 'linkSafetyFeedbackFlow',
    inputSchema: LinkSafetyFeedbackInputSchema,
    outputSchema: LinkSafetyFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
