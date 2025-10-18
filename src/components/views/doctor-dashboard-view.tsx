'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { Users, Video, MessageSquare, ClipboardPlus, Check, X, Send, CalendarCheck } from 'lucide-react';
import type { Consultation } from '@/lib/types';
import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { acceptConsultation, declineConsultation } from '@/firebase/firestore/consultations';


interface DoctorDashboardViewProps {
    setActiveView: Dispatch<SetStateAction<string>>;
}

export default function DoctorDashboardView({ setActiveView }: DoctorDashboardViewProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

    const consultationsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'consultations') : null
    , [user, firestore]);
    
    const pendingConsultationsQuery = useMemoFirebase(() =>
        consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid), where('status', '==', 'pending')) : null
    , [consultationsCollectionRef, user]);

    const { data: pendingConsultations, isLoading: isLoadingConsultations } = useCollection<Consultation>(pendingConsultationsQuery);

    const handleAccept = async (consultation: Consultation) => {
        if (!firestore) return;
        await acceptConsultation(firestore, consultation);
    };

    const handleDecline = async (consultationId: string) => {
        if (!firestore) return;
        await declineConsultation(firestore, consultationId);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {getGreeting()}, Dr. {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-md text-muted-foreground">{currentDate}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button onClick={() => setActiveView('consultations')}><CalendarCheck /> Start Consultation</Button>
                    <Button variant="outline" onClick={() => setActiveView('prescription')}><ClipboardPlus /> Write Prescription</Button>
                    <Button variant="outline" onClick={() => setActiveView('messages')}><Send /> Message Patient</Button>
                </div>
            </div>
            
            <div className="text-lg font-semibold text-primary">
                You have {isLoadingConsultations ? '...' : (pendingConsultations?.length || 0)} pending consultations today
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">My Patients</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">...</div>
                        <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Pending Consultations</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{isLoadingConsultations ? '...' : (pendingConsultations?.length || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Patients waiting for consultation</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Unread Messages</CardTitle>
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">...</div>
                        <p className="text-xs text-muted-foreground mt-1">From patients</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">Prescriptions This Week</CardTitle>
                        <ClipboardPlus className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">...</div>
                        <p className="text-xs text-muted-foreground mt-1">Issued this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Consultation Requests & Recent Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Consultation Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingConsultations ? <p>Loading...</p> : 
                         !pendingConsultations || pendingConsultations.length === 0 ? <p>No pending requests.</p> :
                         pendingConsultations.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={req.patientAvatarUrl} alt={req.patientName} />
                                        <AvatarFallback>{req.patientName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{req.patientName}</p>
                                        <p className="text-sm text-muted-foreground">{req.patientAge}, {req.patientGender}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => handleDecline(req.id)}>
                                        <X className="w-4 h-4 mr-1" /> Decline
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(req)}>
                                        <Check className="w-4 h-4 mr-1" /> Accept
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <div className='flex items-center justify-center h-full text-muted-foreground'>
                         <p>No recent messages.</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
