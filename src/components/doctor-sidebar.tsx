'use client';

import { Dispatch, SetStateAction } from 'react';
import { LayoutDashboard, Users, ClipboardPlus, Video, User } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'consultations', label: 'Consultations', icon: Video },
  { id: 'prescription', label: 'Write Prescription', icon: ClipboardPlus },
];

const profileNavItem = { id: 'profile', label: 'My Profile', icon: User };

export default function DoctorSidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white p-4 flex flex-col justify-between">
      <nav className="flex flex-col gap-2">
        {mainNavItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start gap-3 text-base h-12 px-4",
               activeView === item.id ? "" : "text-gray-600"
            )}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>
      <nav>
         <Button
            key={profileNavItem.id}
            variant={activeView === profileNavItem.id ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start gap-3 text-base h-12 px-4",
               activeView === profileNavItem.id ? "" : "text-gray-600"
            )}
            onClick={() => setActiveView(profileNavItem.id)}
          >
            <profileNavItem.icon className="w-5 h-5" />
            <span>{profileNavItem.label}</span>
          </Button>
      </nav>
    </aside>
  );
}
