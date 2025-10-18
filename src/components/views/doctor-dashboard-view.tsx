'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { format } from 'date-fns';
import { Users, Video, MessageSquare, ClipboardPlus, Check, X, Send, VideoIcon, PlusCircle } from 'lucide-react';
import type { ConsultationRequest, RecentMessage } from '@/lib/types';


// Mock data - replace with real data from your backend
const mockConsultationRequests: ConsultationRequest[] = [
    {
      id: 'cr001',
      patient: { name: 'Ali Hassan', age: 34, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=ali' },
      requestedTime: '10:00 AM',
    },
    {
      id: 'cr002',
      patient: { name: 'Fatima Ahmed', age: 28, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=fatima' },
      requestedTime: '11:30 AM',
    },
    {
        id: 'cr003',
        patient: { name: 'Zainab Omar', age: 45, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=zainab' },
        requestedTime: '2:00 PM',
    },
];
  
const mockRecentMessages: RecentMessage[] = [
    {
      id: 'msg001',
      patient: { name: 'Yusuf Ibrahim', avatarUrl: 'https://i.pravatar.cc/150?u=yusuf' },
      preview: 'Thank you, doctor. I am feeling much better now.',
      time: '10:45 AM',
    },
    {
      id: 'msg002',
      patient: { name: 'Aisha Khan', avatarUrl: 'https://i.pravatar.cc/150?u=aisha' },
      preview: 'I have a question about the new prescription...',
      time: '9:30 AM',
    },
    {
        id: 'msg003',
        patient: { name: 'Bilal Ahmed', avatarUrl: 'https://i.pravatar.cc/150?u=bilal' },
        preview: 'Is it normal to experience this side effect?',
        time: 'Yesterday',
    },
    {
        id: 'msg004',
        patient: { name: 'Maryam Khalid', avatarUrl: 'https://i.pravatar.cc/150?u=maryam' },
        preview: 'Just checking in for my appointment tomorrow.',
        time: 'Yesterday',
    },
    {
        id: 'msg005',
        patient: { name: 'Omar Farooq', avatarUrl: 'https://i.pravatar.cc/150?u=omar' },
        preview: 'The pharmacy needs a confirmation for the refill.',
        time: '2 days ago',
    },
];

export default function DoctorDashboardView() {
    const { user } = useUser();
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    }, []);

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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {getGreeting()}, Dr. {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-md text-gray-500">{currentDate}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button><VideoIcon /> Start Video Consultation</Button>
                    <Button variant="outline"><ClipboardPlus /> Write Prescription</Button>
                    <Button variant="outline"><Send /> Message Patient</Button>
                </div>
            </div>
            
            <div className="text-lg font-semibold text-primary">
                You have {mockConsultationRequests.length} pending consultations today
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">My Patients</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">24</div>
                        <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Pending Consultations</CardTitle>
                        <Video className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{mockConsultationRequests.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Patients waiting for consultation</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Unread Messages</CardTitle>
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">5</div>
                        <p className="text-xs text-gray-500 mt-1">From patients</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">Prescriptions This Week</CardTitle>
                        <ClipboardPlus className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">12</div>
                        <p className="text-xs text-gray-500 mt-1">Issued this week</p>
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
                        {mockConsultationRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={req.patient.avatarUrl} alt={req.patient.name} />
                                        <AvatarFallback>{req.patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{req.patient.name}</p>
                                        <p className="text-sm text-gray-500">{req.patient.age}, {req.patient.gender} &middot; {req.requestedTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                                        <X className="w-4 h-4 mr-1" /> Decline
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
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
                        {mockRecentMessages.map(msg => (
                           <div key={msg.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={msg.patient.avatarUrl} alt={msg.patient.name} />
                                        <AvatarFallback>{msg.patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className='max-w-xs'>
                                        <p className="font-semibold">{msg.patient.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{msg.preview}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 self-start">{msg.time}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
