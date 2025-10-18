'use client';

import { useState } from 'react';
import type { Patient, Record, LabResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, Pill } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface DetailedViewProps {
  patient: Patient;
}

const getStatusBadgeClass = (status: LabResult['status']) => {
  switch (status) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Normal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function DetailedView({ patient }: DetailedViewProps) {
  const sortedRecords = [...patient.records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(sortedRecords[0]?.id || null);
  const [showRaw, setShowRaw] = useState(false);
  
  const selectedRecord = sortedRecords.find(r => r.id === selectedRecordId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[60vh]">
      <div className="md:col-span-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[50vh] px-4">
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 ml-3"></div>
                {sortedRecords.map(record => (
                  <div key={record.id} className="mb-6 cursor-pointer" onClick={() => setSelectedRecordId(record.id)}>
                    <div className="absolute left-0 w-3 h-3 bg-border rounded-full -translate-x-1/2 mt-1.5">
                      {selectedRecordId === record.id && <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>}
                    </div>
                    <div className={cn('p-3 rounded-lg border-2', selectedRecordId === record.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent')}>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold mt-1">{record.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-8">
        <Card className="h-full">
          {selectedRecord ? (
            <ScrollArea className="h-[60vh]">
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-xl font-bold">{selectedRecord.type}</h3>
                  <p className="text-gray-500">Date: {new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" onClick={() => setShowRaw(!showRaw)}>
                  {showRaw ? 'Show Structured Data' : 'Show Raw Document'}
                </Button>
              </div>
              <Separator />

              {showRaw ? (
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{selectedRecord.rawDocument}</pre>
                </div>
              ) : (
                <div className="space-y-6">
                   {selectedRecord.extractedData.diagnosis.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500"/>Diagnoses</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedRecord.extractedData.diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedRecord.extractedData.medications.length > 0 && (
                     <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><Pill className="w-5 h-5 text-blue-500"/>Medications</h4>
                      <div className="space-y-2">
                        {selectedRecord.extractedData.medications.map((m,i) => (
                           <div key={i} className="p-3 bg-blue-50 rounded-md border border-blue-100 flex justify-between items-center">
                              <span className="font-medium text-blue-900">{m.name}</span>
                              <span className="text-sm text-blue-800">{m.dosage}, {m.frequency}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRecord.extractedData.labResults.length > 0 && (
                     <div>
                      <h4 className="font-semibold mb-2">Lab Results</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRecord.extractedData.labResults.map((r,i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{r.test}</TableCell>
                              <TableCell>{r.value}</TableCell>
                              <TableCell>{r.range}</TableCell>
                              <TableCell>
                                <Badge className={cn('font-semibold', getStatusBadgeClass(r.status))}>{r.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                   <div>
                      <h4 className="font-semibold mb-2">Clinical Summary</h4>
                      <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">
                        {selectedRecord.summary}
                      </div>
                    </div>
                </div>
              )}
            </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a record from the timeline to view details.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
