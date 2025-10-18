'use client';

import { FileText } from 'lucide-react';

export default function ReportView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">Consolidated Report</h2>
        <p className="mt-2 text-gray-500">This feature is currently under development.</p>
        <p className="text-gray-500">Soon, you'll be able to see a merged view of all your medical data here.</p>
    </div>
  );
}
