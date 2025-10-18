'use client';

import { Dispatch, SetStateAction } from 'react';
import { Upload, History, FileText, Search, HeartPulse, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

const navItems = [
  { id: 'upload', label: 'Upload New Document', icon: Upload },
  { id: 'history', label: 'View History', icon: History },
  { id: 'report', label: 'Consolidated Report', icon: FileText },
  { id: 'symptom-checker', label: 'Symptom Checker', icon: HeartPulse },
  { id: 'find-doctor', label: 'Find a Doctor', icon: Search },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export default function PatientSidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
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
    </aside>
  );
}
