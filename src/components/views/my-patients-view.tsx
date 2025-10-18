'use client';

import { useState } from 'react';
import type { DoctorPatient, Record as RecordType } from '@/lib/types';
import PatientList from '../patient-list';
import PatientDetails from '../patient-details';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { getDoctorPatients } from '@/firebase/firestore/doctors';
import { collection, doc, query } from 'firebase/firestore';

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
    
    // Fetch the full details of the selected patient
    const patientDocRef = useMemoFirebase(() => 
        (selectedPatientId && firestore) ? doc(firestore, 'users', selectedPatientId, 'patients', selectedPatientId) : null, 
        [selectedPatientId, firestore]
    );
    const { data: selectedPatient, isLoading: isLoadingPatientDetails } = useDoc<any>(patientDocRef);

    // Fetch the records for the selected patient
    const patientRecordsRef = useMemoFirebase(() =>
        (selectedPatientId && firestore) ? collection(firestore, 'users', selectedPatientId, 'patients', selectedPatientId, 'records') : null,
        [selectedPatientId, firestore]
    );
    const { data: records, isLoading: isLoadingRecords } = useCollection<RecordType>(patientRecordsRef);
    
    // Automatically select the first patient in the list if none is selected
    if (!selectedPatientId && doctorPatients && doctorPatients.length > 0) {
        setSelectedPatientId(doctorPatients[0].id);
    }
    
    const fullPatientDetails = selectedPatient && records ? {
        ...selectedPatient,
        id: selectedPatientId,
        records: records,
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
                  patient={fullPatientDetails} 
                  isLoading={isLoadingPatientDetails || isLoadingRecords}
                />
            </div>
        </div>
    );
}
