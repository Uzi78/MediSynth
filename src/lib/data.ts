import type { Patient, ConsultationRequest, RecentMessage } from './types';

export const mockPatients: Patient[] = [
  {
    id: 'p001',
    name: 'Ahmed Khan',
    age: 45,
    gender: 'M',
    email: 'ahmed.khan@example.com',
    records: [
      {
        id: 'rec001',
        patientId: 'p001',
        date: '2024-05-15',
        type: 'Lab Report',
        status: 'completed',
        extractedData: {
          diagnosis: ['Type 2 Diabetes', 'Hypertension'],
          medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          ],
          labResults: [
            { test: 'HbA1c', value: '7.8%', range: '4.0 - 5.6%', status: 'High' },
            { test: 'Fasting Glucose', value: '145 mg/dL', range: '70-99 mg/dL', status: 'High' },
            { test: 'Cholesterol', value: '180 mg/dL', range: '<200 mg/dL', status: 'Normal' },
          ],
          vitals: {
            bp: '140/90 mmHg',
            pulse: '82 bpm',
            temp: '98.6°F',
            weight: '195 lbs',
          },
        },
        summary: 'Patient presented with elevated blood glucose and blood pressure, consistent with diagnoses of Type 2 Diabetes and Hypertension. Current medication regimen appears to be managing conditions, but further monitoring of HbA1c is recommended.',
        rawDocument: `
PATIENT: Ahmed Khan, 45M
DATE: 2024-05-15
SUBJECTIVE: Patient reports occasional fatigue and increased thirst. Denies chest pain or shortness of breath.
OBJECTIVE:
- Vitals: BP 140/90, P 82, T 98.6F, Wt 195 lbs
- Labs: HbA1c 7.8% (High), Fasting Glucose 145 mg/dL (High), Total Cholesterol 180 mg/dL (Normal).
ASSESSMENT:
1. Type 2 Diabetes Mellitus
2. Essential Hypertension
PLAN:
- Continue Metformin 500mg BID.
- Continue Lisinopril 10mg QD.
- Lifestyle modification counseling provided.
- Follow up in 3 months for repeat labs.
        `,
      },
      {
        id: 'rec002',
        patientId: 'p001',
        date: '2023-11-20',
        type: 'Prescription',
        status: 'completed',
        extractedData: {
          diagnosis: ['Acute Bronchitis'],
          medications: [
            { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily for 5 days' },
            { name: 'Cough Syrup', dosage: '10ml', frequency: 'As needed' },
          ],
          labResults: [],
        },
        summary: 'Patient diagnosed with acute bronchitis and prescribed a course of Azithromycin to treat the bacterial infection, along with cough syrup for symptomatic relief.',
        rawDocument: `
PRESCRIPTION NOTE
Patient: Ahmed Khan
Date: 2023-11-20
Diagnosis: Acute Bronchitis
Rx:
1. Azithromycin 500mg Tablets
   Sig: Take one tablet by mouth daily for 5 days.
2. Guaifenesin Syrup
   Sig: Take 10ml by mouth every 6 hours as needed for cough.
        `,
      },
    ],
  },
  {
    id: 'p002',
    name: 'Fatima Ali',
    age: 32,
    gender: 'F',
    email: 'fatima.ali@example.com',
    records: [],
  },
];

export const mockConsultationRequests: ConsultationRequest[] = [
    {
      id: 'cr001',
      patient: { name: 'Ali Hassan', age: 34, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=ali' },
      requestedTime: '10:00 AM',
      complaint: "Persistent cough and fever for 3 days.",
      urgency: 'High',
    },
    {
      id: 'cr002',
      patient: { name: 'Fatima Ahmed', age: 28, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=fatima' },
      requestedTime: '11:30 AM',
      complaint: "Follow-up for seasonal allergies.",
      urgency: 'Low',
    },
    {
        id: 'cr003',
        patient: { name: 'Zainab Omar', age: 45, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=zainab' },
        requestedTime: '2:00 PM',
        complaint: "Mild headache and fatigue.",
        urgency: 'Medium',
    },
];

export const mockScheduledConsultations: any[] = [
    {
        id: 'sc001',
        patient: { name: 'Yusuf Ibrahim', age: 52, gender: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=yusuf' },
        scheduledTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        complaint: 'Medication refill request'
    },
    {
        id: 'sc002',
        patient: { name: 'Aisha Khan', age: 29, gender: 'F', avatarUrl: 'https://i.pravatar.cc/150?u=aisha' },
        scheduledTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        complaint: 'Review of recent lab results'
    }
]
  
export const mockRecentMessages: RecentMessage[] = [
    {
      id: 'msg001',
      patient: { name: 'Yusuf Ibrahim', avatarUrl: 'https://i.pravatar.cc/150?u=yusuf' },
      preview: 'Thank you, doctor. I am feeling much better now.',
      time: '10:45 AM',
    },
    {
      id: 'msg002',
      patient: { name: 'Aisha Khan', avatarUrl: 'https://i.pravatar.cc/150?u=aisha' },
      preview: 'I have a question about the new prescription...',
      time: '9:30 AM',
    },
    {
        id: 'msg003',
        patient: { name: 'Bilal Ahmed', avatarUrl: 'https://i.pravatar.cc/150?u=bilal' },
        preview: 'Is it normal to experience this side effect?',
        time: 'Yesterday',
    },
    {
        id: 'msg004',
        patient: { name: 'Maryam Khalid', avatarUrl: 'https://i.pravatar.cc/150?u=maryam' },
        preview: 'Just checking in for my appointment tomorrow.',
        time: 'Yesterday',
    },
    {
        id: 'msg005',
        patient: { name: 'Omar Farooq', avatarUrl: 'https://i.pravatar.cc/150?u=omar' },
        preview: 'The pharmacy needs a confirmation for the refill.',
        time: '2 days ago',
    },
];
