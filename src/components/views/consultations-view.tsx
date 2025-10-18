'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationRequestsTab } from "../consultation-requests-tab";
import { ScheduledConsultationsTab } from "../scheduled-consultations-tab";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Consultation } from "@/lib/types";

export default function ConsultationsView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const consultationsCollectionRef = useMemoFirebase(() =>
        (user && firestore) ? collection(firestore, 'consultations') : null,
        [user, firestore]
    );

    const pendingQuery = useMemoFirebase(() =>
        consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid), where('status', '==', 'pending')) : null,
        [consultationsCollectionRef, user]
    );
    const { data: pendingConsultations, isLoading: isLoadingPending } = useCollection<Consultation>(pendingQuery);

    const scheduledQuery = useMemoFirebase(() =>
        consultationsCollectionRef ? query(consultationsCollectionRef, where('doctorId', '==', user?.uid), where('status', '==', 'accepted')) : null,
        [consultationsCollectionRef, user]
    );
    const { data: scheduledConsultations, isLoading: isLoadingScheduled } = useCollection<Consultation>(scheduledQuery);

    return (
        <Card className="shadow-lg h-full">
            <CardHeader>
                <CardTitle>Consultation Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="requests">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="requests">
                        <ConsultationRequestsTab consultations={pendingConsultations || []} isLoading={isLoadingPending} />
                    </TabsContent>
                    <TabsContent value="scheduled">
                        <ScheduledConsultationsTab consultations={scheduledConsultations || []} isLoading={isLoadingScheduled} />
                    </TabsContent>
                    <TabsContent value="active">
                        <div className="flex items-center justify-center p-8">
                            <p className="text-gray-500">No active consultations.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="history">
                         <div className="flex items-center justify-center p-8">
                            <p className="text-gray-500">No past consultations found.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
