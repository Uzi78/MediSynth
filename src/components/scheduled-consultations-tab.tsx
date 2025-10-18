'use client';

import { useState, useEffect } from "react";
import { mockScheduledConsultations } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Phone, Clock } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

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

export function ScheduledConsultationsTab() {
    return (
        <div className="space-y-4 pt-4">
            {mockScheduledConsultations.map(consult => (
                <Card key={consult.id} className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={consult.patient.avatarUrl} alt={consult.patient.name} />
                                <AvatarFallback>{consult.patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-bold">{consult.patient.name}</p>
                                <p className="text-sm text-gray-500">{consult.patient.age}, {consult.patient.gender}</p>
                                <p className="text-sm mt-1 italic text-gray-700">"{consult.complaint}"</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <CountdownTimer targetDate={consult.scheduledTime} />
                            <Button className="mt-2">
                                <Phone className="w-4 h-4 mr-2" /> Join Call
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
