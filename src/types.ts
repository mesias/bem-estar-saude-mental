export type UserRole = 'manager' | 'psychologist' | 'user';

export type QuestionType =
  | 'options'
  | 'numbers'
  | 'dropdowns'
  | 'slider'
  | 'text'
  | 'file'
  | 'checkboxes';

export interface FormQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  helpText?: string;
  options?: string[]; // For options, dropdowns, checkboxes
  min?: number; // For slider or numbers
  max?: number; // For slider or numbers
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  weight?: number; // Weight in wellbeing score computation
  isRiskIndicator?: boolean; // If selected high value indicates psychological risk
  riskTriggerCondition?: {
    operator: 'gte' | 'lte' | 'in';
    value: any;
  };
}

export interface PersonalizedResource {
  id: string;
  title: string;
  description: string;
  category: 'crisis_helpline' | 'breathing_exercise' | 'support_channel' | 'article';
  minScore: number;
  maxScore: number;
  actionText?: string;
  actionUrlOrPhone?: string;
}

export interface AssessmentForm {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  psychologistId: string;
  psychologistName: string;
  questions: FormQuestion[];
  safetyThreshold: number; // e.g. Score <= 50 triggers professional alert
  personalizedResources: PersonalizedResource[];
  createdAt: string;
}

export type NotificationMode = 'strict_deadlines' | 'flexible_discretionary';
export type ReminderFrequency = 'daily' | 'every_3_days' | 'weekly' | 'none';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  status: 'active' | 'draft' | 'completed';
  notificationMode: NotificationMode;
  deadlineDate?: string;
  reminderFrequency: ReminderFrequency;
  createdByManagerId: string;
  createdByName: string;
  assignedPsychologistIds: string[];
  participantCount: number;
  responseCount: number;
  createdAt: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FormResponse {
  id: string;
  campaignId: string;
  campaignTitle: string;
  formId: string;
  formTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment?: string;
  answers: Record<string, any>;
  calculatedScore: number; // 0-100 wellbeing score
  riskLevel: RiskLevel;
  isRiskAlert: boolean; // Triggers alert to psychology professional
  alertAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  submittedAt: string;
}

export interface ClinicalIntervention {
  id: string;
  responseId: string;
  userId: string;
  userName: string;
  psychologistId: string;
  psychologistName: string;
  actionType: 'direct_call' | 'urgent_consultation' | 'resource_dispatched' | 'routine_monitoring';
  notes: string;
  timestamp: string;
}

export interface NotificationLog {
  id: string;
  campaignId: string;
  campaignTitle: string;
  recipientEmail: string;
  type: 'push' | 'email';
  title: string;
  message: string;
  sentAt: string;
  status: 'delivered' | 'read';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  departmentOrSchool: string;
  avatarUrl?: string;
}
