import {
  Campaign,
  AssessmentForm,
  FormResponse,
  ClinicalIntervention,
  NotificationLog,
  RiskLevel,
  UserProfile
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_FORMS,
  INITIAL_RESPONSES,
  INITIAL_INTERVENTIONS,
  INITIAL_USERS
} from '../data/initialData';
import { db, collection, getDocs, setDoc, doc } from '../firebase/config';

const STORAGE_KEYS = {
  CAMPAIGNS: 'bemestar_campaigns_v1',
  FORMS: 'bemestar_forms_v1',
  RESPONSES: 'bemestar_responses_v1',
  INTERVENTIONS: 'bemestar_interventions_v1',
  NOTIFICATIONS: 'bemestar_notifications_v1',
  USERS: 'bemestar_users_v1',
};

// Helper for local storage persistence
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

class DataService {
  private campaigns: Campaign[] = [];
  private forms: AssessmentForm[] = [];
  private responses: FormResponse[] = [];
  private interventions: ClinicalIntervention[] = [];
  private notifications: NotificationLog[] = [];
  private users: UserProfile[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    this.campaigns = loadLocal(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    this.forms = loadLocal(STORAGE_KEYS.FORMS, INITIAL_FORMS);
    this.responses = loadLocal(STORAGE_KEYS.RESPONSES, INITIAL_RESPONSES);
    this.interventions = loadLocal(STORAGE_KEYS.INTERVENTIONS, INITIAL_INTERVENTIONS);
    this.users = loadLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.notifications = loadLocal(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-01',
        campaignId: 'camp-teacher-mind-care-01',
        campaignTitle: 'Cuidado da Saúde Mental do Professor',
        recipientEmail: 'todos-os-professores@escolas.org',
        type: 'push',
        title: 'Novo questionário de acolhimento disponível',
        message: 'Prezado(a) professor(a), sua saúde mental é prioridade. Responda à avaliação até 18 de Outubro.',
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered'
      }
    ]);

    // Try background sync with Firestore if online and collection exists
    if (db) {
      try {
        const campSnap = await getDocs(collection(db, 'campaigns'));
        if (!campSnap.empty) {
          const remoteCamp = campSnap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
          this.campaigns = remoteCamp;
          saveLocal(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
        }
      } catch (e) {
        // Fallback gracefully to local/in-memory
      }
    }
  }

