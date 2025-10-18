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
      value: z.string().describe('The value of the lab test with units (e.g., "14.5 g/dL", "95 mg/dL").'),
      range: z.string().describe('The normal/reference range for the lab test (e.g., "13.0-17.0", "70-100 mg/dL").'),
      status: z.string().describe('The status of the lab test: "High", "Normal", "Low", or "Critical".'),
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
  const hasMedicalContent = /\b(diagnosis|diagnosed|medication|prescription|rx|lab|test|result|patient|doctor|mg|ml|mcg|blood|dose|report|hemoglobin|glucose|cholesterol|creatinine)\b/i.test(trimmedText);
  
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
  prompt: `You are an expert AI medical data extraction assistant. Your job is to accurately extract structured medical information from raw document text.

IMPORTANT GUIDELINES:
- Your primary goal is to find and extract information that is present in the document.
- Do not invent or infer information that is not supported by the text.
- If the document is blank, empty, or clearly contains no medical information, you MUST return empty arrays for ALL fields.
- If you cannot find information for a specific section (e.g., no medications are listed), return an empty array for that section.
- Preserve the exact values, units, and ranges as they appear in the document.

Document Text:
{{{documentText}}}

Please extract the following information based on the guidelines above.

*DIAGNOSES:*
- Look for sections like "Diagnosis", "Impression", "Assessment".
- Extract disease names, conditions, or medical conclusions.
- Examples: "Type 2 Diabetes Mellitus", "Hypertension", "Acute Bronchitis"

*MEDICATIONS:*
- Look for sections like "Medications", "Prescriptions", "Rx", "Treatment".
- For each medication, find the name, dosage (e.g., "500mg"), and frequency (e.g., "twice daily").

*LAB RESULTS:*
- Lab results often appear in tables or lists. Look for patterns with a test name, a result value, and a reference range.
- For each lab test, extract:
  - test: The name of the test (e.g., "Hemoglobin", "Glucose").
  - value: The measured result WITH its units (e.g., "14.5 g/dL", "110 mg/dL").
  - range: The reference/normal range (e.g., "13.0-17.0", "70-100").
  - status: Determine the status ("Normal", "High", "Low", "Critical") by looking for explicit labels (like H, L, High) or by comparing the value to the provided range.

Common Lab Tests to Look For:
- Complete Blood Count (CBC): Hemoglobin, Hematocrit, WBC, RBC, Platelets
- Metabolic Panel: Glucose, Sodium, Potassium, Creatinine
- Lipid Panel: Total Cholesterol, LDL, HDL, Triglycerides
- Hemoglobin A1c

OUTPUT FORMAT:
Return JSON with these exact keys. If a section is empty, its array must be empty.
{
  "diagnosis": ["array of diagnosis strings"],
  "medications": [
    { "name": "...", "dosage": "...", "frequency": "..." }
  ],
  "labResults": [
    { "test": "...", "value": "...", "range": "...", "status": "..." }
  ]
}

If the document text is empty or has no medical content, you MUST return:
{
  "diagnosis": [],
  "medications": [],
  "labResults": []
}

BEGIN EXTRACTION.`,
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
