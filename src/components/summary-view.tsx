import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, FileText, Pill } from 'lucide-react';

interface SummaryViewProps {
  patient: Patient;
}

export default function SummaryView({ patient }: SummaryViewProps) {
  const latestRecord = patient.records.length > 0 ? patient.records.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b) : null;
  const diagnosesCount = patient.records.flatMap(r => r.extractedData.diagnosis).length;
  const medicationsCount = patient.records.flatMap(r => r.extractedData.medications).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Diagnoses</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{diagnosesCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Medications</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{medicationsCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Records</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{patient.records.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {latestRecord && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Latest Visit</CardTitle>
              <p className="text-sm text-gray-500">{new Date(latestRecord.date).toLocaleDateString()}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">{latestRecord.summary}</p>
            {latestRecord.extractedData.vitals && (
              <div>
                <h4 className="font-semibold mb-2">Vitals</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg"><strong>BP:</strong> {latestRecord.extractedData.vitals.bp}</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><strong>Pulse:</strong> {latestRecord.extractedData.vitals.pulse}</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><strong>Temp:</strong> {latestRecord.extractedData.vitals.temp}</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><strong>Weight:</strong> {latestRecord.extractedData.vitals.weight}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {latestRecord?.extractedData.diagnosis.length > 0 && (
         <div>
            <h3 className="text-lg font-semibold mb-3">Active Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {latestRecord.extractedData.diagnosis.map((diag, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="font-medium text-red-900">{diag}</p>
                </div>
              ))}
            </div>
        </div>
      )}

      {latestRecord?.extractedData.medications.length > 0 && (
        <div>
            <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
            <div className="space-y-3">
              {latestRecord.extractedData.medications.map((med, i) => (
                <div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-blue-500" />
                    <p className="font-bold text-blue-900">{med.name}</p>
                  </div>
                  <p className="text-sm text-blue-800">{med.dosage}, {med.frequency}</p>
                </div>
              ))}
            </div>
        </div>
      )}
    </div>
  );
}
