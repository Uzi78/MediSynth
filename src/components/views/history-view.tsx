'use client';

import { useState } from 'react';
import type { Record as RecordType } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { AlertCircle, Pill } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const getStatusBadgeClass = (status: 'High' | 'Normal' | 'Low') => {
    switch (status) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

function RecordDetails({ record }: { record: RecordType }) {
    return (
        <Card className="h-full shadow-lg">
          <ScrollArea className='h-[calc(100vh-12rem)]'>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-bold">{record.type}</h3>
                <p className="text-gray-500">Date: {new Date(record.date).toLocaleDateString()}</p>
              </div>
            </div>
            <Separator />
  
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
          </div>
          </ScrollArea>
        </Card>
    );
}

export default function HistoryView() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
  
    const recordsRef = useMemoFirebase(() => 
      (user && firestore) ? collection(firestore, 'users', user.uid, 'patients', user.uid, 'records') : null
    , [user, firestore]);
  
    const recordsQuery = useMemoFirebase(() => 
      recordsRef ? query(recordsRef, orderBy('date', 'desc')) : null
    , [recordsRef]);
  
    const { data: records, isLoading: isLoadingRecords } = useCollection<RecordType>(recordsQuery, {
        onData: (data) => {
          if (data && data.length > 0 && !selectedRecord) {
              setSelectedRecord(data[0]);
          }
        }
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-4 xl:col-span-3">
                <Card className="h-full shadow-md">
                    <div className='p-4'>
                        <h3 className='text-lg font-semibold'>All Records</h3>
                    </div>
                    <Separator />
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                        <div className="p-2 space-y-2">
                        {isLoadingRecords ? (
                            Array.from({length: 5}).map((_, i) => <Skeleton key={i} className='h-16 w-full' />)
                        ) : records && records.length > 0 ? (
                            records.map(record => (
                                <div
                                key={record.id}
                                onClick={() => setSelectedRecord(record)}
                                className={cn(
                                    'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                                    'hover:border-primary/50 hover:shadow-sm',
                                    selectedRecord?.id === record.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-transparent bg-card'
                                )}
                                >
                                    <p className="font-semibold text-gray-800 text-sm truncate pr-4">{record.type}</p>
                                    <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                                        <span>{new Date(record.date).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            <span>Details</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='text-center text-gray-500 p-8'>
                                <p>No records found.</p>
                                <p className='text-sm mt-2'>Upload a document to get started.</p>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                </Card>
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
                {selectedRecord ? (
                    <RecordDetails record={selectedRecord} />
                ) : (
                   !isLoadingRecords && <div className='flex h-full items-center justify-center text-gray-500'><p>Select a record to view its details.</p></div>
                )}
            </div>
        </div>
    );
}
