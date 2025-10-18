'use client';

import type { Consultation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useFirestore } from "@/firebase";
import { acceptConsultation, declineConsultation } from "@/firebase/firestore/consultations";


const getUrgencyBadgeClass = (urgency: 'High' | 'Medium' | 'Low') => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

interface ConsultationRequestsTabProps {
    consultations: Consultation[];
    isLoading: boolean;
}

export function ConsultationRequestsTab({ consultations, isLoading }: ConsultationRequestsTabProps) {
    const firestore = useFirestore();

    const handleAccept = async (consultation: Consultation) => {
        if (!firestore) return;
        await acceptConsultation(firestore, consultation);
    };

    const handleDecline = async (consultationId: string) => {
        if (!firestore) return;
        await declineConsultation(firestore, consultationId);
    };

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
                <p className="text-gray-500">No pending consultation requests.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 pt-4">
            {consultations.map(req => (
                <Card key={req.id} className="shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={req.patientAvatarUrl} alt={req.patientName} />
                                <AvatarFallback>{req.patientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{req.patientName}</p>
                                <p className="text-sm text-gray-500">{req.patientAge}, {req.patientGender} &middot; Requested on {new Date(req.requestedAt).toLocaleDateString()}</p>
                                <p className="text-sm mt-1 italic text-gray-700">"{req.complaint}"</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                             <Badge variant="outline" className={cn("text-sm", getUrgencyBadgeClass(req.urgency))}>
                                AI Urgency: {req.urgency}
                            </Badge>
                            <div className="flex items-center gap-2 mt-2">
                                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => handleDecline(req.id)}>
                                    <X className="w-4 h-4 mr-1" /> Decline
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700" onClick={() => handleAccept(req)}>
                                    <Check className="w-4 h-4 mr-1" /> Accept
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
