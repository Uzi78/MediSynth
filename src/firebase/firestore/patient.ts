'use client';
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface ConsultationRequestData {
    patientId: string;
    patientName: string;
    patientAvatarUrl?: string;
    patientAge: number;
    patientGender: string;
    doctorId: string;
    complaint: string;
    urgency: 'High' | 'Medium' | 'Low';
}

/**
 * Creates a new consultation request document in Firestore.
 * @param firestore - The Firestore instance.
 * @param data - The data for the consultation request.
 */
export async function createConsultationRequest(firestore: Firestore, data: ConsultationRequestData) {
  const consultationRef = collection(firestore, 'consultations');
  
  const newConsultation = {
    ...data,
    status: 'pending',
    requestedAt: serverTimestamp(),
  };

  addDoc(consultationRef, newConsultation)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: consultationRef.path,
          operation: 'create',
          requestResourceData: newConsultation,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error creating consultation request:", permissionError);
        // Re-throw to allow the calling component to handle UI updates
        throw permissionError;
    });
}
