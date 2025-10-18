'use client';

import { useState, useRef, type DragEvent, type ChangeEvent, type Dispatch, type SetStateAction, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { Record as RecordType } from '@/lib/types';
import RecordDisplay from './record-display';
import { extractMedicalData, ExtractMedicalDataOutput } from '@/ai/flows/extract-medical-data';
import { generateConciseSummary } from '@/ai/flows/generate-concise-summary';
import { ocrDocument } from '@/ai/flows/ocr-document';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy } from 'firebase/firestore';
import RecordHistoryList from './record-history-list';

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  status: string;
  isProcessing: boolean;
  processedRecord: RecordType | null;
}

const pipelineStages = [
    { progress: 0, status: 'Uploading...', stageIndex: 0 },
    { progress: 25, status: 'Performing OCR...', stageIndex: 1 },
    { progress: 50, status: 'Extracting data...', stageIndex: 2 },
    { progress: 75, status: 'Generating summary...', stageIndex: 3 },
    { progress: 100, status: 'Completed', stageIndex: 4 },
];

interface PatientPortalProps {
  setPipelineStage: Dispatch<SetStateAction<number>>;
}

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function PatientPortal({ setPipelineStage }: PatientPortalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const recordsRef = useMemoFirebase(() => 
    (user && firestore) ? collection(firestore, 'users', user.uid, 'patients', user.uid, 'records') : null
  , [user, firestore]);

  const recordsQuery = useMemoFirebase(() => 
    recordsRef ? query(recordsRef, orderBy('date', 'desc')) : null
  , [recordsRef]);

  const { data: records, isLoading: isLoadingRecords } = useCollection<RecordType>(recordsQuery);

  useEffect(() => {
    // When records load, if no record is selected, select the most recent one.
    if (!isLoadingRecords && records && records.length > 0 && !selectedRecord) {
      setSelectedRecord(records[0]);
    }
  }, [records, isLoadingRecords, selectedRecord]);


  const processFiles = async (files: FileList) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to upload documents.',
      });
      return;
    }

    setIsUploading(true);
    setPipelineStage(0);

    const fileUploadPromises = Array.from(files).map(async (file) => {
        const fileId = crypto.randomUUID();
        try {
            const documentUri = await readFileAsDataURL(file);
            setPipelineStage(1); // OCR
            
            const { rawText } = await ocrDocument({ documentUri });
            setPipelineStage(2); // Extraction
            
            const extractedData: ExtractMedicalDataOutput = await extractMedicalData({ documentText: rawText });
            
            const tempRecordForSummary = {
              id: fileId,
              date: new Date().toISOString(),
              type: file.name,
              status: 'processing' as const,
              rawDocument: rawText,
              extractedData: {
                  diagnosis: extractedData.diagnosis,
                  medications: extractedData.medications,
                  labResults: extractedData.labResults,
              }
            };
            setPipelineStage(3); // Summarization
            
            const { summary } = await generateConciseSummary({ record: tempRecordForSummary });
            
            const finalRecord: Omit<RecordType, 'id'> = {
              date: tempRecordForSummary.date,
              type: tempRecordForSummary.type,
              status: 'completed',
              summary: summary,
              rawDocument: rawText,
              extractedData: tempRecordForSummary.extractedData,
              patientId: user.uid, 
            };

            if (recordsRef) {
               await addDoc(recordsRef, finalRecord);
            }
            
            toast({
                title: "Upload Successful",
                description: `${file.name} has been processed and saved.`,
            });
        } catch (error) {
            console.error("Error processing file:", file.name, error);
            toast({
                variant: "destructive",
                title: `Processing Failed for ${file.name}`,
                description: "There was an error processing this document. Please try again.",
            });
        }
    });

    await Promise.all(fileUploadPromises);
    setIsUploading(false);
    setPipelineStage(4); // Completion
    setTimeout(() => setPipelineStage(-1), 2000); // Reset pipeline viz after a delay
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(isEntering);
  };
  
  const handleSelectRecord = (recordId: string) => {
    const record = records?.find(r => r.id === recordId) || null;
    setSelectedRecord(record);
  };
  
  const handleAddNew = () => {
    setSelectedRecord(null);
  };


  return (
    <div className="p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
        <div className="lg:col-span-4 xl:col-span-3">
            <RecordHistoryList 
                records={records || []}
                selectedRecordId={selectedRecord?.id || null}
                onSelectRecord={handleSelectRecord}
                onAddNew={handleAddNew}
                isLoading={isLoadingRecords}
            />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
            {selectedRecord ? (
                <RecordDisplay record={selectedRecord} />
            ) : (
                <div
                    className={cn(
                    'relative h-full border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 flex flex-col items-center justify-center',
                    isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
                    isUploading && 'cursor-not-allowed opacity-60'
                    )}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                >
                    <div className="flex flex-col items-center justify-center space-y-4">
                    <Upload className="w-12 h-12 text-gray-400" />
                    <h3 className="text-xl font-semibold">Upload Medical Records</h3>
                    <p className="text-gray-500">Drop PDF or Image files here</p>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>Select Files</Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        multiple
                    />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
