'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Video, MessageCircle, Info, UserPlus, FileText } from 'lucide-react';
import type { DoctorPatient } from '@/lib/types';
import { cn } from '@/lib/utils';

const mockPatients: DoctorPatient[] = [
    { id: 'p001', name: 'Aisha Khan', age: 34, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=aisha', conditions: ['Diabetes Type 2', 'Hypertension'], lastInteraction: '2024-05-10', status: 'Active' },
    { id: 'p002', name: 'Bilal Ahmed', age: 52, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=bilal', conditions: ['Asthma'], lastInteraction: '2024-05-12', status: 'Active' },
    { id: 'p003', name: 'Fatima Al-Jamil', age: 28, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=fatima', conditions: ['Migraine'], lastInteraction: '2024-04-20', status: 'Inactive' },
    { id: 'p004', name: 'Yusuf Ibrahim', age: 45, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=yusuf', conditions: ['Gout', 'High Cholesterol'], lastInteraction: '2024-05-15', status: 'Active' },
    { id: 'p005', name: 'Zainab Omar', age: 61, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=zainab', conditions: ['Osteoporosis'], lastInteraction: '2024-03-01', status: 'Inactive' },
    { id: 'p006', name: 'Omar Farooq', age: 39, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=omar', conditions: [], lastInteraction: '', status: 'New' },
];

const getStatusColor = (status: DoctorPatient['status']) => {
    switch(status) {
        case 'Active': return 'bg-green-500';
        case 'Inactive': return 'bg-gray-400';
        case 'New': return 'bg-blue-500';
    }
}

export default function MyPatientsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const filteredPatients = mockPatients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="h-full flex flex-col gap-6">
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-auto sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                            placeholder="Search by name or ID..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="New">New</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-full sm:w-auto">
                            <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.map(patient => (
                        <Card key={patient.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-16 h-16 border-2 border-white ring-2 ring-primary">
                                        <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className='flex justify-between items-start'>
                                            <h3 className="font-bold text-lg">{patient.name}</h3>
                                            <div className='flex items-center gap-2'>
                                                <div className={cn("w-3 h-3 rounded-full", getStatusColor(patient.status))} />
                                                <span className='text-xs font-semibold'>{patient.status}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">{patient.age}, {patient.gender}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 mb-2">Conditions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.conditions.length > 0 ? patient.conditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>) : <p className="text-xs text-gray-400">No conditions listed.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Last Interaction</h4>
                                    <p className="text-sm">{patient.lastInteraction ? new Date(patient.lastInteraction).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </CardContent>
                            <div className="p-4 bg-gray-50 border-t flex justify-around">
                                <Button variant="outline" size="sm"><Video className="mr-1 h-4 w-4" /> Consult</Button>
                                <Button variant="outline" size="sm"><MessageCircle className="mr-1 h-4 w-4" /> Message</Button>
                                <Button variant="outline" size="sm"><Info className="mr-1 h-4 w-4" /> Details</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex-1 flex flex-col items-center justify-center text-center p-10">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">No Patients Found</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        There are no patients matching your search criteria.
                    </p>
                </Card>
            )}
        </div>
    );
}
