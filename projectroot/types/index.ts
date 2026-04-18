export interface Consultation {
  id: string;
  title: string;
  specialist: string;
  date: string;
  mode: "Virtual" | "In Person";
  status: "Scheduled" | "Confirmed" | "Pending";
}

export interface Credential {
  id: string;
  issuer: string;
  subject: string;
  type: string;
  status: "Verified" | "Pending Review" | "Action Needed";
  lastChecked: string;
}

export interface DiagnosisEntry {
  id: string;
  caseId: string;
  authorName: string;
  specialty: string;
  note: string;
  status: "Shared" | "Needs Review" | "Resolved";
  createdAt: string;
  confidenceScore: number;
}

export interface MedicalRecord {
  id: string;
  recordedAt: string;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  temperature: string;
  heightCm: number;
  weightKg: number;
  allergies: string[];
  conditions: string[];
  medications: string[];
}

export interface ProfileSummary {
  id: string;
  fullName: string;
  role: string;
  bloodType: string;
  emergencyContact: string;
  insuranceProvider: string;
  dob: string;
}

export interface DashboardData {
  demoMode: boolean;
  profile: ProfileSummary;
  consultations: Consultation[];
  credentials: Credential[];
  diagnoses: DiagnosisEntry[];
  medicalRecords: MedicalRecord[];
}
