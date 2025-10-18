'use client';
import { doc, updateDoc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Consultation } from '@/lib/types';

/**
 * Updates a consultation's status to 'accepted' and adds the patient
 * to the doctor's patient list.
 * @param firestore - The Firestore instance.
 * @param consultation - The full consultation object.
 */
export async function acceptConsultation(firestore: Firestore, consultation: Consultation) {
  const consultationRef = doc(firestore, 'consultations', consultation.id);
  const updateData = {
    status: 'accepted',
    scheduledFor: new Date().toISOString(), // Placeholder: schedule for now
  };
  
  // 1. Update the consultation status
  await updateDoc(consultationRef, updateData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: consultationRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error accepting consultation:", permissionError);
        // Throw to prevent the next step if this fails
        throw permissionError;
    });

  // 2. Add patient to the doctor's patient list subcollection
  const doctorPatientRef = doc(firestore, 'doctors', consultation.doctorId, 'patients', consultation.patientId);
  const doctorPatientData = {
      id: consultation.patientId,
      name: consultation.patientName,
      age: consultation.patientAge,
      gender: consultation.patientGender,
      recordCount: 0, // A new patient relationship starts with 0 records initially
  };

  setDoc(doctorPatientRef, doctorPatientData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: doctorPatientRef.path,
          operation: 'create',
          requestResourceData: doctorPatientData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error adding patient to doctor's list:", permissionError);
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
