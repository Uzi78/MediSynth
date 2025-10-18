'use server';
/**
 * @fileOverview A concise summary generator for medical records.
 *
 * - generateConciseSummary - A function that generates a concise summary of medical records.
 * - GenerateConciseSummaryInput - The input type for the generateConciseSummary function.
 * - GenerateConciseSummaryOutput - The return type for the generateConciseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConciseSummaryInputSchema = z.object({
  record: z.object({
    id: z.string(),
    date: z.string(),
    type: z.string(),
    status: z.string(),
    extractedData: z.object({
      diagnosis: z.array(z.string()),
      medications: z.array(
        z.object({
          name: z.string(),
          dosage: z.string(),
          frequency: z.string(),
        })
      ),
      labResults: z.array(
        z.object({
          test: z.string(),
          value: z.string(),
          range: z.string(),
          status: z.string(),
        })
      ),
    }),
    summary: z.string().optional(),
    rawDocument: z.string().optional(),
  }),
});
export type GenerateConciseSummaryInput = z.infer<typeof GenerateConciseSummaryInputSchema>;

const GenerateConciseSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical record.'),
});
export type GenerateConciseSummaryOutput = z.infer<typeof GenerateConciseSummaryOutputSchema>;

export async function generateConciseSummary(
  input: GenerateConciseSummaryInput
): Promise<GenerateConciseSummaryOutput> {
  return generateConciseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConciseSummaryPrompt',
  input: {schema: GenerateConciseSummaryInputSchema},
  output: {schema: GenerateConciseSummaryOutputSchema},
  prompt: `You are an expert medical summarizer. Please summarize the following medical record concisely and accurately in 2-3 sentences. Focus on the key diagnoses and findings.\n\nRecord Type: {{{record.type}}}\nDate: {{{record.date}}}\n\nDiagnoses: {{#each record.extractedData.diagnosis}} - {{{this}}}{{/each}}\n\nMedications: {{#each record.extractedData.medications}} - {{{this.name}}} ({{{this.dosage}}}, {{{this.frequency}}}){{/each}}\n\nLab Results: {{#each record.extractedData.labResults}} - {{{this.test}}}: {{{this.value}}} (Range: {{{this.range}}}, Status: {{{this.status}}}){{/each}}`,
});

const generateConciseSummaryFlow = ai.defineFlow(
  {
    name: 'generateConciseSummaryFlow',
    inputSchema: GenerateConciseSummaryInputSchema,
    outputSchema: GenerateConciseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
