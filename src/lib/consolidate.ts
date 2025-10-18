'use client';
import type { Record, Medication, LabResult } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface ConsolidatedDiagnosis {
  name: string;
  count: number;
  firstMentioned: string;
  lastMentioned: string;
}

interface ConsolidatedMedication {
  name: string;
  latestDosage: string;
  latestFrequency: string;
  firstMentioned: string;
  lastMentioned: string;
}

interface LabHistoryPoint {
  date: string;
  value: number;
}

interface ConsolidatedLabResult {
  name: string;
  latest: {
    value: string;
    date: string;
    range: string;
    status: 'High' | 'Normal' | 'Low';
  };
  history: LabHistoryPoint[];
}

export interface ConsolidatedData {
  summary: {
    recordCount: number;
    dateRange: string;
  };
  diagnoses: ConsolidatedDiagnosis[];
  medications: ConsolidatedMedication[];
  labResults: Record<string, ConsolidatedLabResult>;
}

export function consolidateRecords(records: Record[]): ConsolidatedData {
  if (!records || records.length === 0) {
    return {
      summary: { recordCount: 0, dateRange: 'N/A' },
      diagnoses: [],
      medications: [],
      labResults: {},
    };
  }

  const sortedRecords = [...records].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  const firstDate = format(parseISO(sortedRecords[0].date), 'MMM yyyy');
  const lastDate = format(parseISO(sortedRecords[sortedRecords.length - 1].date), 'MMM yyyy');

  const diagnosisMap = new Map<string, ConsolidatedDiagnosis>();
  const medicationMap = new Map<string, ConsolidatedMedication>();
  const labResultMap = new Map<string, ConsolidatedLabResult>();

  for (const record of sortedRecords) {
    const recordDate = parseISO(record.date);
    const formattedDate = format(recordDate, 'yyyy-MM-dd');

    // Consolidate Diagnoses
    record.extractedData.diagnosis.forEach(diagName => {
      if (diagnosisMap.has(diagName)) {
        const existing = diagnosisMap.get(diagName)!;
        existing.count++;
        existing.lastMentioned = formattedDate;
      } else {
        diagnosisMap.set(diagName, {
          name: diagName,
          count: 1,
          firstMentioned: formattedDate,
          lastMentioned: formattedDate,
        });
      }
    });

    // Consolidate Medications
    record.extractedData.medications.forEach(med => {
      const existing = medicationMap.get(med.name) || {
        name: med.name,
        latestDosage: med.dosage,
        latestFrequency: med.frequency,
        firstMentioned: formattedDate,
        lastMentioned: formattedDate,
      };
      
      existing.latestDosage = med.dosage;
      existing.latestFrequency = med.frequency;
      existing.lastMentioned = formattedDate;
      medicationMap.set(med.name, existing);
    });

    // Consolidate Lab Results
    record.extractedData.labResults.forEach(lab => {
      const numericValue = parseFloat(lab.value);
      if (isNaN(numericValue)) return; // Skip non-numeric lab values

      const existing = labResultMap.get(lab.test) || {
        name: lab.test,
        latest: { value: 'N/A', date: '', range: '', status: 'Normal' },
        history: [],
      };

      existing.latest = {
        value: lab.value,
        date: formattedDate,
        range: lab.range,
        status: lab.status,
      };
      existing.history.push({ date: formattedDate, value: numericValue });
      labResultMap.set(lab.test, existing);
    });
  }

  return {
    summary: {
      recordCount: records.length,
      dateRange: `${firstDate} - ${lastDate}`,
    },
    diagnoses: Array.from(diagnosisMap.values()).sort((a,b) => b.count - a.count),
    medications: Array.from(medicationMap.values()).sort((a, b) => parseISO(b.lastMentioned).getTime() - parseISO(a.lastMentioned).getTime()),
    labResults: Object.fromEntries(labResultMap.entries()),
  };
}
