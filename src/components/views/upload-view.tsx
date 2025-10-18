'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Record as RecordType } from '@/lib/types';
import { extractMedicalData, ExtractMedicalDataOutput } from '@/ai/flows/extract-medical-data';
import { generateConciseSummary } from '@/ai/flows/generate-concise-summary';
import { ocrDocument } from '@/ai/flows/ocr-document';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import PipelineVisualization from '../pipeline-visualization';

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function UploadView() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isUploading, setIsUploading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(-1);

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

    const recordsRef = collection(firestore, 'users', user.uid, 'patients', user.uid, 'records');

    const fileUploadPromises = Array.from(files).map(async (file) => {
        const fileId = crypto.randomUUID();
        try {
            setPipelineStage(0);
            const documentUri = await readFileAsDataURL(file);
            setPipelineStage(1); // OCR
            
            const { rawText } = await ocrDocument({ documentUri });
            setPipelineStage(2); // Extraction
            
            const extractedData: ExtractMedicalDataOutput = await extractMedicalData({ documentText: rawText });
            
            const isExtractionEmpty = 
              extractedData.diagnosis.length === 0 &&
              extractedData.medications.length === 0 &&
              extractedData.labResults.length === 0;

            if (isExtractionEmpty) {
              toast({
                variant: "destructive",
                title: `Processing Failed for ${file.name}`,
                description: "No medical information could be extracted. The document might be empty or invalid.",
              });
              // Stop processing for this file, don't save to DB
              return; 
            }
            
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

            await addDoc(recordsRef, finalRecord);
            
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
    setTimeout(() => setPipelineStage(-1), 3000); // Reset pipeline viz after a delay
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
  
  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-full">
        {pipelineStage > -1 && (
            <div className='w-full max-w-2xl mb-8'>
                <PipelineVisualization currentStage={pipelineStage} />
            </div>
        )}
        <div
            className={cn(
            'relative h-full w-full border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 flex flex-col items-center justify-center',
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
    </div>
  );
}
