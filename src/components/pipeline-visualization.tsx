'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const stages = [
  'Upload',
  'OCR',
  'Extraction',
  'Summarization',
  'Organization',
];

interface PipelineVisualizationProps {
  currentStage: number;
}

export default function PipelineVisualization({ currentStage }: PipelineVisualizationProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isActive = index <= currentStage;
          const isCompleted = index < currentStage;

          return (
            <div key={stage} className="flex items-center w-full">
              <div className="flex flex-col items-center gap-2 z-10">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-500',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-card border-2'
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : index + 1}
                </div>
                <p className="text-xs sm:text-sm text-center font-medium">{stage}</p>
              </div>

              {index < stages.length - 1 && (
                <div className="flex-1 h-1 bg-border relative -mx-1">
                   <div
                    className={cn(
                      'absolute top-0 left-0 h-full bg-primary transition-all duration-500',
                      isActive ? 'w-full' : 'w-0'
                    )}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
