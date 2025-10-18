'use client';

import { useState } from 'react';
import type { Patient } from '@/lib/types';
import PatientList from './patient-list';
import PatientDetails from './patient-details';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collectionGroup, query } from 'firebase/firestore';

export default function DoctorDashboard() {
  const firestore = useFirestore();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const patientsQuery = useMemoFirebase(() => 
    firestore ? query(collectionGroup(firestore, 'patients')) : null
  , [firestore]);

  const { data: patients, isLoading: isLoadingPatients } = useCollection<Omit<Patient, 'records'>>(patientsQuery);

  const recordsQuery = useMemoFirebase(() =>
    (firestore && selectedPatientId) ? query(collectionGroup(firestore, 'records')) : null // In a real app, you'd filter by patientId
  , [firestore, selectedPatientId]);

  const { data: allRecords, isLoading: isLoadingRecords } = useCollection(recordsQuery);

  const selectedPatient = patients?.find(p => p.id === selectedPatientId) || null;

  const patientWithRecords: Patient | null = selectedPatient ? {
    ...selectedPatient,
    records: allRecords?.filter(r => r.patientId === selectedPatient.id) || []
  } : null;

  if (isLoadingPatients) {
    return <div className='p-6'>Loading patients...</div>
  }

  return (
    <div className="p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
      <div className="lg:col-span-4 xl:col-span-3">
        <PatientList
          patients={patients || []}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <PatientDetails patient={patientWithRecords} />
      </div>
    </div>
  );
}
