'use client';

import { mockConsultationRequests } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Check, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const getUrgencyBadgeClass = (urgency: 'High' | 'Medium' | 'Low') => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

export function ConsultationRequestsTab() {
    return (
        <div className="space-y-4 pt-4">
            {mockConsultationRequests.map(req => (
                <Card key={req.id} className="shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={req.patient.avatarUrl} alt={req.patient.name} />
                                <AvatarFallback>{req.patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{req.patient.name}</p>
                                <p className="text-sm text-gray-500">{req.patient.age}, {req.patient.gender} &middot; Requested for {req.requestedTime}</p>
                                <p className="text-sm mt-1 italic text-gray-700">"{req.complaint}"</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                             <Badge variant="outline" className={cn("text-sm", getUrgencyBadgeClass(req.urgency))}>
                                AI Urgency: {req.urgency}
                            </Badge>
                            <div className="flex items-center gap-2 mt-2">
                                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                                    <X className="w-4 h-4 mr-1" /> Decline
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700">
                                    <Check className="w-4 h-4 mr-1" /> Accept
                                </Button>
                                <Button size="sm">
                                    <Phone className="w-4 h-4 mr-1" /> Start Now
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
