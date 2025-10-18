'use client';

import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { mockPatients as allPatients } from '@/lib/data';
import PatientList from '../patient-list';
import PatientDetails from '../patient-details';

export default function MyPatientsView() {
    const [patients] = useState<Patient[]>(allPatients);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(allPatients[0]?.id || null);

    const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
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
