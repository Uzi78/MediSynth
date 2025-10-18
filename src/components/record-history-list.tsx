'use client';

import type { Record } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface RecordHistoryListProps {
  records: Record[];
  selectedRecordId: string | null;
  onSelectRecord: (id: string) => void;
  onAddNew: () => void;
  isLoading: boolean;
}

export default function RecordHistoryList({ records, selectedRecordId, onSelectRecord, onAddNew, isLoading }: RecordHistoryListProps) {
  return (
    <Card className="h-full shadow-md">
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle className='text-lg'>All Records</CardTitle>
        <Button size="sm" variant="ghost" onClick={onAddNew} className='flex items-center gap-2'>
            <PlusCircle className="w-4 h-4" />
            New
        </Button>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-[60vh] px-2">
          <div className="p-2 space-y-2">
            {isLoading ? (
                Array.from({length: 5}).map((_, i) => <Skeleton key={i} className='h-16 w-full' />)
            ) : records.length > 0 ? (
              records.map(record => (
                <div
                  key={record.id}
                  onClick={() => onSelectRecord(record.id)}
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    'hover:border-primary/50 hover:shadow-sm',
                    selectedRecordId === record.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-card'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 text-sm truncate pr-4">{record.type}</p>
                    
                  </div>
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
      </CardContent>
    </Card>
  );
}
