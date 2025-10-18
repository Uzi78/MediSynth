'use server';

/**
 * @fileOverview This flow performs OCR on a document and returns the raw text.
 *
 * - ocrDocument - A function that takes a document and returns its text content.
 * - OcrDocumentInput - The input type for the ocrDocument function.
 * - OcrDocumentOutput - The return type for the ocrDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OcrDocumentInputSchema = z.object({
  documentUri: z.string().describe("A medical document (e.g., lab report, prescription) as a data URI. It must include a MIME type (e.g., 'data:image/png;base64,...' or 'data:application/pdf;base64,...')."),
});
export type OcrDocumentInput = z.infer<typeof OcrDocumentInputSchema>;

const OcrDocumentOutputSchema = z.object({
  rawText: z.string().describe('The raw text extracted from the document.'),
});
export type OcrDocumentOutput = z.infer<typeof OcrDocumentOutputSchema>;

export async function ocrDocument(input: OcrDocumentInput): Promise<OcrDocumentOutput> {
  return ocrDocumentFlow(input);
}

const ocrDocumentPrompt = ai.definePrompt({
  name: 'ocrDocumentPrompt',
  input: {schema: OcrDocumentInputSchema},
  output: {schema: OcrDocumentOutputSchema},
  prompt: `You are an AI assistant that performs Optical Character Recognition (OCR) on a document.
  
  Extract all the text from the following document.
  
  Document: {{media url=documentUri}}
  
  Return the extracted text in the 'rawText' field.`,
});

const ocrDocumentFlow = ai.defineFlow(
  {
    name: 'ocrDocumentFlow',
    inputSchema: OcrDocumentInputSchema,
    outputSchema: OcrDocumentOutputSchema,
  },
  async input => {
    const {output} = await ocrDocumentPrompt(input);
    return output!;
  }
);