  // CAMPAIGNS
  public getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  public async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'responseCount'>): Promise<Campaign> {
    const newCamp: Campaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      responseCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCamp);
    saveLocal(STORAGE_KEYS.CAMPAIGNS, this.campaigns);

    if (db) {
      try {
        await setDoc(doc(db, 'campaigns', newCamp.id), newCamp);
      } catch (err) {
        console.warn('Firestore sync note:', err);
      }
    }

    // Auto-create initial dispatch notification if strict deadline
    if (newCamp.notificationMode === 'strict_deadlines' && newCamp.deadlineDate) {
      this.sendCampaignNotification(
        newCamp.id,
        newCamp.title,
        'push',
        `Nova Campanha: ${newCamp.title}`,
        `Questionário obrigatório aberto. Prazo final para preenchimento: ${newCamp.deadlineDate}.`,
        'participantes@escola.gov.br'
      );
    }

    return newCamp;
  }

  // FORMS
  public getForms(campaignId?: string): AssessmentForm[] {
    if (campaignId) {
      return this.forms.filter(f => f.campaignId === campaignId);
    }
    return [...this.forms];
  }

  public getFormById(formId: string): AssessmentForm | undefined {
    return this.forms.find(f => f.id === formId);
  }

  public async createForm(formData: Omit<AssessmentForm, 'id' | 'createdAt'>): Promise<AssessmentForm> {
    const newForm: AssessmentForm = {
      ...formData,
      id: `form-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.forms.unshift(newForm);
    saveLocal(STORAGE_KEYS.FORMS, this.forms);

    if (db) {
      try {
        await setDoc(doc(db, 'forms', newForm.id), newForm);
      } catch (err) {
        console.warn('Firestore sync note:', err);
      }
    }
    return newForm;
  }

  // SCORE CALCULATION & RISK DETECTOR
  public calculateScoreAndRisk(answers: Record<string, any>, form: AssessmentForm): {
    score: number;
    riskLevel: RiskLevel;
    isRiskAlert: boolean;
  } {
    let score = 70; // baseline neutral

    // Question-specific heuristics based on clinical indicators
    Object.entries(answers).forEach(([qId, val]) => {
      // Sleep quality
      if (typeof val === 'string') {
        if (val.includes('Péssima') || val.includes('insônia')) score -= 25;
        else if (val.includes('Ruim')) score -= 15;
        else if (val.includes('Regular')) score -= 5;
        else if (val.includes('Excelente')) score += 15;
        else if (val.includes('Boa')) score += 10;
      }

      // Stress slider (0-10)
      if (qId.includes('stress') || qId.includes('slider')) {
        const stressVal = Number(val);
        if (!isNaN(stressVal)) {
          score -= (stressVal - 5) * 5; // e.g. 10 -> -25 pts, 0 -> +25 pts
        }
      }

      // Overtime hours
      if (qId.includes('hours') || qId.includes('overtime')) {
        const hours = Number(val);
        if (!isNaN(hours)) {
          if (hours > 15) score -= 15;
          else if (hours > 8) score -= 8;
        }
      }

      // Symptoms checklist
      if (Array.isArray(val)) {
        val.forEach(sym => {
          if (sym.includes('crônico') || sym.includes('Ansiedade') || sym.includes('perdeu o sentido')) {
            score -= 10;
          } else if (sym.includes('Tensão') || sym.includes('Irritabilidade')) {
            score -= 6;
          } else if (sym.includes('Nenhum')) {
            score += 10;
          }
        });
      }
    });

    // Clamp score 0 - 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    let riskLevel: RiskLevel = 'low';
    if (score <= 35) riskLevel = 'critical';
    else if (score <= form.safetyThreshold) riskLevel = 'high';
    else if (score <= 65) riskLevel = 'moderate';
    else riskLevel = 'low';

    const isRiskAlert = score <= form.safetyThreshold || riskLevel === 'critical' || riskLevel === 'high';

    return { score, riskLevel, isRiskAlert };
  }

  // RESPONSES
  public getResponses(campaignId?: string): FormResponse[] {
    if (campaignId) {
      return this.responses.filter(r => r.campaignId === campaignId);
    }
    return [...this.responses];
  }

  public getResponsesForUser(userId: string): FormResponse[] {
    return this.responses.filter(r => r.userId === userId);
  }

  public async submitResponse(data: {
    campaignId: string;
    campaignTitle: string;
    formId: string;
    formTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    userDepartment?: string;
    answers: Record<string, any>;
  }): Promise<FormResponse> {
    const form = this.getFormById(data.formId) || INITIAL_FORMS[0];
    const { score, riskLevel, isRiskAlert } = this.calculateScoreAndRisk(data.answers, form);

    const newResponse: FormResponse = {
      ...data,
      id: `resp-${Date.now()}`,
      calculatedScore: score,
      riskLevel,
      isRiskAlert,
      alertAcknowledged: !isRiskAlert, // if not alert, auto-acknowledged
      submittedAt: new Date().toISOString()
    };

    this.responses.unshift(newResponse);
    saveLocal(STORAGE_KEYS.RESPONSES, this.responses);

    // Update campaign response count
    const camp = this.campaigns.find(c => c.id === data.campaignId);
    if (camp) {
      camp.responseCount = (camp.responseCount || 0) + 1;
      saveLocal(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    }

    if (db) {
      try {
        await setDoc(doc(db, 'responses', newResponse.id), newResponse);
      } catch (err) {
        console.warn('Firestore sync note:', err);
      }
    }

    return newResponse;
  }

  public async acknowledgeAlert(responseId: string, psychologistName: string) {
    const target = this.responses.find(r => r.id === responseId);
    if (target) {
      target.alertAcknowledged = true;
      target.acknowledgedBy = psychologistName;
      target.acknowledgedAt = new Date().toISOString();
      saveLocal(STORAGE_KEYS.RESPONSES, this.responses);

      if (db) {
        try {
          await setDoc(doc(db, 'responses', target.id), target);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  // CLINICAL INTERVENTIONS
  public getInterventions(): ClinicalIntervention[] {
    return [...this.interventions];
  }

  public async createIntervention(intervention: Omit<ClinicalIntervention, 'id' | 'timestamp'>): Promise<ClinicalIntervention> {
    const newInt: ClinicalIntervention = {
      ...intervention,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.interventions.unshift(newInt);
    saveLocal(STORAGE_KEYS.INTERVENTIONS, this.interventions);

    if (db) {
      try {
        await setDoc(doc(db, 'interventions', newInt.id), newInt);
      } catch (e) {
        // ignore
      }
    }
    return newInt;
  }

  // NOTIFICATIONS
  public getNotifications(): NotificationLog[] {
    return [...this.notifications];
  }

  public sendCampaignNotification(
    campaignId: string,
    campaignTitle: string,
    type: 'push' | 'email',
    title: string,
    message: string,
    recipientEmail: string = 'participantes@escola.gov.br'
  ): NotificationLog {
    const notif: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      campaignId,
      campaignTitle,
      recipientEmail,
      type,
      title,
      message,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };
    this.notifications.unshift(notif);
    saveLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    return notif;
  }

  // USERS
  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  // CSV EXPORT FOR SPSS / R / PYTHON / STATA STATISTICAL ANALYSIS
  public generateCSV(campaignId?: string): string {
    const targetResponses = campaignId ? this.responses.filter(r => r.campaignId === campaignId) : this.responses;
    if (targetResponses.length === 0) {
      return 'No data available for export';
    }

    // Collect all question IDs
    const questionIds = new Set<string>();
    targetResponses.forEach(r => {
      Object.keys(r.answers || {}).forEach(k => questionIds.add(k));
    });
    const questionHeaders = Array.from(questionIds);

    // Build header row
    const headers = [
      'Response_ID',
      'Campaign_ID',
      'Campaign_Title',
      'User_ID',
      'User_Name',
      'User_Email',
      'User_Department',
      'Calculated_Score',
      'Risk_Level',
      'Is_Risk_Alert',
      'Alert_Acknowledged',
      'Acknowledged_By',
      'Submitted_At',
      ...questionHeaders.map(q => `Question_${q}`)
    ];

    const rows = targetResponses.map(r => {
      const qValues = questionHeaders.map(q => {
        const val = r.answers[q];
        if (val === undefined || val === null) return '""';
        if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      return [
        `"${r.id}"`,
        `"${r.campaignId}"`,
        `"${r.campaignTitle.replace(/"/g, '""')}"`,
        `"${r.userId}"`,
        `"${r.userName.replace(/"/g, '""')}"`,
        `"${r.userEmail}"`,
        `"${(r.userDepartment || '').replace(/"/g, '""')}"`,
        r.calculatedScore,
        `"${r.riskLevel}"`,
        r.isRiskAlert ? 1 : 0,
        r.alertAcknowledged ? 1 : 0,
        `"${(r.acknowledgedBy || '').replace(/"/g, '""')}"`,
        `"${r.submittedAt}"`,
        ...qValues
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // RESET
  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.FORMS);
    localStorage.removeItem(STORAGE_KEYS.RESPONSES);
    localStorage.removeItem(STORAGE_KEYS.INTERVENTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    this.init();
  }
}

export const dataService = new DataService();
