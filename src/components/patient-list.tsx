'use client';

import type { Patient } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

export default function PatientList({ patients, selectedPatientId, onSelectPatient }: PatientListProps) {
  return (
    <Card className="h-full shadow-md">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-[70vh]">
          <div className="p-4 space-y-3">
            {patients.map(patient => (
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
                  <p className="font-bold text-gray-800">{patient.name}</p>
                  <Badge variant="secondary">{patient.id.toUpperCase()}</Badge>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex justify-between items-center">
                  <span>{patient.age}, {patient.gender}</span>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{patient.records.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
