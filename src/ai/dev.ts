import { config } from 'dotenv';
config();

import '@/ai/flows/generate-concise-summary.ts';
import '@/ai/flows/extract-medical-data.ts';
import '@/ai/flows/ocr-document.ts';
