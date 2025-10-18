'use client';

import { useState, useRef, useEffect } from 'react';
import type { DoctorPatient, Message } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';


function ChatView({ patient, consultationId }: { patient: DoctorPatient; consultationId: string }) {
    const { user: doctorUser } = useUser();
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
        if (newMessage.trim() === '' || !firestore || !doctorUser || !messagesCollectionRef) return;

        const messageToSend = {
            senderId: doctorUser.uid,
            senderRole: 'doctor' as const,
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        await addDoc(messagesCollectionRef, messageToSend);
        setNewMessage('');
    }

    const formatMessageTime = (timestamp: Message['timestamp']) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <Card className="h-full flex flex-col shadow-lg">
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${patient.id}`} />
                    <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-sm text-gray-500">Active now</p>
                </div>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {isLoadingMessages && <p>Loading messages...</p>}
                    {messages && messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === doctorUser?.uid ? 'justify-end' : '')}>
                            {msg.senderId !== doctorUser?.uid && <Avatar className="w-8 h-8"><AvatarFallback>{patient.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                                'p-3 rounded-lg max-w-xs lg:max-w-md',
                                msg.senderId === doctorUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{msg.text}</p>
                                <p className={cn("text-xs mt-1", msg.senderId === doctorUser?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground' )}>{formatMessageTime(msg.timestamp)}</p>
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

export default function MessagePatientView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const consultationsCollectionRef = useMemoFirebase(() => 
    (user && firestore) ? collection(firestore, 'consultations') : null,
    [user, firestore]
  );
  
  // This query gets all consultations where the doctor is a participant.
  const doctorConsultationsQuery = useMemoFirebase(() =>
    consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid)) : null,
    [consultationsCollectionRef, user]
  );

  const { data: consultations, isLoading: isLoadingConsultations } = useCollection(doctorConsultationsQuery);

  // Derive unique patients from consultations
  const patients: DoctorPatient[] = useMemoFirebase(() => {
    if (!consultations) return [];
    const patientMap = new Map<string, DoctorPatient>();
    consultations.forEach(c => {
        if (!patientMap.has(c.patientId)) {
            patientMap.set(c.patientId, {
                id: c.patientId,
                name: c.patientName,
                age: c.patientAge,
                gender: c.patientGender,
                recordCount: 0 // This could be fetched separately if needed
            });
        }
    });
    return Array.from(patientMap.values());
  }, [consultations]) || [];
  
  
  const handleSelectPatient = (patient: DoctorPatient) => {
    setSelectedPatient(patient);
    // Find the first consultation with this patient to load messages
    const consultation = consultations?.find(c => c.patientId === patient.id);
    if(consultation) {
        setSelectedConsultationId(consultation.id);
    }
  }

  useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
        handleSelectPatient(patients[0]);
    }
  }, [patients, selectedPatient]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-4 xl:col-span-3">
        <Card className="h-full shadow-md">
            <CardContent className="p-0">
                <Command className="rounded-lg border-0 shadow-none bg-transparent h-full flex flex-col">
                    <div className='p-4 border-b'>
                        <CommandInput placeholder="Search for a patient..." />
                    </div>
                    <ScrollArea className="h-[calc(100vh-18rem)]">
                        <CommandList>
                            {isLoadingConsultations && <CommandEmpty>Loading patients...</CommandEmpty>}
                            {!isLoadingConsultations && patients?.length === 0 && <CommandEmpty>No patients found.</CommandEmpty>}
                            <CommandGroup>
                            {patients.map((patient) => (
                                <CommandItem
                                    key={patient.id}
                                    onSelect={() => handleSelectPatient(patient)}
                                    className={cn(
                                        "flex items-center gap-4 p-3 cursor-pointer m-2 rounded-md",
                                        selectedPatient?.id === patient.id && "bg-accent"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${patient.id}`} />
                                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{patient.name}</p>
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
        {selectedPatient && selectedConsultationId ? (
            <ChatView patient={selectedPatient} consultationId={selectedConsultationId} />
        ) : (
             !isLoadingConsultations &&
            <Card className="h-full flex items-center justify-center shadow-lg">
                <div className="text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a patient to start messaging</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}
