'use client';

import type { Patient, Record as RecordType } from '@/lib/types';
import EmptyState from './empty-state';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import ConsolidatedReport from './consolidated-report';

interface PatientDetailsProps {
  patient: Patient | null;
  records: RecordType[] | null;
  isLoading: boolean;
}

export default function PatientDetails({ patient, records, isLoading }: PatientDetailsProps) {
  if (isLoading) {
    return (
        <Card className="h-full shadow-md p-6">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <div className="pt-6 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </Card>
    );
  }

  if (!patient) {
    return <EmptyState />;
  }

  return (
    <Card className="h-full shadow-md">
       <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-gray-600">{patient.age} years old, {patient.gender}</p>
          </div>
       </div>
      <ConsolidatedReport records={records} />
    </Card>
  );
}
