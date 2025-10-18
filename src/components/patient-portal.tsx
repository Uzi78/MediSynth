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
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  status: string;
}

const pipelineStages = [
    { progress: 0, status: 'Uploading...', stageIndex: 0 },
    { progress: 25, status: 'Extracting data...', stageIndex: 1 },
    { progress: 65, status: 'Generating summary...', stageIndex: 2 },
    { progress: 100, status: 'Completed', stageIndex: 3 },
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
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedRecord, setProcessedRecord] = useState<RecordType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateProgress = (stageIndex: number) => {
    const stage = pipelineStages[stageIndex];
    setUploadedFile(currentFile => 
        currentFile ? { ...currentFile, progress: stage.progress, status: stage.status } : null
    );
    setPipelineStage(stage.stageIndex);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessedRecord(null);
    const newFile = {
      id: crypto.randomUUID(),
      name: file.name,
      progress: 0,
      status: 'Queued...',
    };
    setUploadedFile(newFile);
    updateProgress(0);

    try {
      const documentText = await readFileAsDataURL(file);
      
      // Stage 1: Extraction
      updateProgress(1);
      const extractedData: ExtractMedicalDataOutput = await extractMedicalData({ documentText });
      
      // Stage 2: Summarization
      updateProgress(2);
      const tempRecordForSummary = {
        id: newFile.id,
        date: new Date().toISOString(),
        type: 'Uploaded Document',
        status: 'processing' as const,
        rawDocument: '', // Not needed for summary generation
        extractedData: {
            diagnosis: extractedData.diagnosis,
            medications: extractedData.medications,
            labResults: extractedData.labResults,
        }
      };

      const { summary } = await generateConciseSummary({ record: tempRecordForSummary });

      // Stage 3: Completion
      updateProgress(3);
      const finalRecord: RecordType = {
        ...tempRecordForSummary,
        status: 'completed',
        summary: summary,
        rawDocument: "Raw document text would be stored here in a real scenario, but we'll display the extracted data.",
      };
      setProcessedRecord(finalRecord);

    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "There was an error processing your document. Please try again.",
      });
      setUploadedFile(null);
      setPipelineStage(-1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    setIsDragging(isEntering);
  };

  return (
    <div className="p-6 space-y-6">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300',
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
          isProcessing && 'cursor-not-allowed opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <h3 className="text-xl font-semibold">Upload Medical Record</h3>
          <p className="text-gray-500">Drop a single PDF or Image file here</p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>Select File</Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </div>
      </div>

      {uploadedFile && !processedRecord && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Processing Status</h3>
          <div key={uploadedFile.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                  <p className="font-medium truncate">{uploadedFile.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                  <span>{uploadedFile.status}</span>
                  {uploadedFile.progress < 100 ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              <Progress value={uploadedFile.progress} />
            </div>
        </div>
      )}

      {processedRecord && (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Processed Record Details</h3>
            <RecordDisplay record={processedRecord} />
        </div>
      )}
    </div>
  );
}
