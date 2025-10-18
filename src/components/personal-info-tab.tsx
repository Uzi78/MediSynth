'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Camera } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function PersonalInfoTab() {
    const { user } = useUser();
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.displayName || user?.email?.split('@')[0] || '',
            email: user?.email || '',
            phone: '',
        },
        mode: "onChange",
    })

    function onSubmit(data: ProfileFormValues) {
        console.log(data);
    }
  
    return (
    <Card className="mt-6 border-0 shadow-none">
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user?.photoURL || undefined} alt="Doctor's profile picture" />
                            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                            <Camera className="h-4 w-4" />
                            <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
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
                
                <Button type="submit">Update Personal Information</Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
}
