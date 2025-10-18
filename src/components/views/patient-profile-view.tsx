'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoTab } from "../personal-info-tab";


export default function PatientProfileView() {
    return (
        <Card className="shadow-none border-none h-full">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <PersonalInfoTab />
            </CardContent>
        </Card>
    );
}
