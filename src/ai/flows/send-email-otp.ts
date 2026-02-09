'use server';
/**
 * @fileOverview This file defines a Genkit flow for sending an email with a One-Time Password (OTP).
 *
 * @exports `sendEmailOtp` - The main function to initiate the OTP sending flow.
 * @exports `EmailOtpInput` - The TypeScript type definition for the input to the flow.
 * @exports `EmailOtpOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailOtpInputSchema = z.object({
  email: z.string().email().describe('The email address to send the OTP to.'),
});
export type EmailOtpInput = z.infer<typeof EmailOtpInputSchema>;

const EmailOtpOutputSchema = z.object({
  otp: z.string().length(6).describe('The 6-digit One-Time Password.'),
});
export type EmailOtpOutput = z.infer<typeof EmailOtpOutputSchema>;

export async function sendEmailOtp(input: EmailOtpInput): Promise<EmailOtpOutput> {
  return sendEmailOtpFlow(input);
}

const sendEmailOtpFlow = ai.defineFlow(
  {
    name: 'sendEmailOtpFlow',
    inputSchema: EmailOtpInputSchema,
    outputSchema: EmailOtpOutputSchema,
  },
  async ({email}) => {
    // In a real application, you would integrate with an email service like SendGrid or AWS SES here.
    // For this prototype, we'll generate a random OTP and return it directly.
    // This simulates the email being "sent".
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // We can still use the LLM to generate a sample email body for logging or testing purposes.
    const emailBodyPrompt = `
      You are an automated security system.
      A user with the email '{{email}}' has requested a login code.
      The one-time password is: {{otp}}
      This code will expire in 10 minutes.

      Generate a simple, clear email body containing this information.
    `;

    // This generate call is for simulation/logging and doesn't actually send the email.
    ai.generate({
      prompt: emailBodyPrompt,
      input: {email, otp},
    });

    return {otp};
  }
);
