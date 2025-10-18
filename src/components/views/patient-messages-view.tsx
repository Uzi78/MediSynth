'use client';

import { useState, useMemo } from 'react';
import type { Consultation, DoctorProfile } from '@/lib/types';
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
import { collection, query, where } from 'firebase/firestore';

// NOTE: Message functionality is not fully implemented. This is a placeholder UI.
const mockMessages = {
    doc001: [
      { id: 'm1', from: 'doctor', text: 'Good morning. How are you feeling today?', time: '9:30 AM' },
      { id: 'm2', from: 'patient', text: 'Much better, thank you doctor. The new medication seems to be working.', time: '9:32 AM' },
      { id: 'm3', from: 'doctor', text: 'That\'s great to hear. Any side effects to report?', time: '9:33 AM' },
    ],
    doc002: [
        { id: 'm4', from: 'doctor', text: 'Hello, just wanted to check in on how you are doing.', time: 'Yesterday' },
    ],
};

type Messages = typeof mockMessages;
type Message = { id: string; from: string; text: string; time: string };


function ChatView({ doctor, messages: initialMessages }: { doctor: DoctorProfile; messages: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const messageToSend: Message = {
            id: `msg-${Date.now()}`,
            from: 'patient',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, messageToSend]);
        setNewMessage('');
    };
    
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
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.from === 'patient' ? 'justify-end' : '')}>
                            {msg.from === 'doctor' && <Avatar className="w-8 h-8"><AvatarImage src={doctor.photoUrl} /><AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                                'p-3 rounded-lg max-w-xs lg:max-w-md',
                                msg.from === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{msg.text}</p>
                                <p className={cn("text-xs mt-1", msg.from === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground' )}>{msg.time}</p>
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

  const consultationsCollectionRef = useMemoFirebase(() =>
    (user && firestore) ? collection(firestore, 'consultations') : null,
    [user, firestore]
  );

  const acceptedConsultationsQuery = useMemoFirebase(() =>
    consultationsCollectionRef ? query(consultationsCollectionRef, where('patientId', '==', user?.uid), where('status', '==', 'accepted')) : null,
    [consultationsCollectionRef, user]
  );
  
  const { data: consultations, isLoading: isLoadingConsultations } = useCollection<Consultation>(acceptedConsultationsQuery);

  const doctorIds = useMemo(() => {
    if (!consultations) return [];
    return [...new Set(consultations.map(c => c.doctorId))];
  }, [consultations]);

  // This is not efficient for production. In a real app, you might denormalize doctor data
  // or fetch them with a more optimized query if rules allow.
  const { data: allDoctors, isLoading: isLoadingDoctors } = useCollection<DoctorProfile>(
      useMemoFirebase(() => firestore ? collection(firestore, 'doctors') : null, [firestore])
  );

  const doctors = useMemo(() => {
    if (!allDoctors || doctorIds.length === 0) return [];
    return allDoctors.filter(doc => doctorIds.includes(doc.id));
  }, [allDoctors, doctorIds]);


  // Auto-select first doctor
  if (!selectedDoctor && doctors && doctors.length > 0) {
    setSelectedDoctor(doctors[0]);
  }

  const messagesForSelectedDoctor = selectedDoctor ? mockMessages[selectedDoctor.id as keyof Messages] || [] : [];
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
                                    onSelect={() => setSelectedDoctor(doctor)}
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
        {selectedDoctor ? (
            <ChatView doctor={selectedDoctor} messages={messagesForSelectedDoctor} />
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
