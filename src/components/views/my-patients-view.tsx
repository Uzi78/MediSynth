'use client';

import { useState } from 'react';
import type { DoctorPatient, Patient, Record as RecordType } from '@/lib/types';
import PatientList from '../patient-list';
import PatientDetails from '../patient-details';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export default function MyPatientsView() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Fetch the list of patients assigned to the doctor
    const doctorPatientsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'doctors', user.uid, 'patients') : null,
        [user, firestore]
    );
    const { data: doctorPatients, isLoading: isLoadingPatients } = useCollection<DoctorPatient>(doctorPatientsCollectionRef);

    // Keep track of the selected patient
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    
    // Automatically select the first patient in the list if none is selected
    if (!selectedPatientId && doctorPatients && doctorPatients.length > 0) {
        setSelectedPatientId(doctorPatients[0].id);
    }
    
    const selectedPatientSummary = doctorPatients?.find(p => p.id === selectedPatientId);

    // Create a Patient object from the DoctorPatient summary data
    // NOTE: The 'records' array is empty because doctors do not have access to the patient's full record history.
    // The UI should handle this gracefully.
    const patientDetails: Patient | null = selectedPatientSummary ? {
        id: selectedPatientSummary.id,
        name: selectedPatientSummary.name,
        age: selectedPatientSummary.age,
        gender: selectedPatientSummary.gender,
        email: 'N/A', // Email is private and not available in the doctor's summary view
        records: [], // Doctors view summaries, not the full record list.
    } : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-4 xl:col-span-3">
                <PatientList 
                    patients={doctorPatients || []}
                    isLoading={isLoadingPatients}
                    selectedPatientId={selectedPatientId}
                    onSelectPatient={setSelectedPatientId}
                />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
                <PatientDetails 
                  patient={patientDetails} 
                  isLoading={isLoadingPatients}
                />
            </div>
        </div>
    );
}
