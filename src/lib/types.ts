export interface Medication {
  name: string;
  dosage: string;
  frequency:string;
}

export interface LabResult {
  test: string;
  value: string;
  range: string;
  status: 'High' | 'Normal' | 'Low';
}

export interface Vitals {
  bp: string;
  pulse: string;
  temp: string;
  weight?: string;
}

export interface Record {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  type: string;
  status: 'processing' | 'completed';
  extractedData: {
    diagnosis: string[];
    medications: Medication[];
    labResults: LabResult[];
    vitals?: Vitals;
  };
  summary: string;
  rawDocument: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  email: string;
  records: Record[];
}
