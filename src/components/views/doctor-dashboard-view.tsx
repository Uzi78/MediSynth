'use client';

import { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format, formatDistanceToNow } from 'date-fns';
import { Users, Video, MessageSquare, ClipboardPlus, Check, X, Send, CalendarCheck } from 'lucide-react';
import type { Consultation, Message } from '@/lib/types';
import { collection, query, where, updateDoc, doc, getDocs, limit, orderBy } from 'firebase/firestore';
import { acceptConsultation, declineConsultation } from '@/firebase/firestore/consultations';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

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
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);

    useEffect(() => {
        setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

    const consultationsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'consultations') : null,
        [user, firestore]
    );

    const allConsultationsQuery = useMemoFirebase(() =>
        consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid)) : null,
        [consultationsCollectionRef, user]
    );

    const { data: allConsultations, isLoading: isLoadingAllConsultations } = useCollection<Consultation>(allConsultationsQuery);
    
    const pendingConsultations = useMemo(() => {
        return allConsultations?.filter(c => c.status === 'pending') || [];
    }, [allConsultations]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!allConsultations || !firestore || !user) return;
            
            setIsLoadingMessages(true);
            let totalUnread = 0;
            const latestMessagesMap = new Map<string, RecentMessage>();

            for (const consult of allConsultations) {
                const messagesRef = collection(firestore, 'consultations', consult.id, 'messages');
                
                // Query for unread messages
                const unreadQuery = query(messagesRef, where('senderId', '!=', user.uid), where('isRead', '==', false));
                const unreadSnapshot = await getDocs(unreadQuery);
                totalUnread += unreadSnapshot.size;

                // Query for the latest message for the "Recent Messages" list
                const latestMsgQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
                const latestMsgSnapshot = await getDocs(latestMsgQuery);

                if (!latestMsgSnapshot.empty) {
                    const latestMsg = { 
                        id: latestMsgSnapshot.docs[0].id, 
                        ...latestMsgSnapshot.docs[0].data(),
                        patientName: consult.patientName,
                        patientAvatarUrl: consult.patientAvatarUrl,
                    } as RecentMessage;
                    
                    // Only update if the new message is more recent
                    if (!latestMessagesMap.has(consult.patientId) || 
                        latestMessagesMap.get(consult.patientId)!.timestamp.seconds < latestMsg.timestamp.seconds) {
                        latestMessagesMap.set(consult.patientId, latestMsg);
                    }
                }
            }

            setUnreadCount(totalUnread);
            const sortedRecentMessages = Array.from(latestMessagesMap.values())
                .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            setRecentMessages(sortedRecentMessages);
            setIsLoadingMessages(false);
        };

        fetchMessages();
    }, [allConsultations, firestore, user]);


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
                    <Button variant="outline" onClick={() => setActiveView('prescription')}><ClipboardPlus /> Write Prescription</Button>
                    <Button variant="outline" onClick={() => setActiveView('messages')}><Send /> Message Patient</Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">My Patients</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">...</div>
                        <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Pending Consultations</CardTitle>
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{isLoadingAllConsultations ? '...' : (pendingConsultations?.length || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Patients waiting for consultation</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Unread Messages</CardTitle>
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{isLoadingMessages ? '...' : unreadCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">From patients</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Prescriptions This Week</CardTitle>
                        <ClipboardPlus className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">...</div>
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
                     <CardContent>
                        <ScrollArea className='h-64'>
                        <div className="space-y-4">
                            {isLoadingAllConsultations ? <p className='text-muted-foreground'>Loading...</p> : 
                            !pendingConsultations || pendingConsultations.length === 0 ? <p className='text-muted-foreground'>No pending requests.</p> :
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
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(req)}>
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
                         recentMessages.length === 0 ? <p className='text-muted-foreground'>No recent messages.</p> :
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
                                    {formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), { addSuffix: true })}
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
