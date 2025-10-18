'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-concise-summary.ts';
import '@/ai/flows/extract-medical-data.ts';
import '@/ai/flows/ocr-document.ts';
import '@/ai/flows/assess-symptoms.ts';
