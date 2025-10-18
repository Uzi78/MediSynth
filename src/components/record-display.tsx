'use client';

import { useState } from 'react';
import type { Record, LabResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, Pill } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface RecordDisplayProps {
  record: Record;
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

export default function RecordDisplay({ record }: RecordDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
      <Card className="h-full shadow-lg">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-xl font-bold">{record.type}</h3>
              <p className="text-gray-500">Date: {new Date(record.date).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? 'Show Structured Data' : 'Show Raw Document'}
            </Button>
          </div>
          <Separator />

          {showRaw ? (
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{record.rawDocument}</pre>
            </div>
          ) : (
            <div className="space-y-6">
               {record.extractedData.diagnosis.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500"/>Diagnoses</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {record.extractedData.diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              {record.extractedData.medications.length > 0 && (
                 <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Pill className="w-5 h-5 text-blue-500"/>Medications</h4>
                  <div className="space-y-2">
                    {record.extractedData.medications.map((m,i) => (
                       <div key={i} className="p-3 bg-blue-50 rounded-md border border-blue-100 flex justify-between items-center">
                          <span className="font-medium text-blue-900">{m.name}</span>
                          <span className="text-sm text-blue-800">{m.dosage}, {m.frequency}</span>
                       </div>
                    ))}
                  </div>
                </div>
              )}
              {record.extractedData.labResults.length > 0 && (
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
                      {record.extractedData.labResults.map((r,i) => (
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
                    {record.summary}
                  </div>
                </div>
            </div>
          )}
        </div>
      </Card>
  );
}
