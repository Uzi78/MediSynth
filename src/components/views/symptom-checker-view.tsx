'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { assessSymptoms, AssessSymptomsOutput } from '@/ai/flows/assess-symptoms';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Plus, Trash2, Zap, AlertTriangle, ShieldCheck, Stethoscope } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

const symptomCheckerSchema = z.object({
  symptoms: z.array(z.object({
    description: z.string().min(3, 'Symptom description is required.'),
    severity: z.enum(['Mild', 'Moderate', 'Severe']),
    duration: z.string().min(1, 'Duration is required.'),
  })).min(1, 'At least one symptom is required.'),
});

type SymptomFormValues = z.infer<typeof symptomCheckerSchema>;

interface SymptomCheckerViewProps {
  setActiveView: Dispatch<SetStateAction<string>>;
}

export default function SymptomCheckerView({ setActiveView }: SymptomCheckerViewProps) {
  const [step, setStep] = useState<'form' | 'assessing' | 'results'>('form');
  const [assessment, setAssessment] = useState<AssessSymptomsOutput | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomCheckerSchema),
    defaultValues: {
      symptoms: [{ description: '', severity: 'Mild', duration: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'symptoms',
  });

  const handleFormSubmit = async (data: SymptomFormValues) => {
    setStep('assessing');
    try {
      const result = await assessSymptoms({ symptoms: data.symptoms });
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
  
  const handleFindDoctor = () => {
    const complaint = form.getValues('symptoms').map(s => `${s.description} (${s.severity}, ${s.duration})`).join(', ');
    const encodedComplaint = encodeURIComponent(complaint);
    router.push(`/dashboard?view=find-doctor&complaint=${encodedComplaint}`);
  }

  const getUrgencyBadgeClass = (urgency: 'Urgent' | 'Moderate' | 'Routine') => {
    switch (urgency) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Routine': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };


  const renderForm = () => (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="text-primary" /> AI Symptom Checker
        </CardTitle>
        <CardDescription>
          Describe your symptoms, and our AI will provide a preliminary assessment. This is not a medical diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <ScrollArea className='h-[calc(100vh-30rem)] pr-4'>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg relative bg-muted">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`symptoms.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Symptom Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Sharp headache, persistent cough" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`symptoms.${index}.severity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`symptoms.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 3 days, 2 weeks" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={() => append({ description: '', severity: 'Mild', duration: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Symptom
              </Button>
              <Button type="submit">
                <Zap className="mr-2 h-4 w-4" /> Analyze Symptoms
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
  
  const renderAssessing = () => (
    <div className="flex flex-col items-center justify-center space-y-4 h-full p-8">
        <Zap className="h-16 w-16 text-primary animate-pulse" />
        <p className="text-2xl font-medium">Analyzing your symptoms...</p>
        <p className="text-md text-gray-500 text-center max-w-md">The AI is assessing potential urgency, related conditions, and recommended actions. This may take a moment.</p>
    </div>
  );

  const renderResults = () => assessment && (
    <div className='p-6 h-full flex flex-col'>
        <CardHeader className="px-0 pt-0">
          <CardTitle>AI Health Assessment Results</CardTitle>
          <CardDescription>This is a preliminary assessment and not a substitute for professional medical advice.</CardDescription>
        </CardHeader>
        <div className='flex-1 space-y-4'>
            <Alert variant={assessment.urgency === 'Urgent' ? 'destructive' : 'default'}>
                {assessment.urgency === 'Urgent' ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                <AlertTitle>Recommended Action</AlertTitle>
                <AlertDescription className="font-semibold">
                    {assessment.recommendedAction}
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
                     <p className='text-xs text-gray-500 mt-2'>Disclaimer: These are potential associations and not a diagnosis.</p>
                </div>
            </div>
        </div>
         <div className='pt-6 flex gap-4'>
            <Button type="button" variant="outline" className="w-full" onClick={() => setStep('form')}>Back to Form</Button>
            { (assessment.urgency === 'Moderate' || assessment.urgency === 'Routine') && (
                <Button type="button" className="w-full" onClick={handleFindDoctor}>
                    <Stethoscope className="mr-2 h-4 w-4"/> Find a Doctor
                </Button>
            )}
        </div>
    </div>
  );

  switch (step) {
    case 'form': return renderForm();
    case 'assessing': return renderAssessing();
    case 'results': return renderResults();
    default: return renderForm();
  }
}
