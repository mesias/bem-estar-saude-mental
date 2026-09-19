import React, { useState } from 'react';
import {
  Heart,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Sparkles,
  Phone,
  Wind,
  FileUp,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowLeft,
  X,
  FileCheck
} from 'lucide-react';
import {
  Campaign,
  AssessmentForm,
  FormResponse,
  PersonalizedResource,
  FormQuestion
} from '../../types';
import { dataService } from '../../services/dataService';

interface UserViewProps {
  campaigns: Campaign[];
  forms: AssessmentForm[];
  responses: FormResponse[];
  onResponseSubmitted: () => void;
  onOpenBreathingModal: () => void;
  isMobileLayout?: boolean;
}

export const UserView: React.FC<UserViewProps> = ({
  campaigns,
  forms,
  responses,
  onResponseSubmitted,
  onOpenBreathingModal,
  isMobileLayout = false,
}) => {
  const [selectedForm, setSelectedForm] = useState<AssessmentForm | null>(forms[0] || null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [justSubmittedResponse, setJustSubmittedResponse] = useState<FormResponse | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // User Profile
  const currentUser = {
    uid: 'usr-01',
    name: 'Profª. Ana Beatriz Silveira',
    email: 'ana.silveira@educacao.gov.br',
    department: 'Colégio Estadual Dom Pedro II - Língua Portuguesa',
  };

  // User's historical responses
  const userHistory = responses.filter(r => r.userId === currentUser.uid);

  const activeCampaign = campaigns.find(c => c.id === selectedForm?.campaignId) || campaigns[0];

  const handleStartForm = (form: AssessmentForm) => {
    setSelectedForm(form);
    setAnswers({});
    setUploadedFileName(null);
    setJustSubmittedResponse(null);
    setIsAnswering(true);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    if (current.includes(option)) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: current.filter(item => item !== option),
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: [...current, option],
      }));
    }
  };

  const handleFakeFileUpload = (e: React.ChangeEvent<HTMLInputElement>, qId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      handleAnswerChange(qId, file.name);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    const newResponse = await dataService.submitResponse({
      campaignId: selectedForm.campaignId,
      campaignTitle: activeCampaign?.title || 'Saúde Mental do Professor',
      formId: selectedForm.id,
      formTitle: selectedForm.title,
      userId: currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userDepartment: currentUser.department,
      weekNumber: activeCampaign?.researchMetadata?.currentWeekIndex || 4,
      answers,
    });

    setJustSubmittedResponse(newResponse);
    setIsAnswering(false);
    onResponseSubmitted();
  };

  return (
    <div className={`space-y-6 ${isMobileLayout ? 'max-w-md mx-auto px-2' : ''}`}>
      {/* 1. Header Greeting & Status */}
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50/50 p-5 dark:border-teal-900/50 dark:from-teal-950/40 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
                Espaço Docente
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Acolhimento Confidencial
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Olá, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {currentUser.department}
            </p>
          </div>

          {/* Deadline or Notification pill */}
          {activeCampaign && (
            <div className="rounded-xl border border-teal-200 bg-white/80 p-3 dark:border-teal-800 dark:bg-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
                <Clock className="h-4 w-4 text-teal-600" />
                {activeCampaign.notificationMode === 'strict_deadlines' ? 'Prazo da Campanha' : 'Disponibilidade'}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                {activeCampaign.notificationMode === 'strict_deadlines'
                  ? `Preencher até ${activeCampaign.deadlineDate || 'em breve'}`
                  : 'Acesso contínuo sem prazo rígido'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Flagship Weekly Teacher Check-in Journey */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Estudo Insígnia: Check-in Semanal do Professor
              </h3>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                Você recebe uma notificação todo <strong>domingo às 19:00</strong> para registrar como foi sua semana de trabalho.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 w-fit">
            Semana 4 de 12
          </span>
        </div>

        {/* Weekly Timeline Steps */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-2 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Semana 1</span>
            <span className="font-bold text-[11px]">78 / 100</span>
            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400">Concluída</span>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-2 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Semana 2</span>
            <span className="font-bold text-[11px]">72 / 100</span>
            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400">Concluída</span>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-2 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Semana 3</span>
            <span className="font-bold text-[11px]">65 / 100</span>
            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400">Concluída</span>
          </div>

          <div className="rounded-xl border-2 border-amber-500 bg-white p-2 text-amber-900 dark:bg-slate-800 dark:text-amber-200 shadow-sm ring-2 ring-amber-400/30">
            <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400">Semana 4</span>
            <span className="font-extrabold text-[11px] text-amber-600">Aberta</span>
            <span className="block text-[9px] text-amber-700 font-semibold animate-pulse">Responder Hoje</span>
          </div>
        </div>
      </div>

      {/* 2. SUBMITTED RESULT VIEW (SCORE & IMMEDIATE SUPPORT) */}
      {justSubmittedResponse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 animate-fadeIn space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Avaliação Enviada com Sucesso!
              </h3>
            </div>
            <button
              onClick={() => setJustSubmittedResponse(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Fechar Resultado
            </button>
          </div>

          {/* Score Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-slate-50 p-6 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Seu Índice de Bem-Estar e Vitalidade Docente
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${
                  justSubmittedResponse.calculatedScore < 45
                    ? 'text-rose-600'
                    : justSubmittedResponse.calculatedScore < 70
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}>
                  {justSubmittedResponse.calculatedScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100 pontos</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Classificação: <strong className="capitalize">{justSubmittedResponse.riskLevel}</strong>.
                {justSubmittedResponse.isRiskAlert && (
                  <span className="block text-rose-600 font-semibold mt-1">
                    ⚠️ Atenção: Seus indicadores apontam sobrecarga severa. A equipe clínica de psicologia foi notificada para suporte prioritário.
                  </span>
                )}
              </p>
            </div>

            {/* Visual Gauge Pill */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    justSubmittedResponse.calculatedScore < 45
                      ? 'bg-rose-500'
                      : justSubmittedResponse.calculatedScore < 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${justSubmittedResponse.calculatedScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Personalized Immediate Support Cards */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Recursos Personalizados de Apoio Imediato:
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Crisis Hotline */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <Phone className="h-4 w-4" />
                  Linha de Acolhimento 188 (CVV)
                </div>
                <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-200/90 leading-relaxed">
                  Apoio emocional confidencial e gratuito 24h. Você não precisa passar por isso sozinho(a).
                </p>
                <a
                  href="tel:188"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Ligar 188 Imediatamente
                </a>
              </div>

              {/* Guided Breathing */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-900/60 dark:bg-teal-950/30">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
                  <Wind className="h-4 w-4" />
                  Exercício de Respiração 4-7-8
                </div>
                <p className="mt-1 text-xs text-teal-800/90 dark:text-teal-200/90 leading-relaxed">
                  Regule batimentos cardíacos e alivie a tensão muscular com este exercício guiado de 2 minutos.
                </p>
                <button
                  onClick={onOpenBreathingModal}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                >
                  <Wind className="h-3.5 w-3.5" />
                  Praticar Respiração 4-7-8
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE FORM QUESTIONNAIRE (Multi-Field Interactive Form) */}
      {isAnswering && selectedForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 animate-fadeIn space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <button
                onClick={() => setIsAnswering(false)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedForm.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Elaborado por: {selectedForm.psychologistName} &middot; Sigilo profissional garantido
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            {selectedForm.questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                    <span className="text-teal-600 font-mono mr-1">#{idx + 1}.</span> {q.text}
                    {q.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                </div>

                {q.helpText && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {q.helpText}
                  </p>
                )}

                {/* 1. OPTIONS / RADIO */}
                {q.type === 'options' && q.options && (
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs transition-colors ${
                          answers[q.id] === opt
                            ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          required={q.required}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* 2. SLIDER */}
                {q.type === 'slider' && (
                  <div className="space-y-2 px-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>{q.minLabel || `${q.min || 0}`}</span>
                      <span className="rounded-lg bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        Valor: {answers[q.id] !== undefined ? answers[q.id] : 5}
                      </span>
                      <span>{q.maxLabel || `${q.max || 10}`}</span>
                    </div>
                    <input
                      type="range"
                      min={q.min || 0}
                      max={q.max || 10}
                      step={q.step || 1}
                      value={answers[q.id] !== undefined ? answers[q.id] : 5}
                      onChange={e => handleAnswerChange(q.id, Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                )}

                {/* 3. NUMBERS */}
                {q.type === 'numbers' && (
                  <div>
                    <input
                      type="number"
                      min={q.min || 0}
                      max={q.max || 100}
                      required={q.required}
                      placeholder="Digite um número inteiro"
                      value={answers[q.id] !== undefined ? answers[q.id] : ''}
                      onChange={e => handleAnswerChange(q.id, Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* 4. DROPDOWNS */}
                {q.type === 'dropdowns' && q.options && (
                  <div>
                    <select
                      required={q.required}
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      {q.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 5. CHECKBOXES */}
                {q.type === 'checkboxes' && q.options && (
                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const isChecked = ((answers[q.id] as string[]) || []).includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs transition-colors ${
                            isChecked
                              ? 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(q.id, opt)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 6. OPEN TEXT */}
                {q.type === 'text' && (
                  <div>
                    <textarea
                      rows={3}
                      placeholder="Escreva livremente suas observações aqui..."
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* 7. FILE UPLOAD */}
                {q.type === 'file' && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center dark:border-slate-700 bg-white dark:bg-slate-800">
                    <input
                      type="file"
                      id={`file-${q.id}`}
                      className="hidden"
                      onChange={e => handleFakeFileUpload(e, q.id)}
                    />
                    <label
                      htmlFor={`file-${q.id}`}
                      className="flex cursor-pointer flex-col items-center justify-center gap-1"
                    >
                      <FileUp className="h-6 w-6 text-teal-600" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {uploadedFileName || 'Clique ou arraste um arquivo para anexar'}
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG (máx. 5MB)</span>
                    </label>
                    {uploadedFileName && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                        <FileCheck className="h-3.5 w-3.5" /> {uploadedFileName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAnswering(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-submit-assessment"
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Concluir e Calcular Meu Escore
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. AVAILABLE FORMS & QUESTIONNAIRES LIST */}
      {!isAnswering && !justSubmittedResponse && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="h-4 w-4 text-teal-600" />
              Questionários Disponíveis para Você
            </h3>
            <span className="text-xs text-slate-500">
              {forms.length} formulário(s)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {forms.map(form => {
              const camp = campaigns.find(c => c.id === form.campaignId);
              return (
                <div
                  key={form.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-teal-300 dark:hover:border-teal-700"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {camp?.title || 'Campanha Docente'}
                      </span>
                      {camp?.notificationMode === 'strict_deadlines' && (
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Prazo: {camp.deadlineDate}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {form.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {form.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">
                      {form.questions.length} perguntas &middot; ~4 min
                    </span>

                    <button
                      id={`btn-start-form-${form.id}`}
                      onClick={() => handleStartForm(form)}
                      className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                    >
                      Preencher Agora <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. HISTORICAL RESPONSES & EVOLUTION OVER TIME */}
          {userHistory.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Sua Evolução ao Longo do Tempo (Histórico Pessoal)
                </h4>
                <span className="text-xs text-slate-500">
                  {userHistory.length} avaliação(ões) registradas
                </span>
              </div>

              <div className="space-y-2">
                {userHistory.map(hist => (
                  <div
                    key={hist.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {hist.formTitle}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Enviado em {new Date(hist.submittedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          hist.calculatedScore < 45
                            ? 'text-rose-600'
                            : hist.calculatedScore < 70
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                          {hist.calculatedScore} / 100
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">{hist.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
