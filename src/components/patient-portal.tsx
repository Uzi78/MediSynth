'use client';

import { useState, useRef, type DragEvent, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { Upload, FileText, Loader, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { Record as RecordType } from '@/lib/types';
import RecordDisplay from './record-display';
import { extractMedicalData, ExtractMedicalDataOutput } from '@/ai/flows/extract-medical-data';
import { generateConciseSummary } from '@/ai/flows/generate-concise-summary';
import { ocrDocument } from '@/ai/flows/ocr-document';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const updateProgress = (fileId: string, stageIndex: number) => {
    const stage = pipelineStages[stageIndex];
    setUploadedFiles(currentFiles => 
        currentFiles.map(f => f.id === fileId ? { ...f, progress: stage.progress, status: stage.status } : f)
    );
    // For simplicity, we only show overall pipeline progress for the first file.
    if (uploadedFiles.findIndex(f => f.id === fileId) === 0) {
      setPipelineStage(stage.stageIndex);
    }
  };

  const processFiles = async (files: FileList) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to upload documents.',
      });
      return;
    }

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      progress: 0,
      status: 'Queued...',
      isProcessing: true,
      processedRecord: null,
    }));
    setUploadedFiles(currentFiles => [...currentFiles, ...newFiles]);

    for (const newFile of newFiles) {
        const associatedFile = Array.from(files).find(f => f.name === newFile.name);
        if (!associatedFile) continue;

        try {
            updateProgress(newFile.id, 0); // Uploading
            const documentUri = await readFileAsDataURL(associatedFile);
            
            updateProgress(newFile.id, 1); // OCR
            const { rawText } = await ocrDocument({ documentUri });
            
            updateProgress(newFile.id, 2); // Extraction
            const extractedData: ExtractMedicalDataOutput = await extractMedicalData({ documentText: rawText });
            
            const tempRecordForSummary = {
              id: newFile.id,
              date: new Date().toISOString(),
              type: 'Uploaded Document',
              status: 'processing' as const,
              rawDocument: rawText,
              extractedData: {
                  diagnosis: extractedData.diagnosis,
                  medications: extractedData.medications,
                  labResults: extractedData.labResults,
              }
            };
            
            updateProgress(newFile.id, 3); // Summarization
            const { summary } = await generateConciseSummary({ record: tempRecordForSummary });
            
            const finalRecord: Omit<RecordType, 'id'> = {
              date: tempRecordForSummary.date,
              type: tempRecordForSummary.type,
              status: 'completed',
              summary: summary,
              rawDocument: rawText,
              extractedData: tempRecordForSummary.extractedData,
              patientId: user.uid, // Associate record with patient
            };

            // Save to Firestore
            // We assume a patient document with the same ID as the user UID exists.
            const recordsRef = collection(firestore, 'users', user.uid, 'patients', user.uid, 'records');
            await addDoc(recordsRef, finalRecord);

            updateProgress(newFile.id, 4); // Completion
            setUploadedFiles(currentFiles => currentFiles.map(f => f.id === newFile.id ? { 
                ...f, 
                isProcessing: false, 
                processedRecord: { ...finalRecord, id: newFile.id } as RecordType
            } : f));

        } catch (error) {
            console.error("Error processing file:", newFile.name, error);
            toast({
                variant: "destructive",
                title: `Processing Failed for ${newFile.name}`,
                description: "There was an error processing this document. Please try again.",
            });
            setUploadedFiles(currentFiles => currentFiles.map(f => f.id === newFile.id ? { ...f, isProcessing: false, status: 'Failed' } : f));
            setPipelineStage(-1);
        }
    }
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
    if (uploadedFiles.some(f=>f.isProcessing)) return;
    setIsDragging(isEntering);
  };
  
  const isAnyFileProcessing = uploadedFiles.some(f => f.isProcessing);

  return (
    <div className="p-6 space-y-6">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300',
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
          isAnyFileProcessing && 'cursor-not-allowed opacity-60'
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
          <Button onClick={() => fileInputRef.current?.click()} disabled={isAnyFileProcessing}>Select Files</Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={isAnyFileProcessing}
            multiple
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Processing Status</h3>
          {uploadedFiles.map(file => (
            <div key={file.id}>
              <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                    <p className="font-medium truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                    <span>{file.status}</span>
                    {file.isProcessing ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : file.progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : null}
                  </div>
                </div>
                {file.isProcessing && <Progress value={file.progress} />}
              </div>
              {file.processedRecord && (
                  <RecordDisplay record={file.processedRecord} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
