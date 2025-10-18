'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller, UseFormReturn, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { mockPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Pill, Plus, Trash2, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';

const prescriptionSchema = z.object({
  medications: z.array(z.object({
    drug: z.string().min(1, 'Drug name is required.'),
    strength: z.string().min(1, 'Strength is required.'),
    form: z.string().min(1, 'Form is required.'),
    dosage: z.string().min(1, 'Dosage is required.'),
    frequency: z.string().min(1, 'Frequency is required.'),
    duration: z.string().min(1, 'Duration is required.'),
  })).min(1, 'At least one medication is required.'),
  instructions: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PatientSelectionStepProps {
  onSelectPatient: (patient: Patient) => void;
}

function PatientSelectionStep({ onSelectPatient }: PatientSelectionStepProps) {
    return (
        <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Step 1: Select a Patient</CardTitle>
            <CardDescription>Search for and select the patient you are writing a prescription for.</CardDescription>
        </CardHeader>
        <CardContent>
            <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search for a patient..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                {mockPatients.map((patient) => (
                    <CommandItem
                    key={patient.id}
                    onSelect={() => onSelectPatient(patient)}
                    className="flex items-center gap-4 p-2 cursor-pointer"
                    >
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </CardContent>
        </Card>
    );
}

interface PrescriptionFormStepProps {
    patient: Patient;
    form: UseFormReturn<PrescriptionFormValues>;
    onBack: () => void;
    onSubmit: (data: PrescriptionFormValues) => void;
}

function PrescriptionFormStep({ patient, form, onBack, onSubmit }: PrescriptionFormStepProps) {
    const { fields, append, remove } = useFieldArray({
        name: "medications",
        control: form.control,
    });
    
    const watchMedications = form.watch("medications");
    const watchInstructions = form.watch("instructions");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                    <Card className="shadow-lg flex-1">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Step 2: Write Prescription</CardTitle>
                                <CardDescription>Fill in the medication details for {patient.name}.</CardDescription>
                            </div>
                            <Button variant="link" onClick={onBack}>Change Patient</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg relative bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField control={form.control} name={`medications.${index}.drug`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Drug Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Amoxicillin" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`medications.${index}.strength`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Strength</FormLabel>
                                    <FormControl><Input placeholder="e.g., 500mg" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`medications.${index}.form`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Form</FormLabel>
                                    <FormControl><Input placeholder="e.g., Tablet" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`medications.${index}.dosage`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Dosage</FormLabel>
                                    <FormControl><Input placeholder="e.g., 1 tablet" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`medications.${index}.frequency`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Frequency</FormLabel>
                                    <FormControl><Input placeholder="e.g., Twice daily" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`medications.${index}.duration`} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl><Input placeholder="e.g., 10 days" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                </div>
                                {index > 0 && (
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                )}
                            </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => append({ drug: '', strength: '', form: '', dosage: '', frequency: '', duration: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Medication
                            </Button>
                            <Separator />
                            <FormField control={form.control} name="instructions" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Special Instructions</FormLabel>
                                <FormControl><Textarea placeholder="e.g., Take with food." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />
                        </div>
                        </ScrollArea>
                    </CardContent>
                    </Card>
                </form>
                </Form>
            </div>

            <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-6">
                <CardHeader>
                    <CardTitle>Prescription Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="space-y-4 text-sm p-4 border rounded-md bg-white">
                        <div className="text-center">
                        <h4 className="font-bold text-lg">Dr. Smith</h4>
                        <p className="text-xs text-gray-500">MediSynth Clinic</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <div>
                                <p className="font-bold">{patient?.name}</p>
                                <p className="text-gray-600">Age: {patient?.age}, Gender: {patient?.gender}</p>
                            </div>
                            <p className="text-gray-600">Date: {format(new Date(), 'yyyy-MM-dd')}</p>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                        {watchMedications.map((med, index) => (
                            med.drug && <div key={index}>
                            <p className="font-bold flex items-center gap-2"><Pill className="h-4 w-4" /> {med.drug} {med.strength} {med.form}</p>
                            <p className="pl-6 text-gray-700">{med.dosage}, {med.frequency} for {med.duration}</p>
                            </div>
                        ))}
                        </div>
                        {watchInstructions && (
                        <>
                            <Separator />
                            <div>
                            <p className="font-bold">Instructions:</p>
                            <p className="text-gray-700">{watchInstructions}</p>
                            </div>
                        </>
                        )}
                    </div>
                    </ScrollArea>
                    <div className="mt-4 space-y-2">
                        <Button className="w-full" disabled={!form.formState.isValid}>Save as Draft</Button>
                        <Button variant="outline" className="w-full" disabled={!form.formState.isValid}><FileText className="mr-2 h-4 w-4"/> Preview PDF</Button>
                        <Button variant="default" className="w-full" disabled={!form.formState.isValid}><Send className="mr-2 h-4 w-4"/> Send to Patient</Button>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function WritePrescriptionView() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [step, setStep] = useState(1);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [{ drug: '', strength: '', form: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
    },
  });

  const onSubmit = (data: PrescriptionFormValues) => {
    console.log(data);
    // Here you would handle submitting the prescription
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setStep(2);
  }

  const handleGoBack = () => {
    setSelectedPatient(null);
    setStep(1);
    form.reset();
  }

  return (
    <div className="h-full">
      {step === 1 || !selectedPatient ? (
          <PatientSelectionStep onSelectPatient={handleSelectPatient} />
      ) : (
          <PrescriptionFormStep patient={selectedPatient} form={form} onBack={handleGoBack} onSubmit={onSubmit} />
      )}
    </div>
  );
}
