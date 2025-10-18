'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoTab } from "../personal-info-tab";
import { ProfessionalInfoTab } from "../professional-info-tab";


export default function DoctorProfileView() {
    return (
        <Card className="shadow-lg h-full">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="personal">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="professional">Professional Information</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal">
                        <PersonalInfoTab />
                    </TabsContent>
                    <TabsContent value="professional">
                        <ProfessionalInfoTab />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
