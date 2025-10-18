'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import PipelineVisualization from '@/components/pipeline-visualization';
import PatientPortal from '@/components/patient-portal';
import DoctorDashboard from '@/components/doctor-dashboard';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('patient');
  const [pipelineStage, setPipelineStage] = useState(-1);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'patient' && pipelineStage > -1 && <PipelineVisualization currentStage={pipelineStage} />}
        <Card className="shadow-lg">
          {activeTab === 'patient' ? (
            <PatientPortal setPipelineStage={setPipelineStage} />
          ) : (
            <DoctorDashboard />
          )}
        </Card>
      </div>
    </div>
  );
}
