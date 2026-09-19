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
import { db, collection, getDocs, setDoc, doc, onSnapshot } from '../firebase/config';

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
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('DataService listener error:', e);
      }
    });
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

    // Live sync with Firestore if online and configured
    if (db) {
      try {
        // 1. Initial seed/sync Campaigns
        const campSnap = await getDocs(collection(db, 'campaigns'));
        if (!campSnap.empty) {
          const remoteCamp = campSnap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
          this.campaigns = remoteCamp;
          saveLocal(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
        } else {
          // Seed defaults to Firestore
          for (const c of INITIAL_CAMPAIGNS) {
            await setDoc(doc(db, 'campaigns', c.id), c);
          }
        }

        // 2. Initial seed/sync Forms
        const formSnap = await getDocs(collection(db, 'forms'));
        if (!formSnap.empty) {
          const remoteForms = formSnap.docs.map(d => ({ id: d.id, ...d.data() } as AssessmentForm));
          const existingIds = new Set(remoteForms.map(f => f.id));
          this.forms = [...remoteForms, ...INITIAL_FORMS.filter(f => !existingIds.has(f.id))];
          saveLocal(STORAGE_KEYS.FORMS, this.forms);
        } else {
          for (const f of INITIAL_FORMS) {
            await setDoc(doc(db, 'forms', f.id), f);
          }
        }

        // 3. Initial sync Responses
        const respSnap = await getDocs(collection(db, 'responses'));
        if (!respSnap.empty) {
          const remoteResp = respSnap.docs.map(d => ({ id: d.id, ...d.data() } as FormResponse));
          remoteResp.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          this.responses = remoteResp;
          saveLocal(STORAGE_KEYS.RESPONSES, this.responses);
        }

        this.notifyListeners();

        // 4. Real-time Listeners (onSnapshot) for live multi-device synchronization
        onSnapshot(collection(db, 'responses'), (snap) => {
          if (!snap.empty) {
            const liveResp = snap.docs.map(d => ({ id: d.id, ...d.data() } as FormResponse));
            liveResp.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            this.responses = liveResp;
            saveLocal(STORAGE_KEYS.RESPONSES, this.responses);
            this.notifyListeners();
          }
        }, (err) => {
          console.warn('Live responses sync notice:', err);
        });

        onSnapshot(collection(db, 'campaigns'), (snap) => {
          if (!snap.empty) {
            this.campaigns = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
            saveLocal(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
            this.notifyListeners();
          }
        }, (err) => {
          console.warn('Live campaigns sync notice:', err);
        });

        onSnapshot(collection(db, 'forms'), (snap) => {
          if (!snap.empty) {
            const liveForms = snap.docs.map(d => ({ id: d.id, ...d.data() } as AssessmentForm));
            const existingIds = new Set(liveForms.map(f => f.id));
            this.forms = [...liveForms, ...INITIAL_FORMS.filter(f => !existingIds.has(f.id))];
            saveLocal(STORAGE_KEYS.FORMS, this.forms);
            this.notifyListeners();
          }
        }, (err) => {
          console.warn('Live forms sync notice:', err);
        });
      } catch (e) {
        console.warn('Firestore initialization sync notice (operating in local offline-cache mode):', e);
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
    weekNumber?: number;
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
  public generateCSV(campaignId?: string, anonymize: boolean = true): string {
    const targetResponses = campaignId ? this.responses.filter(r => r.campaignId === campaignId) : this.responses;
    if (targetResponses.length === 0) {
      return 'No data available for export';
    }

    const campaign = campaignId ? this.campaigns.find(c => c.id === campaignId) : undefined;

    // Collect all question IDs
    const questionIds = new Set<string>();
    targetResponses.forEach(r => {
      Object.keys(r.answers || {}).forEach(k => questionIds.add(k));
    });
    const questionHeaders = Array.from(questionIds);

    // Build header row
    const headers = [
      'Participant_Code',
      'Study_ID',
      'Study_Title',
      'Academic_Level',
      'Study_Design',
      'Week_Number',
      ...(anonymize ? [] : ['Real_Name', 'Real_Email']),
      'Department_Unit',
      'Wellbeing_Score',
      'Risk_Category',
      'Risk_Alert_Flag',
      'Clinical_Followup_Done',
      'Submission_Timestamp',
      ...questionHeaders.map(q => `VAR_${q.toUpperCase()}`)
    ];

    const rows = targetResponses.map((r, index) => {
      const qValues = questionHeaders.map(q => {
        const val = r.answers[q];
        if (val === undefined || val === null) return '""';
        if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      const participantCode = `P${String(index + 1).padStart(4, '0')}`;
      const academicLevel = campaign?.researchMetadata?.academicLevel || 'flagship_study';
      const studyDesign = campaign?.researchMetadata?.studyDesign || 'longitudinal_weekly';
      const weekNumber = r.weekNumber || ((index % 4) + 1);

      return [
        `"${participantCode}"`,
        `"${r.campaignId}"`,
        `"${r.campaignTitle.replace(/"/g, '""')}"`,
        `"${academicLevel}"`,
        `"${studyDesign}"`,
        weekNumber,
        ...(anonymize ? [] : [`"${r.userName.replace(/"/g, '""')}"`, `"${r.userEmail}"`]),
        `"${(r.userDepartment || '').replace(/"/g, '""')}"`,
        r.calculatedScore,
        `"${r.riskLevel}"`,
        r.isRiskAlert ? 1 : 0,
        r.alertAcknowledged ? 1 : 0,
        `"${r.submittedAt}"`,
        ...qValues
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // SPSS (.SPS) SYNTAX GENERATOR FOR IBM SPSS STATISTICS
  public generateSPSSSyntax(campaignId?: string): string {
    const targetCamp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];
    const campTitle = targetCamp?.title || 'Estudo de Psicologia';
    const studyDesign = targetCamp?.researchMetadata?.studyDesign || 'longitudinal_weekly';

    return `* =========================================================================.
* SINTAXE IBM SPSS STATISTICS - INSTITUTO DE PSICOLOGIA.
* Projeto: ${campTitle}
* Tipo de Estudo: ${studyDesign}
* Nível Acadêmico: ${targetCamp?.researchMetadata?.academicLevel || 'Pesquisa Pós-Graduação'}
* Comitê de Ética: ${targetCamp?.researchMetadata?.ethicsApprovalCode || 'CAAE Aprovado'}
* Gerado automaticamente pela Plataforma de Pesquisas Psicológicas.
* =========================================================================.

* 1. Importação do arquivo de dados CSV exportado.
GET DATA  /TYPE=TXT
  /FILE="dados_pesquisa_${targetCamp?.id || 'coorte'}.csv"
  /ENCODING='UTF8'
  /DELIMITERS=","
  /QUALIFIER='"'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /VARIABLES=
  Participant_Code A10
  Study_ID A30
  Study_Title A80
  Academic_Level A25
  Study_Design A25
  Week_Number F2.0
  Department_Unit A60
  Wellbeing_Score F4.1
  Risk_Category A15
  Risk_Alert_Flag F1.0
  Clinical_Followup_Done F1.0
  Submission_Timestamp A30
  VAR_Q1_SLEEP A40
  VAR_Q2_STRESS_SLIDER F2.0
  VAR_Q3_OVERTIME_HOURS F3.0
  VAR_Q4_TEACHING_STAGE A40
  VAR_Q5_SYMPTOMS A150.
CACHE.
EXECUTE.

* 2. Rótulos de Variáveis (Variable Labels).
VARIABLE LABELS
  Participant_Code 'Código Pseudonimizado do Participante (Ética CEP)'
  Week_Number 'Semana da Coorte Longitudinal (Onda de Coleta)'
  Wellbeing_Score 'Índice Geral de Bem-Estar e Vitalidade Docente (0 a 100)'
  Risk_Category 'Estratificação de Risco Clínico-Psicológico'
  Risk_Alert_Flag 'Indicador Binário de Alerta Clínico (1=Sim, 0=Não)'
  VAR_Q2_STRESS_SLIDER 'Escala Visual Analógica de Estresse Ocupacional (0-10)'
  VAR_Q3_OVERTIME_HOURS 'Horas Semanais Extraclasse Dedicadas ao Trabalho'.

* 3. Rótulos de Valores (Value Labels).
VALUE LABELS Risk_Alert_Flag
  0 'Dentro do Limiar de Segurança'
  1 'Alerta Crítico de Risco Clínico'.

* 4. Estatísticas Descritivas e Normalidade (Kolmogorov-Smirnov & Shapiro-Wilk).
EXAMINE VARIABLES=Wellbeing_Score VAR_Q2_STRESS_SLIDER VAR_Q3_OVERTIME_HOURS
  /PLOT BOXPLOT STEMLEAF NPPLOT
  /STATISTICS DESCRIPTIVES
  /CINTERVAL 95
  /MISSING PAIRWISE.

* 5. Análise de Consistência Interna (Alfa de Cronbach / Confiabilidade).
RELIABILITY
  /VARIABLES=Wellbeing_Score VAR_Q2_STRESS_SLIDER
  /SCALE('Escala de Bem-Estar Docente') ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR.

* 6. Modelo Misto Linear Longitudinal (LMM - Medidas Repetidas por Semana).
MIXED Wellbeing_Score BY Risk_Category WITH VAR_Q3_OVERTIME_HOURS Week_Number
  /CRITERIA=CIN(95) MXITER(100) MXSTEP(10) SCORING(1)
  /METHOD=REML
  /PRINT=SOLUTION TESTCOV
  /RANDOM INTERCEPT | SUBJECT(Participant_Code) COVTYPE(VC)
  /REPEATED=Week_Number | SUBJECT(Participant_Code) COVTYPE(AR1).
EXECUTE.
`;
  }

  // R SCRIPT GENERATOR FOR UNIVERSITY RESEARCHERS & DATA SCIENTISTS
  public generateRScript(campaignId?: string): string {
    const targetCamp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];

    return `# =========================================================================
# SCRIPT R: ANÁLISE PSICOMÉTRICA E LONGITUDINAL (PPGP / INSTITUTO DE PSICOLOGIA)
# Estudo: ${targetCamp?.title}
# Nível: ${targetCamp?.researchMetadata?.academicLevel || 'Mestrado / Doutorado'}
# Gerado pela Plataforma de Pesquisas Psicológicas
# =========================================================================

# 1. Carregar pacotes essenciais
library(tidyverse)    # Manipulação de dados e ggplot2
library(psych)        # Psicometria, alfa de Cronbach, estatísticas descritivas
library(lme4)         # Modelos Mistos Lineares (Longitudinal LMM)
library(lmerTest)     # p-valores para modelos mistos
library(sjPlot)       # Visualização elegante de tabelas e modelos

# 2. Carregar o dataset exportado da plataforma
df <- read_csv("dados_pesquisa_${targetCamp?.id || 'coorte'}.csv")

# Visualizar estrutura
glimpse(df)

# 3. Estatísticas Descritivas Psicológicas
describe(df %>% select(Wellbeing_Score, VAR_Q2_STRESS_SLIDER, VAR_Q3_OVERTIME_HOURS))

# 4. Consistência Interna (Alfa de Cronbach & Omega de McDonald)
# alpha(df %>% select(Wellbeing_Score, VAR_Q2_STRESS_SLIDER))

# 5. Análise Longitudinal Semanal (Modelos Mistos Lineares - LMM)
# Analisando a evolução do bem-estar dos professores ao longo das semanas de coleta
modelo_longitudinal <- lmer(
  Wellbeing_Score ~ Week_Number + VAR_Q3_OVERTIME_HOURS + (1 | Participant_Code),
  data = df
)
summary(modelo_longitudinal)

# 6. Gráfico de Trajetória Longitudinal (Spaghetti Plot com Tendência Média)
ggplot(df, aes(x = Week_Number, y = Wellbeing_Score, group = Participant_Code)) +
  geom_line(alpha = 0.25, color = "steelblue") +
  stat_summary(aes(group = 1), fun = mean, geom = "line", color = "darkred", size = 1.3) +
  theme_minimal(base_size = 13) +
  labs(
    title = "Evolução Temporal do Escore de Bem-Estar Docente por Semana",
    subtitle = "${targetCamp?.title}",
    x = "Semana de Acompanhamento (Check-in Semanal)",
    y = "Índice de Bem-Estar (0 - 100)"
  )
`;
  }

  // PYTHON SCRIPT GENERATOR FOR PANDAS / STATSMODELS
  public generatePythonScript(campaignId?: string): string {
    const targetCamp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];

    return `# =========================================================================
# SCRIPT PYTHON: MODELAGEM ESTATÍSTICA PARA PESQUISA EM PSICOLOGIA
# Estudo: ${targetCamp?.title}
# =========================================================================

import pandas as pd
import numpy as np
import scipy.stats as stats
import statsmodels.api as sm
import statsmodels.formula.api as smf
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Carregar dados exportados
df = pd.read_csv('dados_pesquisa_${targetCamp?.id || 'coorte'}.csv')

# 2. Resumo descritivo da amostra
print("=== Estatísticas Descritivas ===")
print(df[['Wellbeing_Score', 'VAR_Q2_STRESS_SLIDER', 'VAR_Q3_OVERTIME_HOURS']].describe())

# 3. Teste de Normalidade (Shapiro-Wilk)
stat, p_val = stats.shapiro(df['Wellbeing_Score'].dropna())
print(f"Teste Shapiro-Wilk: W={stat:.4f}, p-valor={p_val:.4f}")

# 4. Modelo Linear Misto (Efeito Fixo: Semana e Horas Extras; Efeito Aleatório: Participante)
md = smf.mixedlm("Wellbeing_Score ~ Week_Number + VAR_Q3_OVERTIME_HOURS", df, groups=df["Participant_Code"])
mdf = md.fit()
print(mdf.summary())
`;
  }

  // DISPATCH FLAGSHIP WEEKLY CHECK-IN NOTIFICATION (TEACHERS WEEKLY DISPATCH)
  public triggerWeeklyTeacherCheckin(campaignId: string) {
    const camp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];
    const weekIdx = camp.researchMetadata?.currentWeekIndex || 4;

    return this.sendCampaignNotification(
      camp.id,
      camp.title,
      'push',
      `Check-in Semanal Docente (Semana ${weekIdx}): Como foi sua semana?`,
      `Olá, professor(a)! Sua saúde mental importa. Responda ao breve check-in da Semana ${weekIdx} sobre seus dias de aula e acesse suporte confidencial.`,
      'professores-coorte@escolas.org'
    );
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
