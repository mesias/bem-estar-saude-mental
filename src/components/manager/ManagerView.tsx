import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Download,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { Campaign, NotificationMode, ReminderFrequency, FormResponse } from '../../types';
import { dataService } from '../../services/dataService';

interface ManagerViewProps {
  campaigns: Campaign[];
  responses: FormResponse[];
  onCampaignCreated: () => void;
  onSelectCampaignForForms?: (campaignId: string) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  campaigns,
  responses,
  onCampaignCreated,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Form State for new campaign
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');
  const [newNotificationMode, setNewNotificationMode] = useState<NotificationMode>('strict_deadlines');
  const [newDeadlineDate, setNewDeadlineDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newReminderFrequency, setNewReminderFrequency] = useState<ReminderFrequency>('every_3_days');
  const [newParticipantCount, setNewParticipantCount] = useState(50);

  // Filter responses
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];
  const campaignResponses = responses.filter(r => r.campaignId === (activeCampaign?.id || ''));

  // Metrics computation
  const totalEnrolled = campaigns.reduce((acc, c) => acc + (c.participantCount || 0), 0);
  const totalResponses = responses.length;
  const overallRate = totalEnrolled > 0 ? Math.round((totalResponses / totalEnrolled) * 100) : 0;
  const avgWellbeing = campaignResponses.length > 0
    ? Math.round(campaignResponses.reduce((acc, r) => acc + r.calculatedScore, 0) / campaignResponses.length)
    : 0;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await dataService.createCampaign({
      title: newTitle,
      description: newDescription,
      targetAudience: newTargetAudience || 'Professores e Equipe Escolar',
      status: 'active',
      notificationMode: newNotificationMode,
      deadlineDate: newNotificationMode === 'strict_deadlines' ? newDeadlineDate : undefined,
      reminderFrequency: newReminderFrequency,
      createdByManagerId: 'mgr-01',
      createdByName: 'Mariana Rocha (Gestão de RH)',
      assignedPsychologistIds: ['psy-01'],
      participantCount: Number(newParticipantCount) || 30,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    onCampaignCreated();
  };

  const handleExportCSV = () => {
    const csvContent = dataService.generateCSV(activeCampaign?.id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pesquisa_saude_mental_${activeCampaign?.id || 'todas'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3000);
  };

  const handleTriggerAutomatedReminder = () => {
    if (!activeCampaign) return;
    const count = (activeCampaign.participantCount || 40) - campaignResponses.length;
    dataService.sendCampaignNotification(
      activeCampaign.id,
      activeCampaign.title,
      'push',
      `Lembrete de Prazo: ${activeCampaign.title}`,
      `Faltam poucos dias para o encerramento do questionário confidencial de saúde mental. Preencha agora para garantir seu suporte.`,
      `professores-pendentes@escolas.org`
    );

    setDispatchSuccess(`Lembrete automatizado e push enviados com sucesso para os ${Math.max(0, count)} participantes pendentes.`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              Visão do Gestor de Campanhas
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Gestão de Engajamento, Prazos & Análise Estatística
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Geral de Campanhas de Saúde Mental
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Configure campanhas com prazos rígidos ou discricionários, monitore a adesão docente e exporte dados para SPSS e R.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {csvDownloaded ? <Check className="h-4 w-4 text-emerald-500" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
            {csvDownloaded ? 'CSV Baixado!' : 'Exportar CSV (SPSS / R / Python)'}
          </button>

          <button
            id="btn-new-campaign"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Dispatch notification feedback */}
      {dispatchSuccess && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{dispatchSuccess}</span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Campanhas</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{campaigns.length}</span>
            <span className="text-xs text-slate-500">ativas no sistema</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Docentes Participantes</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalEnrolled}</span>
            <span className="text-xs text-slate-500">cadastrados</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Taxa de Resposta</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{overallRate}%</span>
            <span className="text-xs text-slate-500">({totalResponses} preenchidos)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Escore Médio de Bem-Estar</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">{avgWellbeing}/100</span>
            <span className="text-xs text-slate-500">coorte atual</span>
          </div>
        </div>
      </div>

      {/* Main Campaign Selector & Cohort Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Campaign Cards List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Campanhas Ativas</span>
            <span className="text-xs text-slate-500">{campaigns.length} total</span>
          </h3>

          <div className="space-y-3">
            {campaigns.map(camp => {
              const isSelected = camp.id === (activeCampaign?.id || '');
              const responseCount = responses.filter(r => r.campaignId === camp.id).length;
              const rate = camp.participantCount > 0 ? Math.round((responseCount / camp.participantCount) * 100) : 0;

              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm dark:border-blue-500 dark:bg-blue-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {camp.title}
                    </h4>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        camp.notificationMode === 'strict_deadlines'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {camp.notificationMode === 'strict_deadlines' ? 'Prazo Rígido' : 'Discricionário'}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {camp.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {responseCount} / {camp.participantCount} respostas
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {rate}% concluído
                    </span>
                  </div>

                  {/* Mini Progress bar */}
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>

                  {camp.notificationMode === 'strict_deadlines' && camp.deadlineDate && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400">
                      <Clock className="h-3 w-3" />
                      Prazo: {camp.deadlineDate} (Lembretes automáticos: {camp.reminderFrequency === 'every_3_days' ? 'a cada 3 dias' : 'semanal'})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Detail & Statistical Cohort Analytics */}
        <div className="space-y-4 lg:col-span-2">
          {activeCampaign ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800 gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Campanha em Monitoramento Ativo
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeCampaign.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Público-alvo: {activeCampaign.targetAudience} &middot; Criado por {activeCampaign.createdByName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-dispatch-reminder"
                    onClick={handleTriggerAutomatedReminder}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                    title="Disparar push e e-mails de lembrete para docentes não respondentes"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Cobrar Pendentes (Push/Email)
                  </button>
                </div>
              </div>

              {/* Notification & Deadline Policy Box */}
              <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Política de Prazos e Notificações (Diferencial vs. Google Forms)
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {activeCampaign.notificationMode === 'strict_deadlines'
                      ? 'Prazo Rígido com Lembretes Automatizados'
                      : 'Modo Discricionário (Gestão Livre)'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeCampaign.notificationMode === 'strict_deadlines'
                    ? `Diferente do Google Forms tradicional, esta campanha automatiza lembretes push e e-mails aos participantes que ainda não concluíram o preenchimento, evitando lacunas na pesquisa. Prazo final registrado: ${activeCampaign.deadlineDate}.`
                    : 'Notificação única de lançamento enviada aos docentes, permitindo preenchimento no ritmo e discernimento de cada participante.'}
                </p>
              </div>

              {/* Responses & Real-Time Cohort Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Registros Coletados em Tempo Real ({campaignResponses.length})
                  </h4>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por nome ou escola..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Docente / Participante</th>
                        <th className="px-4 py-3">Escola / Unidade</th>
                        <th className="px-4 py-3">Escore Bem-Estar</th>
                        <th className="px-4 py-3">Nível de Risco</th>
                        <th className="px-4 py-3">Alerta Clínico</th>
                        <th className="px-4 py-3">Data Envio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {campaignResponses
                        .filter(r =>
                          r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.userDepartment || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(resp => (
                          <tr key={resp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {resp.userName}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {resp.userDepartment || 'Não informado'}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              <span className={`inline-block rounded-md px-2 py-0.5 text-xs ${
                                resp.calculatedScore < 45
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  : resp.calculatedScore < 70
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}>
                                {resp.calculatedScore} / 100
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="capitalize font-medium">{resp.riskLevel}</span>
                            </td>
                            <td className="px-4 py-3">
                              {resp.isRiskAlert ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                  {resp.alertAcknowledged ? 'Atendido pela Psicologia' : '⚠️ Alerta Ativo'}
                                </span>
                              ) : (
                                <span className="text-slate-400">Normal</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {new Date(resp.submittedAt).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400">
              Selecione uma campanha para visualizar os detalhes
            </div>
          )}
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Criar Nova Campanha de Acolhimento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Defina as diretrizes, público-alvo e política de prazos da campanha.
            </p>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Campanha *
                </label>
                <input
                  id="input-campaign-title"
                  type="text"
                  required
                  placeholder="Ex: Cuidado da Saúde Mental do Professor 2026"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição e Objetivos Institucionais
                </label>
                <textarea
                  id="textarea-campaign-desc"
                  rows={2}
                  placeholder="Ex: Mapeamento de sobrecarga e encaminhamento para plantão psicológico prioritário..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Público-Alvo
                  </label>
                  <input
                    id="input-campaign-target"
                    type="text"
                    placeholder="Ex: Professores do Ensino Médio"
                    value={newTargetAudience}
                    onChange={e => setNewTargetAudience(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimativa de Participantes
                  </label>
                  <input
                    id="input-campaign-participants"
                    type="number"
                    min={1}
                    value={newParticipantCount}
                    onChange={e => setNewParticipantCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Notification & Deadline Mode Selector */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Modelo de Notificações e Prazos (Conforme solicitado)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewNotificationMode('strict_deadlines')}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                      newNotificationMode === 'strict_deadlines'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Prazo Rígido & Follow-ups
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Exige data limite e dispara lembretes automáticos para não respondentes para evitar registros incompletos.
                    </p>
                  </div>

                  <div
                    onClick={() => setNewNotificationMode('flexible_discretionary')}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                      newNotificationMode === 'flexible_discretionary'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      Acesso Livre / Discricionário
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Notifica apenas sobre o novo formulário disponível, deixando a gestão de preenchimento ao critério do usuário.
                    </p>
                  </div>
                </div>

                {newNotificationMode === 'strict_deadlines' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Data Limite (Deadline)
                      </label>
                      <input
                        id="input-campaign-deadline"
                        type="date"
                        value={newDeadlineDate}
                        onChange={e => setNewDeadlineDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Frequência de Lembretes Automáticos
                      </label>
                      <select
                        id="select-campaign-reminder"
                        value={newReminderFrequency}
                        onChange={e => setNewReminderFrequency(e.target.value as ReminderFrequency)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="every_3_days">A cada 3 dias (Recomendado)</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="daily">Diário (Reta final)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-campaign"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-campaign"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
