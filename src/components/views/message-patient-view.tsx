'use client';

import { useState } from 'react';
import { mockPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';


const mockMessages = {
    p001: [
      { id: 'm1', from: 'doctor', text: 'Good morning, Ahmed. How are you feeling today?', time: '9:30 AM' },
      { id: 'm2', from: 'patient', text: 'Much better, thank you doctor. The new medication seems to be working.', time: '9:32 AM' },
      { id: 'm3', from: 'doctor', text: 'That\'s great to hear. Any side effects to report?', time: '9:33 AM' },
    ],
    p002: [
        { id: 'm4', from: 'doctor', text: 'Hello Fatima, just wanted to check in on how you are doing.', time: 'Yesterday' },
    ],
};

type Messages = typeof mockMessages;

function ChatView({ patient, messages }: { patient: Patient; messages: Messages['p001'] }) {
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
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.from === 'doctor' ? 'justify-end' : '')}>
                            {msg.from === 'patient' && <Avatar className="w-8 h-8"><AvatarFallback>{patient.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                                'p-3 rounded-lg max-w-xs lg:max-w-md',
                                msg.from === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{msg.text}</p>
                                <p className={cn("text-xs mt-1", msg.from === 'doctor' ? 'text-primary-foreground/70' : 'text-muted-foreground' )}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button><Send className="w-4 h-4" /></Button>
                </div>
            </div>
        </Card>
    );
}

export default function MessagePatientView() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockPatients[0]);

  const messagesForSelectedPatient = selectedPatient ? mockMessages[selectedPatient.id as keyof Messages] || [] : [];
  
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
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                            {mockPatients.map((patient) => (
                                <CommandItem
                                    key={patient.id}
                                    onSelect={() => setSelectedPatient(patient)}
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
                                        <p className="text-sm text-gray-600 truncate max-w-40">
                                        {(mockMessages[patient.id as keyof Messages] || []).slice(-1)[0]?.text || 'No messages yet'}
                                        </p>
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
        {selectedPatient ? (
            <ChatView patient={selectedPatient} messages={messagesForSelectedPatient} />
        ) : (
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
