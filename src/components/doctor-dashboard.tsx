'use client';

import { useState } from 'react';
import { mockPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import PatientList from './patient-list';
import PatientDetails from './patient-details';

export default function DoctorDashboard() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  return (
    <div className="p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
      <div className="lg:col-span-4 xl:col-span-3">
        <PatientList
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <PatientDetails patient={selectedPatient} />
      </div>
    </div>
  );
}
