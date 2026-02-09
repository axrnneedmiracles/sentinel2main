'use server';
/**
 * @fileOverview This file defines a Genkit flow for visual analysis of an image to detect AI generation.
 *
 * @exports `performVisualAnalysis` - The main function to initiate the visual analysis flow.
 * @exports `ImageVisualAnalysisInput` - The TypeScript type definition for the input to the flow.
 * @exports `ImageVisualAnalysisOutput` - The TypeScript type definition for the output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageVisualAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageVisualAnalysisInput = z.infer<typeof ImageVisualAnalysisInputSchema>;

const ImageVisualAnalysisOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('A confidence score (0-100) indicating the likelihood that the image is AI-generated.'),
  reasons: z.array(z.string()).describe('A list of visual artifacts or reasons supporting the score.'),
});
export type ImageVisualAnalysisOutput = z.infer<typeof ImageVisualAnalysisOutputSchema>;

// This is the function that will be called from the server action.
export async function performVisualAnalysis(input: ImageVisualAnalysisInput): Promise<ImageVisualAnalysisOutput> {
  return imageForensicsAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageForensicsAnalysisPrompt',
  input: {schema: ImageVisualAnalysisInputSchema},
  output: {schema: ImageVisualAnalysisOutputSchema},
  prompt: process.env.IMAGE_FORENSICS_ANALYSIS_PROMPT!,
});

const imageForensicsAnalysisFlow = ai.defineFlow(
  {
    name: 'imageForensicsAnalysisFlow',
    inputSchema: ImageVisualAnalysisInputSchema,
    outputSchema: ImageVisualAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
