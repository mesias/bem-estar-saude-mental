import React, { useState } from 'react';
import {
  GraduationCap,
  FileSpreadsheet,
  Terminal,
  Code,
  Copy,
  Check,
  Download,
  X,
  Sparkles,
  BookOpen,
  Send,
  Users,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { Campaign, FormResponse } from '../../types';
import { dataService } from '../../services/dataService';

interface StatisticalLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  responses: FormResponse[];
  onWeeklyDispatched: () => void;
}

export const StatisticalLabModal: React.FC<StatisticalLabModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  responses,
  onWeeklyDispatched,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns.find(c => c.isFlagship)?.id || campaigns[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'spss' | 'r_script' | 'python' | 'methodology'>('spss');
  const [anonymize, setAnonymize] = useState(true);
  const [copied, setCopied] = useState(false);
  const [weeklyDispatchedNotice, setWeeklyDispatchedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];
  const campaignResponses = responses.filter(r => r.campaignId === currentCampaign?.id);

  // Metrics
  const sampleN = campaignResponses.length;
  const targetN = currentCampaign?.researchMetadata?.sampleTargetSize || currentCampaign?.participantCount || 50;
  const adherenceRate = targetN > 0 ? Math.round((sampleN / targetN) * 100) : 0;

  // Code generation
  const spssCode = dataService.generateSPSSSyntax(currentCampaign?.id);
  const rScript = dataService.generateRScript(currentCampaign?.id);
  const pythonScript = dataService.generatePythonScript(currentCampaign?.id);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'spss': return spssCode;
      case 'r_script': return rScript;
      case 'python': return pythonScript;
      default: return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    const code = getActiveCode();
    const ext = activeTab === 'spss' ? 'sps' : activeTab === 'r_script' ? 'R' : 'py';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analise_${activeTab}_${currentCampaign?.id}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    const csvContent = dataService.generateCSV(currentCampaign?.id, anonymize);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dataset_pesquisa_${anonymize ? 'anonimizado' : 'completo'}_${currentCampaign?.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerWeeklyDispatch = () => {
    if (!currentCampaign) return;
    dataService.triggerWeeklyTeacherCheckin(currentCampaign.id);
    setWeeklyDispatchedNotice(
      `Disparo semanal efetuado com sucesso! Notificação push enviada para a coorte de professores sobre sua semana letiva.`
    );
    onWeeklyDispatched();
    setTimeout(() => setWeeklyDispatchedNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Laboratório de Estatística & Pós-Graduação (Mestrado / Doutorado)
                </h3>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Pesquisa Universitária
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geração de scripts estatísticos para SPSS, R e Python &bull; Coortes longitudinais e validação psicométrica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Campaign / Study Selector Pills */}
        <div className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Estudo Selecionado:
            </span>
            {campaigns.map(camp => (
              <button
                key={camp.id}
                onClick={() => setSelectedCampaignId(camp.id)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  selectedCampaignId === camp.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {camp.isFlagship && '★ '}
                {camp.title.length > 32 ? `${camp.title.substring(0, 32)}...` : camp.title}
              </button>
            ))}
          </div>

          {/* Anonymization ethical toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymize}
              onChange={e => setAnonymize(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Anonimizar Participantes (P0001... / Ética CEP)</span>
          </label>
        </div>

        {/* Weekly Notification Dispatch Bar for Teachers Flagship */}
        {currentCampaign?.researchMetadata?.studyDesign === 'longitudinal_weekly' && (
          <div className="bg-amber-50/90 px-6 py-2.5 border-b border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Coorte Semanal Docente Ativa:</strong> Disparo programado todo <strong>domingo às 19:00</strong> para os professores relatarem sua semana de aula.
              </span>
            </div>
            <button
              onClick={handleTriggerWeeklyDispatch}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1 font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              Testar Disparo Semanal Agora
            </button>
          </div>
        )}

        {weeklyDispatchedNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="h-4 w-4" />
            <span>{weeklyDispatchedNotice}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Study Overview Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amostra (N)</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{sampleN}</span>
                <span className="text-xs text-slate-500">/ {targetN} meta</span>
              </div>
              <span className="text-[10px] text-purple-600 font-semibold">{adherenceRate}% atingido</span>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nível Acadêmico</span>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white capitalize">
                {currentCampaign?.researchMetadata?.academicLevel === 'flagship_study'
                  ? 'Estudo Insígnia (Flagship)'
                  : currentCampaign?.researchMetadata?.academicLevel === 'mestrado'
                  ? 'Dissertação de Mestrado'
                  : 'Tese de Doutorado'}
              </div>
              <span className="text-[10px] text-slate-500">
                {currentCampaign?.researchMetadata?.graduateProgram || 'PPGP'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Desenho Metodológico</span>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {currentCampaign?.researchMetadata?.studyDesign === 'longitudinal_weekly'
                  ? 'Longitudinal Semanal'
                  : currentCampaign?.researchMetadata?.studyDesign === 'experimental_rct'
                  ? 'Ensaio Clínico RCT'
                  : 'Estudo Transversal'}
              </div>
              <span className="text-[10px] text-slate-500">
                {currentCampaign?.researchMetadata?.longitudinalTotalWeeks
                  ? `${currentCampaign.researchMetadata.longitudinalTotalWeeks} semanas previstas`
                  : 'Onda única transversal'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Comitê de Ética</span>
              <div className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {currentCampaign?.researchMetadata?.ethicsApprovalCode || 'CAAE: 54910222.4.0000.5404'}
              </div>
              <span className="text-[10px] text-slate-500">Parecer Consubstanciado Aprovado</span>
            </div>
          </div>

          {/* Export Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
            <div className="text-xs text-purple-900 dark:text-purple-200">
              <strong>Dataset Pronto para Análise:</strong> O arquivo CSV contém variáveis codificadas com rótulos internacionais para estatística descritiva, modelagem mista (LMM) e análise psicométrica.
            </div>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Baixar Dataset CSV ({anonymize ? 'Anonimizado' : 'Completo'})
            </button>
          </div>

          {/* Code Viewer Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('spss')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'spss'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Sintaxe IBM SPSS (.SPS)
                </button>
                <button
                  onClick={() => setActiveTab('r_script')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'r_script'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Script R / RMarkdown (.R)
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'python'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Script Python (Pandas/Statsmodels)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </div>

            {/* Code Output Box */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 shadow-inner max-h-72 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{getActiveCode()}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500">
          <span>
            Responsável: <strong>{currentCampaign?.researchMetadata?.leadResearcher || 'Pesquisador Responsável'}</strong> &middot; Orientador: <strong>{currentCampaign?.researchMetadata?.academicAdvisor || 'Prof. Orientador'}</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Fechar Laboratório
          </button>
        </div>
      </div>
    </div>
  );
};
