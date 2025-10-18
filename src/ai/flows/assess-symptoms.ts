'use server';
/**
 * @fileOverview This flow assesses a patient's symptoms and provides a triage assessment.
 *
 * - assessSymptoms - A function that takes a patient's complaint and returns an urgency assessment.
 * - AssessSymptomsInput - The input type for the assessSymptoms function.
 * - AssessSymptomsOutput - The return type for the assessSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSymptomsInputSchema = z.object({
  complaint: z.string().describe("The patient's description of their primary symptom or complaint."),
});
export type AssessSymptomsInput = z.infer<typeof AssessSymptomsInputSchema>;

const AssessSymptomsOutputSchema = z.object({
    urgency: z.enum(['High', 'Medium', 'Low']).describe('The assessed urgency level for the medical complaint.'),
    suggestedConditions: z.array(z.string()).describe('A list of 2-3 possible related conditions based on the complaint.'),
});
export type AssessSymptomsOutput = z.infer<typeof AssessSymptomsOutputSchema>;

export async function assessSymptoms(input: AssessSymptomsInput): Promise<AssessSymptomsOutput> {
  return assessSymptomsFlow(input);
}

const assessSymptomsPrompt = ai.definePrompt({
  name: 'assessSymptomsPrompt',
  input: {schema: AssessSymptomsInputSchema},
  output: {schema: AssessSymptomsOutputSchema},
  prompt: `You are an expert AI medical triage assistant. Your role is to assess a patient's complaint and provide a preliminary urgency level and a list of possible related conditions.

CRITICAL INSTRUCTIONS:
1.  **Analyze Urgency:** Based on the complaint, determine if it requires High, Medium, or Low urgency attention.
    *   **High Urgency:** Chest pain, difficulty breathing, severe pain, signs of stroke (FAST), heavy bleeding, sudden confusion, loss of consciousness.
    *   **Medium Urgency:** Fever with rash, persistent vomiting/diarrhea, moderate pain, worsening but not severe symptoms.
    *   **Low Urgency:** Mild cold/flu symptoms, minor cuts, skin rashes without fever, general aches.
2.  **Suggest Conditions:** Provide a list of 2-3 common, possible conditions related to the complaint. DO NOT provide a definitive diagnosis. Frame them as possibilities (e.g., "Could be related to...").
3.  **Disclaimer:** Your output is for triage purposes only and is not a medical diagnosis. The structured JSON output is sufficient; no need to add a disclaimer text field.

PATIENT'S COMPLAINT:
{{{complaint}}}

Based on this complaint, provide the structured JSON output with the urgency and a list of suggested conditions.
`,
});

const assessSymptomsFlow = ai.defineFlow(
  {
    name: 'assessSymptomsFlow',
    inputSchema: AssessSymptomsInputSchema,
    outputSchema: AssessSymptomsOutputSchema,
  },
  async input => {
    const {output} = await assessSymptomsPrompt(input);
    return output!;
  }
);
