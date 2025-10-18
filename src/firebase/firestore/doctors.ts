'use client';
import { collection, query, where, getDocs, Firestore, DocumentData } from 'firebase/firestore';
import type { DoctorPatient } from '@/lib/types';

/**
 * Fetches the list of patients assigned to a specific doctor.
 * @param firestore - The Firestore instance.
 * @param doctorId - The ID of the doctor.
 * @returns A promise that resolves to an array of DoctorPatient objects.
 */
export async function getDoctorPatients(firestore: Firestore, doctorId: string): Promise<DoctorPatient[]> {
  const patientsRef = collection(firestore, 'doctors', doctorId, 'patients');
  const q = query(patientsRef);
  const querySnapshot = await getDocs(q);

  const patients: DoctorPatient[] = [];
  querySnapshot.forEach((doc) => {
    patients.push({ id: doc.id, ...(doc.data() as Omit<DoctorPatient, 'id'>) });
  });

  return patients;
}
