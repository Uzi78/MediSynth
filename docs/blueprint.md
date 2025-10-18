# **App Name**: MediSynth

## Core Features:

- File Upload: Allow users to upload medical records in PDF, JPG, JPEG, and PNG formats via drag-and-drop or file selection.
- Document Processing Pipeline: Orchestrate a 5-stage pipeline including Upload, OCR, Extraction, Summarization, and Organization Agents. Simulate asynchronous processing with setTimeout delays.
- Data Extraction: Leverage a Large Language Model (LLM) tool to automatically extract structured medical data (diagnoses, medications, lab results) from uploaded documents. Then use the extracted data for organization, concision, and contextual summarization. LLM acts as a tool to consolidate all important facts about the medical document in its output.
- Patient Portal: Enable patients to upload and track the processing status of their medical records. Each record shows the current stage with a progress bar and completion status.
- Doctor Dashboard: Provide a dashboard for doctors to view a scrollable list of patients and access both summary and detailed views of their medical records.
- Concise Summary View: Display quick stats (diagnoses, medications, records counts), latest visit summary, active conditions, and current medications for selected patients.
- Detailed View: Offer a detailed view with a chronological timeline of records. Include structured data (diagnoses, medications, lab results) and a raw document view option.

## Style Guidelines:

- Background: Gradient from light blue (#EFF6FF) to light indigo (#E0E7FF) to give a clean healthcare feel.
- Primary color: Blue (#2563EB) to convey trust and professionalism.
- Accent color: Red for alerts and diagnoses, Green for success and completed tasks, each in the range of shades from 50 to 600.
- Font: 'Inter', a sans-serif font, for both headlines and body text, offering a modern, clean and neutral aesthetic.
- Lucide React icons used consistently throughout the application, adding clarity and a unified visual language.
- Card-based layout with white cards and subtle shadows to improve information hierarchy and readability. Use a 12-column grid layout for responsiveness.
- Smooth transitions and hover effects to enhance user interaction and provide visual feedback during interactions such as file uploads, tab switching, and record selection.