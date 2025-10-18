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

// Summary data for a doctor's view of a patient
export interface DoctorPatient {
    id: string; // This will be the patient's ID
    name: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    recordCount: number;
}

export interface Consultation {
    id: string;
    patientId: string;
    patientName: string;
    patientAvatarUrl?: string;
    patientAge: number;
    patientGender: string;
    doctorId: string;
    complaint: string;
    urgency: 'High' | 'Medium' | 'Low';
    status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined';
    requestedAt: string; // ISO String
    scheduledFor?: string; // ISO String
}


export interface RecentMessage {
    id: string;
    patient: {
        name: string;
        avatarUrl: string;
    };
    preview: string;
    time: string;
}

export interface Prescription {
  medications: {
    drug: string;
    strength: string;
    form: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
}
