'use server';

/**
 * @fileOverview This flow extracts structured medical data from a document image or PDF.
 *
 * - extractMedicalData - A function that takes a document and extracts medical information.
 * - ExtractMedicalDataInput - The input type for the extractMedicalData function.
 * - ExtractMedicalDataOutput - The return type for the extractMedicalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMedicalDataInputSchema = z.object({
  documentText: z.string().describe("The raw text content of a medical document (e.g., lab report, prescription)."),
});
export type ExtractMedicalDataInput = z.infer<typeof ExtractMedicalDataInputSchema>;

const ExtractMedicalDataOutputSchema = z.object({
  diagnosis: z.array(z.string()).describe('A list of diagnoses extracted from the document.'),
  medications: z.array(
    z.object({
      name: z.string().describe('The name of the medication.'),
      dosage: z.string().describe('The dosage of the medication.'),
      frequency: z.string().describe('The frequency of the medication.'),
    })
  ).describe('A list of medications extracted from the document.'),
  labResults: z.array(
    z.object({
      test: z.string().describe('The name of the lab test.'),
      value: z.string().describe('The value of the lab test.'),
      range: z.string().describe('The normal range for the lab test.'),
      status: z.string().describe('The status of the lab test (High, Normal, Low).'),
    })
  ).describe('A list of lab results extracted from the document.'),
});
export type ExtractMedicalDataOutput = z.infer<typeof ExtractMedicalDataOutputSchema>;

export async function extractMedicalData(input: ExtractMedicalDataInput): Promise<ExtractMedicalDataOutput> {
  return extractMedicalDataFlow(input);
}

const extractMedicalDataPrompt = ai.definePrompt({
  name: 'extractMedicalDataPrompt',
  input: {schema: ExtractMedicalDataInputSchema},
  output: {schema: ExtractMedicalDataOutputSchema},
  prompt: `You are an AI assistant that extracts structured medical data from raw text.

  Analyze the following medical document text and extract the following information:
  - Diagnoses
  - Medications (name, dosage, frequency)
  - Lab Results (test, value, range, status)

  Document Text:
  {{{documentText}}}

  Return the extracted information in JSON format. The JSON should have the following keys:
  - diagnosis: A list of diagnoses.
  - medications: A list of medications, where each medication has a name, dosage, and frequency.
  - labResults: A list of lab results, where each result has a test, value, range, and status.
  
  If a field is not present in the document, return an empty array or object for it. Do not hallucinate data.
  Follow the schema descriptions for each of the fields.
  `,
});

const extractMedicalDataFlow = ai.defineFlow(
  {
    name: 'extractMedicalDataFlow',
    inputSchema: ExtractMedicalDataInputSchema,
    outputSchema: ExtractMedicalDataOutputSchema,
  },
  async input => {
    const {output} = await extractMedicalDataPrompt(input);
    return output!;
  }
);
