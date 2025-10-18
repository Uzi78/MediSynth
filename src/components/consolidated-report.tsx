'use client';

import { useMemo } from 'react';
import type { Record as RecordType } from '@/lib/types';
import { consolidateRecords } from '@/lib/consolidate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Pill, Microscope, FileText, Calendar } from 'lucide-react';
import { LabTrendChart } from '@/components/charts/LabTrendChart';


interface ConsolidatedReportProps {
    records: RecordType[] | null;
}

export default function ConsolidatedReport({ records }: ConsolidatedReportProps) {

  const consolidatedData = useMemo(() => {
    if (!records || records.length === 0) return null;
    return consolidateRecords(records);
  }, [records]);

  if (!consolidatedData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-2xl font-semibold text-foreground">No Data for Consolidated Report</h2>
        <p className="mt-2 text-muted-foreground">This patient has no medical documents to generate a report from.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-2 sm:p-4 lg:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Patient Health Summary</CardTitle>
                <CardDescription>An aggregated overview of all available medical records.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <FileText className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{consolidatedData.summary.recordCount}</p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-bold">{consolidatedData.summary.dateRange}</p>
                    <p className="text-sm text-muted-foreground">Date Range</p>
                </div>
                 <div className="p-4 bg-muted/50 rounded-lg">
                    <AlertCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold">{consolidatedData.diagnoses.length}</p>
                    <p className="text-sm text-muted-foreground">Unique Diagnoses</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <Pill className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{consolidatedData.medications.length}</p>
                    <p className="text-sm text-muted-foreground">Unique Medications</p>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="text-red-500"/>Key Diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>First Mentioned</TableHead>
                    <TableHead className='text-right'>Frequency</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {consolidatedData.diagnoses.map(d => (
                    <TableRow key={d.name}>
                        <TableCell className="font-semibold">{d.name}</TableCell>
                        <TableCell>{d.firstMentioned}</TableCell>
                        <TableCell className='text-right'>
                            <Badge variant="secondary">{d.count} Record(s)</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pill className="text-blue-500"/>Medications</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Mentioned</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {consolidatedData.medications.map(m => (
                    <TableRow key={m.name}>
                        <TableCell className="font-semibold">{m.name}</TableCell>
                        <TableCell>{m.latestDosage}</TableCell>
                        <TableCell>{m.latestFrequency}</TableCell>
                        <TableCell>{m.lastMentioned}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Microscope className="text-purple-500"/>Lab Result Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {Object.values(consolidatedData.labResults).map(lab => (
              <div key={lab.name} className="border p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{lab.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">Latest: <span className="font-semibold text-foreground">{lab.latest.value}</span> (on {lab.latest.date})</p>
                <div className="h-60 w-full">
                    <LabTrendChart data={lab.history} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
