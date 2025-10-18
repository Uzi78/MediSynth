'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import PatientSidebar from '@/components/patient-sidebar';
import DoctorSidebar from '@/components/doctor-sidebar';
import UploadView from '@/components/views/upload-view';
import HistoryView from '@/components/views/history-view';
import ReportView from '@/components/views/report-view';
import DoctorDashboardView from '@/components/views/doctor-dashboard-view';
import MyPatientsView from '@/components/views/my-patients-view';
import ConsultationsView from '@/components/views/consultations-view';
import WritePrescriptionView from '@/components/views/write-prescription-view';
import DoctorProfileView from '@/components/views/doctor-profile-view';
import MessagePatientView from '@/components/views/message-patient-view';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';

interface UserProfile {
  role: 'patient' | 'doctor';
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [activePatientView, setActivePatientView] = useState('upload');
  const [activeDoctorView, setActiveDoctorView] = useState('dashboard');

  const userProfileRef = useMemoFirebase(() => 
    (user && firestore) ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  const renderPatientDashboard = () => {
    const renderContent = () => {
        switch (activePatientView) {
          case 'upload':
            return <UploadView />;
          case 'history':
            return <HistoryView />;
          case 'report':
            return <ReportView />;
          default:
            return <UploadView />;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
           <div className="p-4 sm:p-6 lg:p-8 border-b">
             <Header />
           </div>
           <div className="flex flex-1">
              <PatientSidebar activeView={activePatientView} setActiveView={setActivePatientView} />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="shadow-lg h-full">
                  {renderContent()}
                </Card>
              </main>
           </div>
        </div>
      );
  };
  
  const renderDoctorDashboard = () => {
    const renderContent = () => {
      switch (activeDoctorView) {
        case 'dashboard':
          return <DoctorDashboardView setActiveView={setActiveDoctorView} />;
        case 'patients':
          return <MyPatientsView />;
        case 'consultations':
          return <ConsultationsView />;
        case 'prescription':
          return <WritePrescriptionView />;
        case 'messages':
            return <MessagePatientView />;
        case 'profile':
            return <DoctorProfileView />;
        default:
          return <DoctorDashboardView setActiveView={setActiveDoctorView} />;
      }
    };

    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 border-b">
          <Header />
        </div>
        <div className="flex flex-1">
          <DoctorSidebar activeView={activeDoctorView} setActiveView={setActiveDoctorView} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
            {renderContent()}
          </main>
        </div>
      </div>
    );
  };

  if (userProfile?.role === 'doctor') {
    return renderDoctorDashboard();
  }

  return renderPatientDashboard();
}
