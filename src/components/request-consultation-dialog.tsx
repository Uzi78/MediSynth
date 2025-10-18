'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { DoctorProfile } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const requestSchema = z.object({
  complaint: z.string().min(10, 'Please describe your complaint in at least 10 characters.'),
  urgency: z.enum(['Urgent', 'Moderate', 'Routine']),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestConsultationDialogProps {
  doctor: DoctorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialComplaint?: string;
}

export function RequestConsultationDialog({ doctor, open, onOpenChange, initialComplaint }: RequestConsultationDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { 
        complaint: initialComplaint || '',
        urgency: 'Routine',
    },
  });

  useEffect(() => {
    if (initialComplaint) {
        form.setValue('complaint', initialComplaint);
    }
  }, [initialComplaint, form]);

  const handleRequestSubmit = async (data: RequestFormValues) => {
    if (!doctor || !user || !firestore) return;

    try {
        await createConsultationRequest(firestore, {
            patientId: user.uid,
            patientName: user.displayName || user.email || 'Anonymous',
            patientAvatarUrl: user.photoURL || '',
            patientAge: 30, // Placeholder
            patientGender: 'Not specified', // Placeholder
            doctorId: doctor.id,
            complaint: data.complaint,
            urgency: data.urgency as 'High' | 'Medium' | 'Low',
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
    setTimeout(() => {
        form.reset();
    }, 300);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Consultation with Dr. {doctor.name}</DialogTitle>
          <DialogDescription>
            Confirm your details and submit your request.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRequestSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Preferred Urgency</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Routine" />
                        </FormControl>
                        <FormLabel className="font-normal">Routine</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Moderate" />
                        </FormControl>
                        <FormLabel className="font-normal">Moderate</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Urgent" />
                        </FormControl>
                        <FormLabel className="font-normal">Urgent</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
