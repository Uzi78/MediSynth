'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Consultation, DoctorProfile, Message } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';


function ChatView({ doctor, consultationId }: { doctor: DoctorProfile; consultationId: string }) {
    const { user: patientUser } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    const messagesCollectionRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'consultations', consultationId, 'messages') : null
    , [firestore, consultationId]);

    const messagesQuery = useMemoFirebase(() =>
        messagesCollectionRef ? query(messagesCollectionRef, orderBy('timestamp', 'asc')) : null
    , [messagesCollectionRef]);
    
    const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !firestore || !patientUser || !messagesCollectionRef) return;

        const messageToSend = {
            senderId: patientUser.uid,
            senderRole: 'patient' as const,
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        await addDoc(messagesCollectionRef, messageToSend);
        setNewMessage('');
    };

    const formatMessageTime = (timestamp: Message['timestamp']) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <Card className="h-full flex flex-col shadow-lg">
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={doctor.photoUrl} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                </div>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                     {isLoadingMessages && <p>Loading messages...</p>}
                    {messages && messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === patientUser?.uid ? 'justify-end' : '')}>
                             {msg.senderId !== patientUser?.uid && <Avatar className="w-8 h-8"><AvatarImage src={doctor.photoUrl} /><AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                                'p-3 rounded-lg max-w-xs lg:max-w-md',
                                msg.senderId === patientUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{msg.text}</p>
                                <p className={cn("text-xs mt-1", msg.senderId === patientUser?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground' )}>{formatMessageTime(msg.timestamp)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Type a message..." 
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit"><Send className="w-4 h-4" /></Button>
                </div>
            </form>
        </Card>
    );
}

export default function PatientMessagesView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const consultationsCollectionRef = useMemoFirebase(() =>
    (user && firestore) ? collection(firestore, 'consultations') : null,
    [user, firestore]
  );

  const acceptedConsultationsQuery = useMemoFirebase(() =>
    consultationsCollectionRef ? query(consultationsCollectionRef, where('patientId', '==', user?.uid), where('status', 'in', ['accepted', 'active', 'completed'])) : null,
    [consultationsCollectionRef, user]
  );
  
  const { data: consultations, isLoading: isLoadingConsultations } = useCollection<Consultation>(acceptedConsultationsQuery);

  const doctorIds = useMemo(() => {
    if (!consultations) return [];
    return [...new Set(consultations.map(c => c.doctorId))];
  }, [consultations]);

  const { data: allDoctors, isLoading: isLoadingDoctors } = useCollection<DoctorProfile>(
      useMemoFirebase(() => firestore ? collection(firestore, 'doctors') : null, [firestore])
  );

  const doctors = useMemo(() => {
    if (!allDoctors || doctorIds.length === 0) return [];
    return allDoctors.filter(doc => doctorIds.includes(doc.id));
  }, [allDoctors, doctorIds]);

  const handleSelectDoctor = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    const consultation = consultations?.find(c => c.doctorId === doctor.id);
    if (consultation) {
        setSelectedConsultationId(consultation.id);
    }
  }
  
  useEffect(() => {
    if (!selectedDoctor && doctors && doctors.length > 0) {
        handleSelectDoctor(doctors[0]);
    }
  }, [doctors, selectedDoctor]);


  const isLoading = isLoadingConsultations || isLoadingDoctors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-4 xl:col-span-3">
        <Card className="h-full shadow-md">
            <CardContent className="p-0">
                <Command className="rounded-lg border-0 shadow-none bg-transparent h-full flex flex-col">
                    <div className='p-4 border-b'>
                        <CommandInput placeholder="Search for a doctor..." />
                    </div>
                    <ScrollArea className="h-[calc(100vh-18rem)]">
                        <CommandList>
                            {isLoading && <CommandEmpty>Loading doctors...</CommandEmpty>}
                            {!isLoading && doctors?.length === 0 && <CommandEmpty>No doctors found. Message a doctor after a consultation.</CommandEmpty>}
                            <CommandGroup heading="My Doctors">
                            {(doctors || []).map((doctor) => (
                                <CommandItem
                                    key={doctor.id}
                                    onSelect={() => handleSelectDoctor(doctor)}
                                    className={cn(
                                        "flex items-center gap-4 p-3 cursor-pointer m-2 rounded-md",
                                        selectedDoctor?.id === doctor.id && "bg-accent"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={doctor.photoUrl} />
                                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Dr. {doctor.name}</p>
                                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                    </div>
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                    </ScrollArea>
                </Command>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        {selectedDoctor && selectedConsultationId ? (
            <ChatView doctor={selectedDoctor} consultationId={selectedConsultationId} />
        ) : (
             !isLoading &&
            <Card className="h-full flex items-center justify-center shadow-lg">
                <div className="text-center text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a doctor to start messaging</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}
