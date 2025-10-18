# MediSynth: AI-Powered Medical Records Platform

MediSynth is an intelligent web application designed to help users digitize, understand, and manage their medical records. By leveraging a powerful AI pipeline, users can upload images or PDF documents of their medical reports and receive a structured, consolidated, and easy-to-understand summary of their health information.

## Key Features

### 1. AI-Powered Data Extraction Pipeline
At the core of MediSynth is a multi-step AI process that intelligently extracts and structures data from medical documents.

- **Optical Character Recognition (OCR)**: Automatically extracts raw text from uploaded images and PDF files.
- **Structured Data Extraction**: A sophisticated AI model processes the raw text to identify and categorize key medical information, including:
  - **Diagnoses**: Medical conditions and findings.
  - **Medications**: Prescribed drugs, including their dosage and frequency.
  - **Lab Results**: Specific test names, values, reference ranges, and status (High, Normal, Low).
- **Concise Summarization**: The AI generates a brief, human-readable summary for each document, highlighting the most important findings.
- **Robust Validation**: The pipeline includes multiple layers of validation to prevent AI "hallucinations." It intelligently detects if a document is blank or irrelevant, prevents invalid data from being saved, and notifies the user.

### 2. Modern & Intuitive User Interface
The application is built with a clean, responsive, and user-friendly interface using a modern tech stack.

- **Sidebar Navigation**: A persistent left sidebar provides easy access to all major features.
- **Dynamic Views**: The main content area updates dynamically based on the user's selection, providing a seamless single-page application experience.
- **ShadCN UI Components**: The UI is built with the popular and accessible ShadCN component library for a polished and consistent look and feel.

### 3. Core Application Views
MediSynth is organized into three primary views, accessible from the sidebar:

- **Upload New Document**: A drag-and-drop interface allows users to easily upload one or more medical documents. A real-time pipeline visualization shows the progress of the AI processing stages (Upload, OCR, Extraction, Summary, Complete).
- **View History**: A comprehensive view of all previously processed records. It features a chronological list of documents. Selecting a record displays its full, structured details, including diagnoses, medications, and lab results in an organized format.
- **Consolidated Report**: This powerful feature aggregates data from all uploaded documents into a single, unified health summary.

### 4. Consolidated Health Report
The consolidated report provides a holistic overview of the patient's health history by merging data from all records.

- **Health Summary**: High-level statistics including total record count, the date range of all documents, and a count of unique diagnoses and medications.
- **Key Diagnoses**: A table of all unique diagnoses, showing how many times each has been mentioned and the date it first appeared.
- **Current Medications**: A clean list of all unique medications, displaying the most recently recorded dosage and frequency.
- **Lab Result Trends**: For each lab test with numerical data, a visual chart displays the trend of the values over time, helping to track improvements or declines in health markers.

### 5. Secure User Authentication
The platform ensures user data is private and secure.

- **Email & Password Authentication**: Users can create an account and log in securely.
- **Firestore Security**: All medical records are stored in Firestore and are protected by security rules, ensuring that each user can only access their own data.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Generative AI**: Google Genkit, Google AI (Gemini models)
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Deployment**: Firebase App Hosting
