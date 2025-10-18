'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Activity, LogOut } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const auth = useAuth();
  
  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-primary">
        <Activity className="w-8 h-8" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MediSynth</h1>
          <p className="text-sm text-gray-600">AI-Powered Medical Records Consolidator</p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">Patient Portal</TabsTrigger>
            <TabsTrigger value="doctor">Doctor Dashboard</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="icon" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
