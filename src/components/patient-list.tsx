'use client';

import type { DoctorPatient } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

interface PatientListProps {
  patients: DoctorPatient[];
  isLoading: boolean;
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

export default function PatientList({ patients, isLoading, selectedPatientId, onSelectPatient }: PatientListProps) {
  return (
    <Card className="h-full shadow-md">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-[70vh]">
          <div className="p-4 space-y-3">
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : patients.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    No patients found.
                </div>
            ) : (
                patients.map(patient => (
                <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    'hover:border-primary/50 hover:shadow-md',
                    selectedPatientId === patient.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-card'
                    )}
                >
                    <div className="flex justify-between items-start">
                    <p className="font-bold text-foreground">{patient.name}</p>
                    <Badge variant="secondary">{patient.id.substring(0, 6).toUpperCase()}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 flex justify-between items-center">
                    <span>{patient.age}, {patient.gender}</span>
                    <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{patient.recordCount}</span>
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
