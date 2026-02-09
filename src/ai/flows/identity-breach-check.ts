'use server';
/**
 * @fileOverview This file defines a Genkit flow for simulating an identity breach check.
 *
 * @exports `checkIdentityBreach` - The main function to initiate the breach check flow.
 * @exports `IdentityBreachInput` - The TypeScript type definition for the input to the flow.
 * @exports `IdentityBreachOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentityBreachInputSchema = z.object({
  email: z.string().email().describe('The email address to check for breaches.'),
});
export type IdentityBreachInput = z.infer<typeof IdentityBreachInputSchema>;

const IdentityBreachOutputSchema = z.object({
  isBreached: z.boolean().describe('Whether the email was found in a simulated breach.'),
  breachDetails: z.string().describe('A summary of the findings. If breached, mention the fake source.'),
});
export type IdentityBreachOutput = z.infer<typeof IdentityBreachOutputSchema>;

export async function checkIdentityBreach(input: IdentityBreachInput): Promise<IdentityBreachOutput> {
  return identityBreachCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identityBreachCheckPrompt',
  input: {schema: IdentityBreachInputSchema},
  output: {schema: IdentityBreachOutputSchema},
  prompt: process.env.IDENTITY_BREACH_CHECK_PROMPT!,
});

const identityBreachCheckFlow = ai.defineFlow(
  {
    name: 'identityBreachCheckFlow',
    inputSchema: IdentityBreachInputSchema,
    outputSchema: IdentityBreachOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
