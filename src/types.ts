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
  variableName?: string; // e.g. "WHO5_Q1", "PSS_STRESS", for SPSS/R export
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

// Academic and Research Studies Classification
export type AcademicLevel =
  | 'flagship_study'        // Estudo Insígnia Institucional (Bem-Estar Docente)
  | 'mestrado'              // Dissertação de Mestrado
  | 'doutorado'             // Tese de Doutorado
  | 'pos_doc_docente'       // Pós-Doutorado / Pesquisa Docente
  | 'iniciacao_cientifica'; // Iniciação Científica (PIBIC/CNPq)

export type StudyDesignType =
  | 'longitudinal_weekly'     // Coorte Longitudinal Semanal (Respondentes avaliam sua semana)
  | 'cross_sectional'        // Estudo Transversal (Survey de Onda Única)
  | 'experimental_rct'       // Ensaio Clínico / Intervenção com Grupo Controle
  | 'psychometric_validation'// Validação de Escala Psicométrica (EFA / CFA)
  | 'diary_study';           // Estudo de Diário Ecológico (ESM)

export interface ResearchStudyMetadata {
  academicLevel: AcademicLevel;
  studyDesign: StudyDesignType;
  universityOrInstitute: string;
  graduateProgram: string;       // e.g. "Programa de Pós-Graduação em Psicologia (PPGP)"
  leadResearcher: string;        // Mestrando, Doutorando ou Docente Responsável
  academicAdvisor?: string;      // Professor(a) Orientador(a)
  ethicsApprovalCode?: string;   // Protocolo CEP/CONEP (ex: CAAE: 54910222.4.0000.5404)
  longitudinalTotalWeeks?: number; // Total de semanas previstas (ex: 8 semanas)
  currentWeekIndex?: number;       // Semana corrente do estudo
  weeklyNotificationDay?: 'sunday' | 'monday' | 'friday' | 'saturday'; // Dia do disparo da notificação semanal
  weeklyNotificationTime?: string; // Horário (ex: "18:00")
  sampleTargetSize: number;       // N amostral meta
  anonymizeInExports: boolean;    // Mascarar nomes para compliance ético
}

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
  isFlagship?: boolean;          // "Bem-Estar Saúde Mental dos Professores"
  researchMetadata?: ResearchStudyMetadata; // Academic and statistical research metadata
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
  weekNumber?: number;           // Para estudos longitudinais semanais (ex: Semana 1, 2, 3)
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

