'use client';

import { useState } from 'react';
import Header from '@/components/header';
import PipelineVisualization from '@/components/pipeline-visualization';
import PatientPortal from '@/components/patient-portal';
import DoctorDashboard from '@/components/doctor-dashboard';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [activeTab, setActiveTab] = useState('patient');
  const [pipelineStage, setPipelineStage] = useState(-1);

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <PipelineVisualization currentStage={pipelineStage} />
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
