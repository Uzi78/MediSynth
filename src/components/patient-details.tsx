'use client';

import { useState } from 'react';
import type { Patient } from '@/lib/types';
import SummaryView from './summary-view';
import DetailedView from './detailed-view';
import EmptyState from './empty-state';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface PatientDetailsProps {
  patient: Patient | null;
  isLoading: boolean;
}

export default function PatientDetails({ patient, isLoading }: PatientDetailsProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-gray-600">{patient.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              onClick={() => setViewMode('summary')}
            >
              Summary
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <SummaryView patient={patient} />
        ) : (
          <DetailedView patient={patient} />
        )}
      </div>
    </Card>
  );
}
