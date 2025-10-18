'use client';
import { doc, updateDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Updates a consultation's status to 'accepted'.
 * @param firestore - The Firestore instance.
 * @param consultationId - The ID of the consultation document.
 */
export async function acceptConsultation(firestore: Firestore, consultationId: string) {
  const consultationRef = doc(firestore, 'consultations', consultationId);
  const updateData = {
    status: 'accepted',
    scheduledFor: new Date().toISOString(), // Placeholder: schedule for now
  };
  
  updateDoc(consultationRef, updateData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: consultationRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error accepting consultation:", permissionError);
    });
}

/**
 * Updates a consultation's status to 'declined'.
 * @param firestore - The Firestore instance.
 * @param consultationId - The ID of the consultation document.
 */
export async function declineConsultation(firestore: Firestore, consultationId: string) {
  const consultationRef = doc(firestore, 'consultations', consultationId);
  const updateData = { status: 'declined' };

  updateDoc(consultationRef, updateData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: consultationRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error declining consultation:", permissionError);
    });
}
