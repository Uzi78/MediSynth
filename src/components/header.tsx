'use client';

import { Activity, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
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
          <h1 className="text-2xl font-bold text-foreground">MediSynth</h1>
          <p className="text-sm text-muted-foreground">AI-Powered Medical Records</p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <ThemeToggle />
        <Button variant="outline" size="icon" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
