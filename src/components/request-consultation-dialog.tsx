'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { DoctorProfile } from '@/lib/types';
import { assessSymptoms, AssessSymptomsOutput } from '@/ai/flows/assess-symptoms';
import { createConsultationRequest } from '@/firebase/firestore/patient';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const requestSchema = z.object({
  complaint: z.string().min(10, 'Please describe your complaint in at least 10 characters.'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestConsultationDialogProps {
  doctor: DoctorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getUrgencyBadgeClass = (urgency: 'High' | 'Medium' | 'Low') => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

export function RequestConsultationDialog({ doctor, open, onOpenChange }: RequestConsultationDialogProps) {
  const [step, setStep] = useState<'form' | 'assessing' | 'results'>('form');
  const [assessment, setAssessment] = useState<AssessSymptomsOutput | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { complaint: '' },
  });
  
  const handleFormSubmit = async (data: RequestFormValues) => {
    setStep('assessing');
    try {
      const result = await assessSymptoms({ complaint: data.complaint });
      setAssessment(result);
      setStep('results');
    } catch (error) {
      console.error('AI assessment failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Assessment Failed',
        description: 'Could not assess symptoms. Please try again.',
      });
      setStep('form');
    }
  };

  const handleRequestSubmit = async () => {
    if (!doctor || !user || !firestore || !assessment) return;

    try {
        await createConsultationRequest(firestore, {
            patientId: user.uid,
            patientName: user.displayName || user.email || 'Anonymous',
            patientAvatarUrl: user.photoURL || '',
            patientAge: 30, // Placeholder
            patientGender: 'Not specified', // Placeholder
            doctorId: doctor.id,
            complaint: form.getValues('complaint'),
            urgency: assessment.urgency,
        });

        toast({
            title: 'Request Submitted',
            description: `Your consultation request has been sent to Dr. ${doctor.name}.`,
        });
        handleClose();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: error.message,
        });
    }
  }

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
        form.reset();
        setStep('form');
        setAssessment(null);
    }, 300);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Consultation with Dr. {doctor.name}</DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Describe your symptoms to get started.'}
            {step === 'assessing' && 'Our AI is assessing your symptoms...'}
            {step === 'results' && 'Review the AI assessment and submit your request.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="complaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I have a persistent cough and a slight fever for the past 3 days...'"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit">
                  <Zap className="mr-2 h-4 w-4" /> Run AI Symptom Checker
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === 'assessing' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <Zap className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-lg font-medium">Analyzing your complaint...</p>
                <p className="text-sm text-gray-500 text-center">The AI is assessing potential urgency and related conditions. This is not a medical diagnosis.</p>
            </div>
        )}

        {step === 'results' && assessment && (
            <div className='space-y-4'>
                <Alert variant={assessment.urgency === 'High' ? 'destructive' : 'default'}>
                    {assessment.urgency === 'High' ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    <AlertTitle>AI Triage Assessment</AlertTitle>
                    <AlertDescription>
                        Based on your complaint, the AI has assessed the urgency level. This is for informational purposes only.
                    </AlertDescription>
                </Alert>
                <div className='p-4 border rounded-lg space-y-4'>
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold'>Assessed Urgency:</h4>
                        <Badge className={cn('text-base', getUrgencyBadgeClass(assessment.urgency))}>{assessment.urgency}</Badge>
                    </div>
                     <Separator />
                    <div>
                        <h4 className='font-semibold mb-2'>Possible Related Conditions:</h4>
                        <div className="flex flex-wrap gap-2">
                            {assessment.suggestedConditions.map((cond, i) => <Badge key={i} variant="secondary">{cond}</Badge>)}
                        </div>
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setStep('form')}>Back</Button>
                    <Button type="button" onClick={handleRequestSubmit}>Submit Request to Doctor</Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
