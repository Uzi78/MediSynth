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
  const trimmedText = input.documentText.trim();
  
  // Validation 1: Check for empty or minimal content
  if (!trimmedText || trimmedText.length < 20) {
    return {
      diagnosis: [],
      medications: [],
      labResults: [],
    };
  }
  
  // Validation 2: Check for basic medical terminology
  const hasMedicalContent = /\b(diagnosis|diagnosed|medication|prescription|rx|lab|test|result|patient|doctor|mg|ml|mcg|blood|dose|report)\b/i.test(trimmedText);
  
  if (!hasMedicalContent) {
    return {
      diagnosis: [],
      medications: [],
      labResults: [],
    };
  }
  
  // Call the AI flow
  const result = await extractMedicalDataFlow(input);
  
  // Validation 3: Check for hallucination indicators
  const hallucinationKeywords = ['example', 'sample', 'placeholder', 'demo', 'test data'];
  const hasHallucinations = (
    result.diagnosis.some(d => hallucinationKeywords.some(kw => d.toLowerCase().includes(kw))) ||
    result.medications.some(m => hallucinationKeywords.some(kw => m.name.toLowerCase().includes(kw))) ||
    result.labResults.some(l => hallucinationKeywords.some(kw => l.test.toLowerCase().includes(kw)))
  );
  
  if (hasHallucinations) {
    console.warn('Detected potential hallucinations in extracted data, returning empty result');
    return {
      diagnosis: [],
      medications: [],
      labResults: [],
    };
  }
  
  return result;
}

const extractMedicalDataPrompt = ai.definePrompt({
  name: 'extractMedicalDataPrompt',
  input: {schema: ExtractMedicalDataInputSchema},
  output: {schema: ExtractMedicalDataOutputSchema},
  prompt: `You are an AI assistant that extracts structured medical data from raw text.

CRITICAL RULES:
1. ONLY extract information that is EXPLICITLY present in the document text
2. DO NOT infer, assume, or generate any medical information
3. DO NOT create example or placeholder data
4. If the document is blank, empty, or contains no medical information, return empty arrays for ALL fields
5. If you cannot find specific information (e.g., no medications listed), leave that array empty

Document Text:
{{{documentText}}}

Extract the following information ONLY if explicitly present:
- Diagnoses
- Medications (name, dosage, frequency)
- Lab Results (test, value, range, status)

Return the extracted information in JSON format with these keys:
- diagnosis: Array of diagnosis strings (empty if none found)
- medications: Array of medication objects (empty if none found)
- labResults: Array of lab result objects (empty if none found)

If the document text is empty, contains only whitespace, or has no medical content, you MUST return:
{
  "diagnosis": [],
  "medications": [],
  "labResults": []
}
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
