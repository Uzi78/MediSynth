# MediSynth: AI-Powered Medical Intelligence Platform

MediSynth is an intelligent, dual-interface web application designed to revolutionize how patients and doctors manage medical information. By leveraging a powerful AI pipeline, the platform empowers patients to digitize and understand their health records, while providing doctors with the tools to streamline consultations, manage patients, and issue digital prescriptions efficiently.

---

## Core Functionality: The AI Data Pipeline

At the heart of MediSynth is a multi-step AI process that intelligently transforms unstructured medical documents into structured, actionable data.

1.  **Optical Character Recognition (OCR)**: Automatically extracts raw text from any uploaded image or PDF document.
2.  **Structured Data Extraction**: A sophisticated AI model processes the raw text to identify and categorize key medical information, including:
    *   **Diagnoses**: Medical conditions and clinical findings.
    *   **Medications**: Prescribed drugs, including dosage and frequency.
    *   **Lab Results**: Specific test names, values, reference ranges, and their status (e.g., High, Normal, Low).
3.  **Concise Summarization**: The AI generates a brief, human-readable summary for each document, highlighting the most critical information.
4.  **Robust Validation**: The pipeline includes multiple validation layers to prevent AI "hallucinations" and ensure data integrity. It intelligently detects if a document is blank or irrelevant, prevents invalid data from being saved, and notifies the user.

---

## Key Features for Patients

The patient portal is designed to provide clarity and ownership over personal health data.

### Health Management Tools
- **Upload & Digitize**: An intuitive drag-and-drop interface to upload medical documents (images or PDFs). A real-time pipeline visualization shows the status of the AI analysis.
- **View Record History**: A chronological timeline of all processed records. Selecting a record displays its full, structured details in an organized format.
- **Consolidated Health Report**: A powerful dashboard that aggregates data from all uploaded documents into a single, unified view, featuring:
    - **Health Summary**: High-level statistics, including total records and date range.
    - **Key Diagnoses**: A table of all unique diagnoses, showing frequency and date of first appearance.
    - **Current Medications**: A clean list of all unique medications with their most recent dosage and frequency.
    - **Lab Result Trends**: Interactive charts that visualize the trend of lab values over time, helping track health markers.

### Doctor Interaction
- **AI Symptom Checker**: A preliminary assessment tool where patients can input symptoms to receive an AI-generated urgency level and a list of possible related conditions.
- **Find a Doctor**: A searchable directory of doctors on the platform. Patients can view doctor profiles and request a virtual consultation based on their symptom assessment or other needs.
- **Secure Messaging**: A private, one-on-one messaging channel with a doctor after a consultation has been accepted.

---

## Key Features for Doctors

The doctor portal provides a suite of tools to enhance patient care and streamline administrative tasks.

### Patient & Consultation Management
- **Doctor Dashboard**: A central command center showing key metrics at a glance: total patients, pending consultation requests, and recent prescriptions issued. It also provides quick access to recent messages and new consultation requests.
- **My Patients**: A comprehensive list of all patients assigned to the doctor. Selecting a patient reveals their consolidated health report, giving the doctor a complete overview of their medical history as documented in MediSynth.
- **Consultation Management**: A tabbed view to manage the entire lifecycle of patient consultations:
    - **Requests**: Review, accept, or decline new consultation requests.
    - **Scheduled & Active**: View and manage ongoing patient consultations.

### Clinical Tools
- **Write Prescription**: A dedicated interface to digitally write prescriptions. Doctors can add multiple medications, specify drug names, strength, form, dosage, and duration, and add special instructions.
- **Send Prescription to Patient**: Once created, the prescription is saved as a new, structured record directly into the patient's medical history within the app, making it instantly accessible to them.
- **Secure Patient Messaging**: A dedicated, secure chat interface to communicate directly with patients who have active consultations, allowing for follow-up questions and ongoing care.

---

## Security and Authentication

- **Role-Based Access**: Users sign up as either a "Patient" or a "Doctor," with the interface and permissions tailored to their role.
- **Private & Secure Data**: The platform is built on Firebase and leverages Firestore Security Rules to enforce strict data privacy. Each user (patient or doctor) can only access the data they are explicitly authorized to view.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Generative AI**: Google Genkit, Google AI (Gemini models)
- **Backend & Database**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Firebase App Hosting
