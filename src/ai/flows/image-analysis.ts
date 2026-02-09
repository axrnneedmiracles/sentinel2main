'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting a URL from an image.
 *
 * @exports `extractUrlFromImage` - The main function to initiate the URL extraction flow.
 * @exports `ImageUrlInput` - The TypeScript type definition for the input to the flow.
 * @exports `ImageUrlOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageUrlInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageUrlInput = z.infer<typeof ImageUrlInputSchema>;

const ImageUrlOutputSchema = z.object({
  url: z.string().optional().describe('The URL extracted from the image. If no URL is found, this can be empty.'),
});
export type ImageUrlOutput = z.infer<typeof ImageUrlOutputSchema>;

export async function extractUrlFromImage(input: ImageUrlInput): Promise<ImageUrlOutput> {
  return extractUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractUrlFromImagePrompt',
  input: {schema: ImageUrlInputSchema},
  output: {schema: ImageUrlOutputSchema},
  prompt: process.env.EXTRACT_URL_FROM_IMAGE_PROMPT!,
});

const extractUrlFlow = ai.defineFlow(
  {
    name: 'extractUrlFlow',
    inputSchema: ImageUrlInputSchema,
    outputSchema: ImageUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
