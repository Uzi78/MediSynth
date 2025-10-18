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

const SymptomSchema = z.object({
    description: z.string().describe('A detailed description of a single symptom.'),
    severity: z.enum(['Mild', 'Moderate', 'Severe']).describe('The severity of the symptom.'),
    duration: z.string().describe('How long the patient has been experiencing the symptom (e.g., "3 days", "2 weeks").'),
});

const AssessSymptomsInputSchema = z.object({
  symptoms: z.array(SymptomSchema).min(1).describe("A list of the patient's symptoms, including their description, severity, and duration."),
});
export type AssessSymptomsInput = z.infer<typeof AssessSymptomsInputSchema>;

const AssessSymptomsOutputSchema = z.object({
    urgency: z.enum(['Urgent', 'Moderate', 'Routine']).describe('The assessed urgency level for the medical complaint.'),
    suggestedConditions: z.array(z.string()).describe('A list of 2-3 possible related conditions based on the complaint.'),
    recommendedAction: z.string().describe('A recommended action for the patient based on the urgency (e.g., "Seek immediate medical care", "Schedule an appointment with a doctor", "Monitor symptoms and consider self-care").')
});
export type AssessSymptomsOutput = z.infer<typeof AssessSymptomsOutputSchema>;

export async function assessSymptoms(input: AssessSymptomsInput): Promise<AssessSymptomsOutput> {
  return assessSymptomsFlow(input);
}

const assessSymptomsPrompt = ai.definePrompt({
  name: 'assessSymptomsPrompt',
  input: {schema: AssessSymptomsInputSchema},
  output: {schema: AssessSymptomsOutputSchema},
  prompt: `You are an expert AI medical triage assistant. Your role is to assess a patient's reported symptoms and provide a preliminary urgency level, a list of possible related conditions, and a recommended next step.

CRITICAL INSTRUCTIONS:
1.  **Analyze Urgency:** Based on the combination of symptoms, their severity, and duration, determine if it requires Urgent, Moderate, or Routine attention.
    *   **Urgent:** Severe symptoms (e.g., chest pain, difficulty breathing, severe pain, signs of stroke, heavy bleeding, sudden confusion, loss of consciousness).
    *   **Moderate:** Worsening symptoms, moderate pain, fever with other concerning signs (like a rash).
    *   **Routine:** Mild, stable symptoms (e.g., mild cold, minor aches, stable skin rash).
2.  **Suggest Conditions:** Provide a list of 2-3 common, possible conditions related to the symptoms. DO NOT provide a definitive diagnosis. Frame them as possibilities (e.g., "Could be related to...").
3.  **Recommend Action:** Based on the urgency level, provide a clear, actionable recommendation.
    *   If 'Urgent', recommend: "Seek immediate medical care at the nearest emergency room."
    *   If 'Moderate', recommend: "Schedule an appointment with a doctor soon."
    *   If 'Routine', recommend: "Monitor symptoms and consider self-care. If symptoms worsen, schedule an appointment."
4.  **Disclaimer:** Your output is for triage purposes only and is not a medical diagnosis. The structured JSON output is sufficient; no need to add a disclaimer text field.

PATIENT'S SYMPTOMS:
{{#each symptoms}}
- Symptom: {{{this.description}}}, Severity: {{{this.severity}}}, Duration: {{{this.duration}}}
{{/each}}

Based on this information, provide the structured JSON output with the urgency, suggested conditions, and recommended action.
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
