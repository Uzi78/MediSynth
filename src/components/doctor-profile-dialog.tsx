'use client';

import type { DoctorProfile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Briefcase, MapPin, DollarSign, GraduationCap, Stethoscope, Quote } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface DoctorProfileDialogProps {
  doctor: DoctorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorProfileDialog({ doctor, open, onOpenChange }: DoctorProfileDialogProps) {
  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary">
                    <AvatarImage src={doctor.photoUrl} alt={`Dr. ${doctor.name}`} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <DialogTitle className="text-2xl">Dr. {doctor.name}</DialogTitle>
                    <DialogDescription className="text-lg text-primary">{doctor.specialty}</DialogDescription>
                </div>
            </div>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>{doctor.experience} years of experience</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{doctor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>${doctor.consultationFee} consultation fee</span>
                </div>
            </div>

            <Separator />
            
            {doctor.bio && (
                 <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><Quote className="w-5 h-5" /> Professional Bio</h4>
                    <p className="text-sm text-foreground/80 italic">"{doctor.bio}"</p>
                </div>
            )}

            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Education & Credentials</h4>
                <p className="text-sm text-foreground/80">{doctor.education}</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
