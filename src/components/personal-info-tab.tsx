'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, ChangeEvent, useEffect } from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "./ui/card"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/firebase/firestore/users";

const profileFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface UserProfile {
    role: 'patient' | 'doctor';
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
}

export function PersonalInfoTab() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(user?.photoURL || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userProfileRef = useMemoFirebase(() => 
        (user && firestore) ? doc(firestore, 'users', user.uid) : null,
        [user, firestore]
    );

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
        },
        mode: "onChange",
    })

    useEffect(() => {
        if (user && userProfile) {
            form.reset({
                name: userProfile.displayName || user.displayName || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: userProfile.phoneNumber || '',
            });
            if(userProfile.photoURL) {
                setImagePreview(userProfile.photoURL);
            }
        } else if (user) {
             form.reset({
                name: user.displayName || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: '',
            });
            if(user.photoURL) {
                setImagePreview(user.photoURL);
            }
        }
    }, [user, userProfile, form]);


    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    async function onSubmit(data: ProfileFormValues) {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Authentication context is not available.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await updateUserProfile({ firestore }, user, {
                displayName: data.name,
                phoneNumber: data.phone
            });
            
            toast({ title: 'Success', description: 'Your profile has been updated.' });
            setNewImage(null); // Reset after successful upload
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not update profile.' });
        } finally {
            setIsSubmitting(false);
        }
    }
  
    if (isUserLoading || isProfileLoading) {
        return <p>Loading profile...</p>
    }

    return (
    <Card className="mt-6 border-0 shadow-none">
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={imagePreview || undefined} alt="User's profile picture" />
                            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8" asChild>
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Camera className="h-4 w-4" />
                                <Input 
                                    id="photo-upload" 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </Button>
                    </div>
                    <div className="flex-1">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="Your Email" {...field} disabled />
                        </FormControl>
                         <FormDescription>
                            Your email address is used for logging in and cannot be changed.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="Your Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Personal Information'}</Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
}
