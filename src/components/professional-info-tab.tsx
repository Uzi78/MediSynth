'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const professionalInfoSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  specialty: z.string().min(1, "Specialty is required"),
  location: z.string().min(1, "Location is required."),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  consultationFee: z.coerce.number().min(0, "Fee must be a positive number"),
  education: z.string().min(1, "Education details are required"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

type ProfessionalInfoFormValues = z.infer<typeof professionalInfoSchema>

export function ProfessionalInfoTab() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<ProfessionalInfoFormValues>({
        resolver: zodResolver(professionalInfoSchema),
        defaultValues: {
            licenseNumber: '',
            specialty: '',
            location: '',
            experience: 0,
            consultationFee: 0,
            education: '',
            bio: '',
        },
        mode: "onChange",
    });

    async function onSubmit(data: ProfessionalInfoFormValues) {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.'});
            return;
        }

        const doctorProfileRef = doc(firestore, 'doctors', user.uid);
        
        try {
            await setDoc(doctorProfileRef, {
                ...data,
                name: user.displayName || user.email?.split('@')[0],
                photoUrl: user.photoURL || ""
            }, { merge: true });

            toast({ title: 'Success', description: 'Your professional profile has been updated.'});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    }
  
    return (
        <Card className="mt-6 border-0 shadow-none">
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical License Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="specialty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specialty</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Cardiology" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., New York, NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Years of Experience</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="consultationFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consultation Fee ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 150" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="education"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Education & Degrees</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="e.g., MD from University of Health Sciences, Residency at City Hospital"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Professional Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Tell us a little bit about your professional background and philosophy."
                                    className="resize-none"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Update Professional Information</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
