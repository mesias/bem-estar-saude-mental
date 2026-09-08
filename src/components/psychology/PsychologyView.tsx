import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  FileQuestion,
  PhoneCall,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Plus,
  Trash2,
  ListFilter,
  Sliders,
  Sparkles,
  HelpCircle,
  FileUp,
  Hash,
  List,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import {
  AssessmentForm,
  FormResponse,
  ClinicalIntervention,
  Campaign,
  FormQuestion,
  QuestionType,
  PersonalizedResource
} from '../../types';
import { dataService } from '../../services/dataService';

interface PsychologyViewProps {
  campaigns: Campaign[];
  forms: AssessmentForm[];
  responses: FormResponse[];
  interventions: ClinicalIntervention[];
  onDataUpdated: () => void;
  onOpenBreathingModal: () => void;
}

export const PsychologyView: React.FC<PsychologyViewProps> = ({
  campaigns,
  forms,
  responses,
  interventions,
  onDataUpdated,
  onOpenBreathingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'forms' | 'interventions'>('alerts');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);

  // Intervention form state
  const [interventionAction, setInterventionAction] = useState<'urgent_consultation' | 'direct_call' | 'resource_dispatched' | 'routine_monitoring'>('urgent_consultation');
  const [interventionNotes, setInterventionNotes] = useState('');

  // Form Builder state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCampaignId, setFormCampaignId] = useState(campaigns[0]?.id || '');
  const [formSafetyThreshold, setFormSafetyThreshold] = useState(45);
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([
    {
      id: `q_${Date.now()}_1`,
      text: 'Como você avalia seu nível de energia ao iniciar a jornada escolar?',
      type: 'options',
      required: true,
      options: ['Alto e motivado', 'Moderado', 'Baixo / Cansaço prévio', 'Esgotamento severo'],
      weight: 15,
      isRiskIndicator: true
    },
    {
      id: `q_${Date.now()}_2`,
      text: 'Nível de estresse e sobrecarga percebida (0 a 10)',
      type: 'slider',
      required: true,
      min: 0,
      max: 10,
      minLabel: '0 - Calmo',
      maxLabel: '10 - Crítico',
      weight: 25,
      isRiskIndicator: true
    }
  ]);

  // Risk Alerts: responses where score <= threshold or isRiskAlert
  const riskAlertResponses = responses.filter(r => r.isRiskAlert && !r.alertAcknowledged);
  const allAlertResponses = responses.filter(r => r.isRiskAlert);

  const handleOpenIntervention = (resp: FormResponse) => {
    setSelectedResponse(resp);
    setShowInterventionModal(true);
  };

  const handleSaveIntervention = async () => {
    if (!selectedResponse) return;

    // Create intervention log
    await dataService.createIntervention({
      responseId: selectedResponse.id,
      userId: selectedResponse.userId,
      userName: selectedResponse.userName,
      psychologistId: 'psy-01',
      psychologistName: 'Dr. Carlos Eduardo Medeiros (CRP 06/145892)',
      actionType: interventionAction,
      notes: interventionNotes || 'Intervenção psicológica direta realizada pelo profissional.',
    });

    // Acknowledge alert in responses
    await dataService.acknowledgeAlert(selectedResponse.id, 'Dr. Carlos Eduardo Medeiros');

    setShowInterventionModal(false);
    setSelectedResponse(null);
    setInterventionNotes('');
    onDataUpdated();
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: FormQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      type,
      required: true,
      options: type === 'options' || type === 'dropdowns' || type === 'checkboxes' ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined,
      min: type === 'slider' || type === 'numbers' ? 0 : undefined,
      max: type === 'slider' ? 10 : type === 'numbers' ? 100 : undefined,
      minLabel: type === 'slider' ? 'Mínimo' : undefined,
      maxLabel: type === 'slider' ? 'Máximo' : undefined,
      weight: 10,
      isRiskIndicator: false
    };
    setFormQuestions([...formQuestions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setFormQuestions(formQuestions.filter(q => q.id !== id));
  };

  const handleSaveCustomForm = async () => {
    if (!formTitle.trim()) return;

    const resources: PersonalizedResource[] = [
      {
        id: `res_crisis_${Date.now()}`,
        title: 'Plantão Psicológico e Central de Apoio 188',
        description: 'Canal prioritário com atendimento humanizado 24h para momentos de sobrecarga extrema.',
        category: 'crisis_helpline',
        minScore: 0,
        maxScore: formSafetyThreshold,
        actionText: 'Ligar 188 (Apoio Emergencial)',
        actionUrlOrPhone: 'tel:188'
      },
      {
        id: `res_breath_${Date.now()}`,
        title: 'Respiração Guiada 4-7-8 para Docentes',
        description: 'Ferramenta interativa de descompressão emocional para pausas entre aulas.',
        category: 'breathing_exercise',
        minScore: 0,
        maxScore: 65,
        actionText: 'Iniciar Respiração Guiada'
      }
    ];

    await dataService.createForm({
      campaignId: formCampaignId,
      title: formTitle,
      description: formDescription,
      psychologistId: 'psy-01',
      psychologistName: 'Dr. Carlos Eduardo Medeiros',
      safetyThreshold: formSafetyThreshold,
      personalizedResources: resources,
      questions: formQuestions
    });

    setShowFormBuilderModal(false);
    setFormTitle('');
    setFormDescription('');
    onDataUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
              Visão do Profissional da Psicologia
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dr. Carlos Eduardo Medeiros (CRP 06/145892)
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Clínico & Construtor de Formulários
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Monitore alertas de risco imediato dos docentes, registre intervenções e configure instrumentos psicométricos com 7 tipos de campos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-form-builder"
            onClick={() => setShowFormBuilderModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar Formulário Clínico
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          id="tab-alerts"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all ${
            activeTab === 'alerts'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          Alertas de Risco Ativos
          {riskAlertResponses.length > 0 && (
            <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
              {riskAlertResponses.length}
            </span>
          )}
        </button>

        <button
          id="tab-forms"
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all ${
            activeTab === 'forms'
              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-900'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
          }`}
        >
          <FileQuestion className="h-4 w-4 text-teal-600" />
          Formulários Clínicos ({forms.length})
        </button>

        <button
          id="tab-interventions"
          onClick={() => setActiveTab('interventions')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-all ${
            activeTab === 'interventions'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          Histórico de Ações Tomadas ({interventions.length})
        </button>
      </div>

      {/* 1. RISK ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {riskAlertResponses.length > 0 && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/40 animate-pulse">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Aviso Ético e Clínico: {riskAlertResponses.length} docente(s) atingiram o limiar de alerta de segurança
                  </h4>
                  <p className="mt-1 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                    O escore de bem-estar calculado ficou abaixo do limiar de segurança estipulado. A plataforma recomenda ação direta do profissional de psicologia (contato acolhedor, encaminhamento emergencial ou teleconsulta).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {allAlertResponses.map(resp => {
              const form = forms.find(f => f.id === resp.formId) || forms[0];
              const isPending = !resp.alertAcknowledged;

              return (
                <div
                  key={resp.id}
                  className={`rounded-2xl border p-5 shadow-xs transition-all ${
                    isPending
                      ? 'border-rose-400 bg-white dark:border-rose-800 dark:bg-slate-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {resp.userName}
                        </h4>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          resp.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          Risco {resp.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {resp.userDepartment} &middot; {resp.userEmail}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                        {resp.calculatedScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Limiar: &le; {form?.safetyThreshold || 45}</span>
                    </div>
                  </div>

                  {/* Highlighted Answers */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Respostas Críticas Registradas:
                    </div>
                    {Object.entries(resp.answers || {}).slice(0, 4).map(([k, val]) => (
                      <div key={k} className="flex items-baseline gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">{k}:</span>
                        <span className="truncate">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Enviado em {new Date(resp.submittedAt).toLocaleString('pt-BR')}
                    </span>

                    {isPending ? (
                      <button
                        id={`btn-action-risk-${resp.id}`}
                        onClick={() => handleOpenIntervention(resp)}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors animate-bounce"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        Tomar Ação Direta
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acolhido por {resp.acknowledgedBy || 'Psicólogo'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CLINICAL FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Formulários e Escalas Cadastradas
            </h3>
            <p className="text-xs text-slate-500">
              Total de {forms.length} formulário(s) ativos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {forms.map(form => (
              <div
                key={form.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {form.title}
                  </h4>
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:border-teal-900 dark:text-teal-300">
                    Limiar Alerta: &le; {form.safetyThreshold} pts
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {form.description}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <List className="h-3.5 w-3.5 text-teal-600" />
                    Estrutura ({form.questions.length} perguntas com diversidade de inputs):
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(form.questions.map(q => q.type))).map(type => (
                      <span key={type} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500">
                    Recursos de Apoio Imediato: <span className="font-semibold text-teal-600">{form.personalizedResources?.length || 0} configurados</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLINICAL INTERVENTIONS LOG */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prontuário de Intervenções e Acolhimentos Psicológicos
            </h3>
            <span className="text-xs text-slate-500">
              Registros protegidos sob sigilo ético (Resolução CFP)
            </span>
          </div>

          <div className="space-y-3">
            {interventions.map(int => (
              <div
                key={int.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-teal-50 p-1.5 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Docente: {int.userName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Atendido por {int.psychologistName}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase tracking-wide">
                    {int.actionType.replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{int.notes}&rdquo;
                </p>

                <div className="mt-2 text-right text-[10px] text-slate-400">
                  Registrado em {new Date(int.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIRECT ACTION / INTERVENTION MODAL */}
      {showInterventionModal && selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-2">
              <PhoneCall className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ação Direta do Profissional de Psicologia
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Paciente: <strong className="text-slate-900 dark:text-white">{selectedResponse.userName}</strong> &middot; Escore de Bem-Estar: <span className="font-bold text-rose-600">{selectedResponse.calculatedScore}/100</span>
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Conduta Clínica
                </label>
                <select
                  id="select-intervention-action"
                  value={interventionAction}
                  onChange={e => setInterventionAction(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="urgent_consultation">Agendamento de Teleconsulta Imediata</option>
                  <option value="direct_call">Contato Telefônico Acolhedor Direto</option>
                  <option value="resource_dispatched">Envio Prioritário de Recursos de Crise (CVV / Plantão)</option>
                  <option value="routine_monitoring">Monitoramento Preventivo e Reavaliação</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parecer Técnico e Prontuário de Acolhimento
                </label>
                <textarea
                  id="textarea-intervention-notes"
                  rows={4}
                  placeholder="Ex: Realizado contato humanizado. O docente expressou alta exaustão com turmas numerosas. Combinada primeira escuta clínica online para amanhã às 14h..."
                  value={interventionNotes}
                  onChange={e => setInterventionNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                id="btn-cancel-intervention"
                onClick={() => setShowInterventionModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-intervention"
                onClick={handleSaveIntervention}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Registrar Intervenção & Reconhecer Alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM BUILDER MODAL */}
      {showFormBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Construtor de Formulários Psicológicos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure questionários customizados com os 7 tipos de dados requeridos (opções, números, dropdowns, slider, texto aberto, arquivo e checkboxes).
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vincular à Campanha
                  </label>
                  <select
                    id="select-form-campaign"
                    value={formCampaignId}
                    onChange={e => setFormCampaignId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Limiar de Segurança de Alerta (&le; pontos)
                  </label>
                  <input
                    id="input-form-safety-threshold"
                    type="number"
                    min={10}
                    max={80}
                    value={formSafetyThreshold}
                    onChange={e => setFormSafetyThreshold(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Formulário / Escala *
                </label>
                <input
                  id="input-form-title"
                  type="text"
                  placeholder="Ex: Escala de Sobrecarga e Esgotamento Docente"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instruções Clínicas ao Docente
                </label>
                <textarea
                  id="textarea-form-desc"
                  rows={2}
                  placeholder="Ex: Este instrumento é confidencial e tem como objetivo mapear fontes de estresse pedagógico..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Add Question Toolbar */}
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  + Adicionar Pergunta por Tipo:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('options')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <List className="h-3 w-3 text-blue-500" /> Múltipla Escolha
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('slider')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Sliders className="h-3 w-3 text-teal-500" /> Slider (0-10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('numbers')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Hash className="h-3 w-3 text-purple-500" /> Numérico
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('dropdowns')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <ListFilter className="h-3 w-3 text-amber-500" /> Dropdown
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('checkboxes')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <CheckSquare className="h-3 w-3 text-emerald-500" /> Checkboxes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('text')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <MessageSquare className="h-3 w-3 text-sky-500" /> Texto Aberto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('file')}
                    className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    <FileUp className="h-3 w-3 text-rose-500" /> Envio de Arquivo
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {formQuestions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        #{idx + 1} &middot; Tipo: <span className="font-mono text-teal-600 dark:text-teal-400">{q.type}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enunciado da pergunta clínica..."
                      value={q.text}
                      onChange={e => {
                        const updated = [...formQuestions];
                        updated[idx].text = e.target.value;
                        setFormQuestions(updated);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />

                    {/* Type specific options */}
                    {(q.type === 'options' || q.type === 'dropdowns' || q.type === 'checkboxes') && (
                      <div className="mt-2 text-xs text-slate-500">
                        Opções (separadas por vírgula):
                        <input
                          type="text"
                          value={q.options?.join(', ') || ''}
                          onChange={e => {
                            const updated = [...formQuestions];
                            updated[idx].options = e.target.value.split(',').map(s => s.trim());
                            setFormQuestions(updated);
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                id="btn-cancel-form"
                onClick={() => setShowFormBuilderModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-save-form"
                onClick={handleSaveCustomForm}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                Salvar Formulário Clínico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
