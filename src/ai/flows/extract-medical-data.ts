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

CRITICAL EXTRACTION RULES:
1. ONLY extract information that is EXPLICITLY stated in the document
2. DO NOT infer, assume, or generate any medical information
3. DO NOT create example, sample, or placeholder data
4. If information is missing or unclear, leave that field empty
5. Preserve exact values, units, and ranges as they appear in the document

Document Text:
{{{documentText}}}

EXTRACTION GUIDELINES:

*DIAGNOSES:*
- Look for sections labeled: "Diagnosis", "Impression", "Assessment", "Clinical Diagnosis"
- Extract disease names, conditions, or medical conclusions
- Examples: "Type 2 Diabetes Mellitus", "Hypertension", "Acute Bronchitis"

*MEDICATIONS:*
- Look for sections labeled: "Medications", "Prescriptions", "Rx", "Treatment"
- Extract three components for each medication:
  * name: The medication name (e.g., "Metformin", "Lisinopril")
  * dosage: The amount and unit (e.g., "500mg", "10ml", "2 tablets")
  * frequency: How often to take it (e.g., "twice daily", "once a day", "every 8 hours", "as needed")

*LAB RESULTS (MOST IMPORTANT):*
Lab reports typically contain test results in tables or lists. Look for these patterns:

Pattern 1 - Tabular format:
Test Name          Result      Reference Range    Status
Hemoglobin         14.5 g/dL   13.0-17.0         Normal
Glucose            110 mg/dL   70-100            High

Pattern 2 - List format:
- Hemoglobin: 14.5 g/dL (13.0-17.0) Normal
- Glucose: 110 mg/dL (70-100) High
- WBC: 7.5 K/uL (4.0-11.0) Normal

Pattern 3 - Inline format:
Hemoglobin 14.5 (13.0-17.0), Glucose 110H (70-100)

Pattern 4 - Narrative/Inline format (common in medical records):
"CBC: WBC 6.8 x10^3/µL, Hgb 14.2 g/dL, Hct 42.5%, Platelets 220 x10^3/µL"
"CMP: Na 140 mmol/L, K 4.1 mmol/L, Creatinine 0.92 mg/dL"
"Lipids: Total cholesterol 198 mg/dL, LDL 118 mg/dL, HDL 48 mg/dL"

For narrative formats:
- Look for panel names (CBC, CMP, BMP, Lipid Panel) followed by test results
- Extract each test-value pair
- Use standard medical reference ranges if not explicitly stated
- Determine status based on standard medical ranges

IMPORTANT: If reference ranges are NOT provided in the document:
- You MAY use widely accepted standard medical reference ranges to populate the "range" field
- You MUST mark status as "Normal" if within standard range, "High" if above, "Low" if below
- Common standard ranges:
  * WBC: 4.0-11.0 x10^3/µL
  * Hemoglobin (male): 13.5-17.5 g/dL
  * Hematocrit (male): 38-50%
  * Platelets: 150-400 x10^3/µL
  * Sodium: 136-145 mmol/L
  * Potassium: 3.5-5.0 mmol/L
  * Creatinine (male): 0.7-1.3 mg/dL
  * eGFR: >60 mL/min/1.73m²
  * Total Cholesterol: <200 mg/dL (desirable)
  * LDL: <100 mg/dL (optimal)
  * HDL (male): >40 mg/dL
  * Triglycerides: <150 mg/dL

For EACH lab test, extract:
- test: The exact name of the test (e.g., "Hemoglobin", "Blood Glucose", "Total Cholesterol")
- value: The measured result WITH units (e.g., "14.5 g/dL", "110 mg/dL", "7.5 K/uL")
- range: The reference/normal range (e.g., "13.0-17.0", "70-100 mg/dL", "4.0-11.0 K/uL")
- status: Determine status based on comparison or explicit markers:
  * "Normal" - if value is within range or marked as normal/N
  * "High" - if value exceeds upper limit or marked as high/H/↑
  * "Low" - if value is below lower limit or marked as low/L/↓
  * "Critical" - if explicitly marked as critical or severely abnormal

Common Lab Tests to Look For:
- Complete Blood Count (CBC): Hemoglobin, Hematocrit, WBC, RBC, Platelets
- Metabolic Panel: Glucose, Sodium, Potassium, Chloride, CO2, BUN, Creatinine
- Lipid Panel: Total Cholesterol, LDL, HDL, Triglycerides
- Liver Function: ALT, AST, Alkaline Phosphatase, Bilirubin, Albumin
- Thyroid: TSH, T3, T4, Free T4
- Kidney Function: BUN, Creatinine, eGFR
- Electrolytes: Sodium, Potassium, Calcium, Magnesium
- Hemoglobin A1c (for diabetes monitoring)

IMPORTANT NOTES:
- Always include units with values (g/dL, mg/dL, mmol/L, etc.)
- Preserve the exact format of ranges as they appear
- If a status indicator (H, L, Normal, High, Low) is present, use it
- If no status indicator, compare value to range to determine status
- Handle various unit formats (g/dL, g/L, mg/dL, mmol/L, K/uL, etc.)

OUTPUT FORMAT:
Return JSON with these exact keys:
{
  "diagnosis": ["array of diagnosis strings"],
  "medications": [
    {
      "name": "medication name",
      "dosage": "amount with unit",
      "frequency": "how often"
    }
  ],
  "labResults": [
    {
      "test": "test name",
      "value": "result with unit",
      "range": "reference range",
      "status": "Normal|High|Low|Critical"
    }
  ]
}

If the document contains NO medical information or is blank, return:
{
  "diagnosis": [],
  "medications": [],
  "labResults": []
}

BEGIN EXTRACTION NOW.
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