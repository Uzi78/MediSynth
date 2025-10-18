'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import UploadView from '@/components/views/upload-view';
import HistoryView from '@/components/views/history-view';
import ReportView from '@/components/views/report-view';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import DoctorDashboard from '@/components/doctor-dashboard';

interface UserProfile {
  role: 'patient' | 'doctor';
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [activeView, setActiveView] = useState('upload');

  const userProfileRef = useMemoFirebase(() => 
    (user && firestore) ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
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
        switch (activeView) {
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
              <Sidebar activeView={activeView} setActiveView={setActiveView} />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="shadow-lg h-full">
                  {renderContent()}
                </Card>
              </main>
           </div>
        </div>
      );
  };
  
  const renderDoctorDashboard = () => (
    <div className="min-h-screen w-full flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 border-b">
        <Header />
      </div>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          <DoctorDashboard />
      </main>
    </div>
  );

  if (userProfile?.role === 'doctor') {
    return renderDoctorDashboard();
  }

  return renderPatientDashboard();
}
