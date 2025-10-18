'use client';
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generateConciseSummary } from '@/ai/flows/generate-concise-summary';
import type { Prescription, Record as RecordType } from '@/lib/types';

/**
 * Creates a new prescription record in the patient's subcollection.
 * @param firestore - The Firestore instance.
 * @param doctorId - The ID of the doctor sending the prescription.
 * @param patientId - The ID of the patient receiving the prescription.
 * @param prescriptionData - The data for the prescription from the form.
 */
export async function sendPrescriptionToPatient(
    firestore: Firestore,
    doctorId: string,
    patientId: string,
    prescriptionData: Prescription
) {
    const patientRecordsRef = collection(firestore, 'users', patientId, 'patients', patientId, 'records');

    // Map form data to record data format
    const medicationsForRecord = prescriptionData.medications.map(med => ({
        name: med.drug,
        dosage: `${med.strength} ${med.form}`,
        frequency: `${med.dosage}, ${med.frequency} for ${med.duration}`
    }));

    const recordForSummary: Omit<RecordType, 'patientId' | 'rawDocument' | 'summary'> = {
        id: crypto.randomUUID(), // Add a temporary ID for validation
        status: 'processing', // Add a status for validation
        date: new Date().toISOString(),
        type: 'Prescription',
        extractedData: {
            diagnosis: [],
            medications: medicationsForRecord,
            labResults: [],
        },
    };

    // Generate a summary for the new record
    const { summary } = await generateConciseSummary({ record: recordForSummary as any });
    
    const newRecord: Omit<RecordType, 'id'> = {
        patientId: patientId,
        date: new Date().toISOString(),
        type: "Prescription",
        status: "completed",
        summary: summary || "New prescription issued.",
        rawDocument: `Prescription from Dr. (ID: ${doctorId})\n\nMedications:\n${medicationsForRecord.map(m => `- ${m.name} ${m.dosage}, ${m.frequency}`).join('\n')}\n\nInstructions: ${prescriptionData.instructions || 'N/A'}`,
        extractedData: {
            diagnosis: [],
            medications: medicationsForRecord,
            labResults: [],
        }
    };

    // Add the new record to the patient's records collection
    addDoc(patientRecordsRef, newRecord)
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: patientRecordsRef.path,
                operation: 'create',
                requestResourceData: newRecord,
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error creating prescription record:", permissionError);
            throw permissionError;
        });
}
