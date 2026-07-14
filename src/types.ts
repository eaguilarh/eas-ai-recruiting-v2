export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  stage: string; // e.g. 'application' | 'screening' | 'test' | 'interview' | 'manager_review' | 'hired' | 'rejected'
  competencies: Record<string, number>; // key: competency name, value: score 1-100
  fitScore: number; // scale 1-100
  summary: string;
  strengths: string[];
  growths: string[];
  recommendedQuestions: string[];
  suggestedTime: string; // e.g. "Lunes por la tarde" or YYYY-MM-DD
  channel: 'LinkedIn' | 'Glassdoor' | 'Referido' | 'EAS Consulting DB' | 'Otros';
  createdAt: string;
  isEncrypted: boolean;
  vacancyId?: string; // Assigned vacancy ID
}

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[]; // key skills/experience keywords
  experienceYears: number;
  salaryRange?: string;
  status: 'Open' | 'Closed';
  minCompetenciesRequired: Record<string, number>;
  englishLevel?: 'Básico' | 'Medio' | 'Avanzado';
  modalidad?: 'Presencial' | 'Remoto' | 'Híbrido';
}

export interface InterviewSlot {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewer: string;
  interviewerRole: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink: string;
  notes?: string;
  scorecard: {
    rating: number; // 1 to 5
    recommendation: 'hired' | 'review' | 'rejected';
    feedback: string;
    evaluatedCompetencies: Record<string, number>;
  } | null;
}

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  color: string; // Tailwind bg-color or border-color class
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  component: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface RecruitmentMetric {
  date: string; // YYYY-MM
  timeToHire: number; // average days
  conversionRate: number; // percentage
  activeOpenings: number;
  hiredCount: number;
  sourceBreakdown: {
    linkedIn: number;
    glassdoor: number;
    referrals: number;
    easDb: number;
    others: number;
  };
}

export type UserRole = 'ADMIN' | 'RECRUITER' | 'MANAGER';

export interface AIModelWeights {
  Liderazgo: number;
  Comunicacion: number;
  TrabajoEnEquipo: number;
  HabilidadesTecnicas: number;
  ResolucionDeProblemas: number;
  totalFeedbackCount: number;
}
