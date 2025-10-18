'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationRequestsTab } from "../consultation-requests-tab";
import { ScheduledConsultationsTab } from "../scheduled-consultations-tab";

export default function ConsultationsView() {
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
                        <ConsultationRequestsTab />
                    </TabsContent>
                    <TabsContent value="scheduled">
                        <ScheduledConsultationsTab />
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
