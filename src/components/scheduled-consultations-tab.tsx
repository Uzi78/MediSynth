'use client';

import { useState, useEffect } from "react";
import type { Consultation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { CalendarCheck, Clock } from "lucide-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Skeleton } from "./ui/skeleton";

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const distance = formatDistanceToNowStrict(targetDate, { addSuffix: true });
            setTimeLeft(distance);
        };
        
        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="text-sm text-primary font-semibold flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{timeLeft}</span>
        </div>
    )
}

interface ScheduledConsultationsTabProps {
    consultations: Consultation[];
    isLoading: boolean;
}

export function ScheduledConsultationsTab({ consultations, isLoading }: ScheduledConsultationsTabProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (consultations.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">No scheduled consultations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {consultations.map(consult => (
                <Card key={consult.id} className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={consult.patientAvatarUrl} alt={consult.patientName} />
                                <AvatarFallback>{consult.patientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-bold">{consult.patientName}</p>
                                <p className="text-sm text-gray-500">{consult.patientAge}, {consult.patientGender}</p>
                                <p className="text-sm mt-1 italic text-gray-700">"{consult.complaint}"</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           {consult.scheduledFor && <CountdownTimer targetDate={parseISO(consult.scheduledFor)} />}
                            <Button className="mt-2">
                                <CalendarCheck className="w-4 h-4 mr-2" /> View Consultation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
