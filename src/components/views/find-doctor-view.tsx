'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { DoctorProfile } from '@/lib/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Search, MapPin, Briefcase, DollarSign, Star, UserPlus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

function DoctorResultCard({ doctor }: { doctor: DoctorProfile }) {
    return (
        <Card className="shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col items-center sm:items-start">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage src={doctor.photoUrl} alt={`Dr. ${doctor.name}`} />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold">Dr. {doctor.name}</h3>
                    <p className="text-primary font-semibold">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500">{doctor.education}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mt-2">
                         <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {doctor.experience} years
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {doctor.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {doctor.consultationFee}
                        </div>
                    </div>
                     <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full sm:w-auto">View Profile</Button>
                        <Button className="w-full sm:w-auto">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Request Consultation
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DoctorSearchSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="shadow-md">
                    <CardContent className="p-4 flex gap-4">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex gap-4 pt-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-36" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function FindDoctorView() {
    const [searchTerm, setSearchTerm] = useState('');
    const firestore = useFirestore();

    const doctorsCollectionRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'doctors') : null,
        [firestore]
    );

    const { data: doctors, isLoading } = useCollection<DoctorProfile>(doctorsCollectionRef);
    
    const filteredDoctors = doctors?.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-0 h-full flex flex-col">
            <div className="px-6 py-4 border-b">
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search by name, specialty, or location..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button>Search</Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
                    <DoctorSearchSkeleton />
                ) : filteredDoctors && filteredDoctors.length > 0 ? (
                    <div className="space-y-4">
                       {filteredDoctors.map(doctor => <DoctorResultCard key={doctor.id} doctor={doctor} />)}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No doctors found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
