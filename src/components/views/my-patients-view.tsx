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

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const doctorPatientsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'doctors', user.uid, 'patients') : null,
        [user, firestore]
    );
    const { data: doctorPatients, isLoading: isLoadingPatients } = useCollection<DoctorPatient>(doctorPatientsCollectionRef, {
        onData: (data) => {
            if (!selectedPatientId && data && data.length > 0) {
                setSelectedPatientId(data[0].id);
            }
        }
    });

    const patientRecordsCollectionRef = useMemoFirebase(() =>
        (user && firestore && selectedPatientId) ? collection(firestore, 'users', selectedPatientId, 'patients', selectedPatientId, 'records') : null,
        [user, firestore, selectedPatientId]
    );

    const { data: patientRecords, isLoading: isLoadingRecords } = useCollection<RecordType>(patientRecordsCollectionRef);

    const selectedPatientSummary = doctorPatients?.find(p => p.id === selectedPatientId);

    const patientDetails: Patient | null = selectedPatientSummary ? {
        id: selectedPatientSummary.id,
        name: selectedPatientSummary.name,
        age: selectedPatientSummary.age,
        gender: selectedPatientSummary.gender,
        email: 'N/A', 
        records: patientRecords || [],
        recordCount: patientRecords?.length ?? selectedPatientSummary.recordCount,
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
                  records={patientRecords}
                  isLoading={isLoadingPatients || (selectedPatientId ? isLoadingRecords : false)}
                />
            </div>
        </div>
    );
}
