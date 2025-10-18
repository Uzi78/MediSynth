'use client';

import { useState, useRef, type DragEvent, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { Upload, FileText, Loader, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { Record as RecordType } from '@/lib/types';
import RecordDisplay from './record-display';
import { mockPatients } from '@/lib/data';

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  status: string;
}

const pipelineStages = [
    { progress: 20, status: 'OCR in progress...', stageIndex: 1 },
    { progress: 40, status: 'Extracting data...', stageIndex: 2 },
    { progress: 60, status: 'Generating summary...', stageIndex: 3 },
    { progress: 80, status: 'Organizing...', stageIndex: 4 },
    { progress: 100, status: 'Completed', stageIndex: 4 },
];

interface PatientPortalProps {
  setPipelineStage: Dispatch<SetStateAction<number>>;
}

export default function PatientPortal({ setPipelineStage }: PatientPortalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processedRecord, setProcessedRecord] = useState<RecordType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    setProcessedRecord(null); // Clear previous results
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      progress: 0,
      status: 'Uploading...',
    }));
    setUploadedFiles(newFiles);
    setPipelineStage(0);

    let stageIndex = 0;
    const interval = setInterval(() => {
        const stage = pipelineStages[stageIndex];
        setUploadedFiles(currentFiles => 
            currentFiles.map(file => 
                file.progress < 100 ? { ...file, progress: stage.progress, status: stage.status } : file
            )
        );
        setPipelineStage(stage.stageIndex);

        stageIndex++;
        if (stageIndex >= pipelineStages.length) {
            clearInterval(interval);
            // Simulate showing a processed record after completion
            // We'll use the first record from the mock data as an example result
            setProcessedRecord(mockPatients[0].records[0]);
        }
    }, 1500);
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
    setIsDragging(isEntering);
  };

  return (
    <div className="p-6 space-y-6">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300',
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <h3 className="text-xl font-semibold">Upload Medical Records</h3>
          <p className="text-gray-500">PDF, Images (JPG, PNG) or scanned documents</p>
          <Button onClick={() => fileInputRef.current?.click()}>Select Files</Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && !processedRecord && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Processing Status</h3>
          {uploadedFiles.map(file => (
            <div key={file.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                  <p className="font-medium truncate">{file.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                  <span>{file.status}</span>
                  {file.progress < 100 ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              <Progress value={file.progress} />
            </div>
          ))}
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
