'use client';

import { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { Users, Video, MessageSquare, ClipboardPlus, Check, X, Send, CalendarCheck } from 'lucide-react';
import type { Consultation, Message, DoctorPatient } from '@/lib/types';
import { collection, query, where, getDocs, limit, orderBy, getCountFromServer, Timestamp } from 'firebase/firestore';
import { acceptConsultation, declineConsultation } from '@/firebase/firestore/consultations';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface RecentMessage extends Message {
    patientName: string;
    patientAvatarUrl?: string;
}

interface DoctorDashboardViewProps {
    setActiveView: Dispatch<SetStateAction<string>>;
}

export default function DoctorDashboardView({ setActiveView }: DoctorDashboardViewProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [currentDate, setCurrentDate] = useState('');
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [patientCount, setPatientCount] = useState(0);
    const [prescriptionCount, setPrescriptionCount] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

    // --- Data fetching ---
    const consultationsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'consultations') : null,
        [user, firestore]
    );

    const doctorPatientsCollectionRef = useMemoFirebase(() => 
      (user && firestore) ? collection(firestore, 'doctors', user.uid, 'patients') : null,
      [user, firestore]
    );

    const allConsultationsQuery = useMemoFirebase(() =>
        consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid)) : null,
        [consultationsCollectionRef, user]
    );

    // Main data hooks
    const { data: allConsultations, isLoading: isLoadingAllConsultations } = useCollection<Consultation>(allConsultationsQuery);
    const { data: doctorPatients, isLoading: isLoadingDoctorPatients } = useCollection<DoctorPatient>(doctorPatientsCollectionRef);

    const pendingConsultations = useMemo(() => {
        return allConsultations?.filter(c => c.status === 'pending') || [];
    }, [allConsultations]);

    // Fetch Stats (Patients & Prescriptions)
    useEffect(() => {
        const fetchStats = async () => {
            if (!firestore || !user) {
                setIsLoadingStats(false);
                return;
            }
            if (isLoadingDoctorPatients) return;
            
            setIsLoadingStats(true);

            // 1. Patient Count
            setPatientCount(doctorPatients?.length || 0);

            // 2. Prescription Count for last 7 days
            if (doctorPatients && doctorPatients.length > 0) {
                const oneWeekAgo = subDays(new Date(), 7);
                let totalPrescriptions = 0;
                
                const patientIds = doctorPatients.map(p => p.id);

                if (patientIds.length > 0) {
                    // This is less efficient than a composite index query, but avoids the need for manual index creation.
                    // For a production app with many patients/records, an indexed query is better.
                    for (const patientId of patientIds) {
                        const recordsRef = collection(firestore, 'users', patientId, 'patients', patientId, 'records');
                        try {
                            const recordsSnapshot = await getDocs(recordsRef);
                            recordsSnapshot.forEach(doc => {
                                const record = doc.data();
                                if (record.type === 'Prescription' && parseISO(record.date) >= oneWeekAgo) {
                                    totalPrescriptions++;
                                }
                            });
                        } catch (e) {
                           console.error(`Could not fetch prescription count for patient ${patientId}`, e);
                        }
                    }
                }
                setPrescriptionCount(totalPrescriptions);
            } else {
                 setPrescriptionCount(0);
            }
            setIsLoadingStats(false);
        }
        fetchStats();
    }, [firestore, user, doctorPatients, isLoadingDoctorPatients])


    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!firestore || !user || isLoadingAllConsultations) {
                 if(!isLoadingAllConsultations) {
                     setIsLoadingMessages(false);
                     setRecentMessages([]);
                 }
                return;
            }
            
            setIsLoadingMessages(true);
            const latestMessagesMap = new Map<string, RecentMessage>();

            const openConsultations = allConsultations?.filter(c => c.status !== 'pending' && c.status !== 'declined') || [];
            if(openConsultations.length === 0) {
                setIsLoadingMessages(false);
                setRecentMessages([]);
                return;
            }

            for (const consult of openConsultations) {
                const messagesRef = collection(firestore, 'consultations', consult.id, 'messages');

                // Query for the latest message in the conversation
                const latestMsgQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
                const latestMsgSnapshot = await getDocs(latestMsgQuery);

                if (!latestMsgSnapshot.empty) {
                    const latestMsgDoc = latestMsgSnapshot.docs[0];
                    const latestMsgData = latestMsgDoc.data();
                    
                    const latestMsg = { 
                        id: latestMsgDoc.id, 
                        ...latestMsgData,
                        patientName: consult.patientName,
                        patientAvatarUrl: consult.patientAvatarUrl,
                        timestamp: latestMsgData.timestamp as Timestamp,
                    } as RecentMessage;
                    
                    const existingMsg = latestMessagesMap.get(consult.patientId);
                    if (!existingMsg || (existingMsg.timestamp && existingMsg.timestamp.seconds < latestMsg.timestamp.seconds)) {
                        latestMessagesMap.set(consult.patientId, latestMsg);
                    }
                }
            }

            const sortedRecentMessages = Array.from(latestMessagesMap.values())
                .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setRecentMessages(sortedRecentMessages);
            setIsLoadingMessages(false);
        };

        fetchMessages();
    }, [allConsultations, firestore, user, isLoadingAllConsultations]);


    const handleAccept = async (consultation: Consultation) => {
        if (!firestore) return;
        await acceptConsultation(firestore, consultation);
    };

    const handleDecline = async (consultationId: string) => {
        if (!firestore) return;
        await declineConsultation(firestore, consultationId);
    };
    
    const StatSkeleton = () => <Skeleton className="h-6 w-24" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Welcome Back, Dr. {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-md text-muted-foreground">{currentDate}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="outline" onClick={() => setActiveView('prescription')}><ClipboardPlus /> Write Prescription</Button>
                    <Button variant="outline" onClick={() => setActiveView('messages')}><Send /> Message Patient</Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">My Patients</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{isLoadingStats || isLoadingDoctorPatients ? <StatSkeleton /> : patientCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Pending Consultations</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{isLoadingAllConsultations ? <StatSkeleton /> : (pendingConsultations?.length || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Patients waiting for consultation</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Prescriptions This Week</CardTitle>
                        <ClipboardPlus className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{isLoadingStats ? <StatSkeleton /> : prescriptionCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Issued in the last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Consultation Requests & Recent Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Consultation Requests</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <ScrollArea className='h-64'>
                        <div className="space-y-4">
                            {isLoadingAllConsultations ? <p className='text-muted-foreground'>Loading...</p> : 
                            !pendingConsultations || pendingConsultations.length === 0 ? <div className='flex items-center justify-center h-full pt-10'><p className='text-muted-foreground'>No pending requests.</p></div> :
                            pendingConsultations.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                                        <Button size="sm" variant='outline' className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700" onClick={() => handleAccept(req)}>
                                            <Check className="w-4 h-4 mr-1" /> Accept
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className='h-64'>
                        <div className="space-y-2">
                        {isLoadingMessages ? <p className='text-muted-foreground'>Loading...</p> : 
                         recentMessages.length === 0 ? <div className='flex items-center justify-center h-full pt-10'><p className='text-muted-foreground'>No recent messages.</p></div> :
                         recentMessages.map(msg => (
                            <div key={msg.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg cursor-pointer" onClick={() => setActiveView('messages')}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="relative">
                                        <AvatarImage src={msg.patientAvatarUrl} />
                                        <AvatarFallback>{msg.patientName.charAt(0)}</AvatarFallback>
                                        {!msg.isRead && msg.senderId !== user?.uid && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />}
                                    </Avatar>
                                    <div className='flex-1'>
                                        <p className="font-semibold text-sm">{msg.patientName}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{msg.text}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {msg.timestamp?.seconds && formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                        </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    