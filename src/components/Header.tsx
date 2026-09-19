import React from 'react';
import {
  HeartHandshake,
  UserCheck,
  Stethoscope,
  Briefcase,
  Smartphone,
  Monitor,
  Database,
  Github,
  AlertTriangle,
  Wind,
  GraduationCap,
  Sparkles,
  LogOut,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  unacknowledgedAlertsCount: number;
  onOpenFirebaseModal: () => void;
  onOpenExpoModal: () => void;
  onOpenBreathingModal: () => void;
  onOpenResearchModal: () => void;
  onAlertBadgeClick: () => void;
  isolatedUserMode?: boolean;
  onExitIsolatedMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isMobilePreview,
  onToggleMobilePreview,
  unacknowledgedAlertsCount,
  onOpenFirebaseModal,
  onOpenExpoModal,
  onOpenBreathingModal,
  onOpenResearchModal,
  onAlertBadgeClick,
  isolatedUserMode = false,
  onExitIsolatedMode,
}) => {
  // If isolated user mode is active, show only clean participant interface (no manager/psychology tabs)
  if (isolatedUserMode) {
    return (
      <header className="sticky top-0 z-40 border-b border-teal-100 bg-white/95 backdrop-blur-md dark:border-teal-900/40 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  Bem-Estar Docente
                </h1>
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Portal do Participante
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avaliação de Saúde Mental & Apoio Psicológico Docente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="user-header-breathing"
              onClick={onOpenBreathingModal}
              className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300 transition-colors"
              title="Exercício de Respiração Guiada 4-7-8"
            >
              <Wind className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Respiração 4-7-8</span>
            </button>

            {onExitIsolatedMode && (
              <button
                id="btn-access-management"
                onClick={onExitIsolatedMode}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all shadow-xs"
                title="Alternar para o Painel de Gestão e Pesquisa"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Painel Gestão</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                PsychoResearch Hub
              </h1>
              <span className="hidden rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 sm:inline-block border border-teal-200 dark:border-teal-800">
                Flagship: Bem-Estar Docente
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pesquisas em Psicologia &middot; Mestrado e Doutorado &middot; Análise Estatística (SPSS / R)
            </p>
          </div>
        </div>

        {/* Center: Persona Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            id="role-btn-manager"
            onClick={() => onRoleChange('manager')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'manager'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span className="hidden md:inline">1. Gestor</span>
            <span className="md:hidden">Gestor</span>
          </button>

          <button
            id="role-btn-psychologist"
            onClick={() => onRoleChange('psychologist')}
            className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'psychologist'
                ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span className="hidden md:inline">2. Psicologia</span>
            <span className="md:hidden">Psicólogo</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white animate-pulse">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>

          <button
            id="role-btn-user"
            onClick={() => onRoleChange('user')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'user'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden md:inline">3. Professor (Usuário)</span>
            <span className="md:hidden">Docente</span>
          </button>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Button to go back to User/Participant App */}
          <button
            id="btn-switch-to-user-app"
            onClick={() => onRoleChange('user')}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors shadow-xs"
            title="Ir para o aplicativo do participante (preenchimento dos questionários)"
          >
            <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Ver App do Docente</span>
            <span className="sm:hidden">App Docente</span>
          </button>

          {/* Risk Alert Warning Pill */}
          {unacknowledgedAlertsCount > 0 && (
            <button
              id="header-alert-warning-pill"
              onClick={onAlertBadgeClick}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 transition-colors"
              title="Avisos de Risco Clínico Ativos"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
              <span className="hidden lg:inline">{unacknowledgedAlertsCount} Alerta(s) de Risco</span>
              <span className="lg:hidden">{unacknowledgedAlertsCount}</span>
            </button>
          )}

          {/* Statistical Lab Modal Button */}
          <button
            id="btn-statistical-lab"
            onClick={onOpenResearchModal}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
            title="Laboratório de Estatística & Pós-Graduação (SPSS, R, Python)"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Lab Estatística</span>
          </button>

          {/* Quick Breathing Exercise */}
          <button
            id="header-btn-breathing"
            onClick={onOpenBreathingModal}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Apoio Imediato: Respiração Guiada 4-7-8"
          >
            <Wind className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden xl:inline">Respiração 4-7-8</span>
          </button>

          {/* Mobile Simulator Toggle */}
          <button
            id="toggle-mobile-simulator"
            onClick={onToggleMobilePreview}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isMobilePreview
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title={isMobilePreview ? 'Voltar para Visão Web' : 'Simular Expo Android Mobile'}
          >
            {isMobilePreview ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5 text-blue-600" />}
            <span className="hidden sm:inline">
              {isMobilePreview ? 'Visão Web' : 'Simulador Expo'}
            </span>
          </button>

          {/* Firebase Connection Config */}
          <button
            id="btn-firebase-settings-header"
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 transition-colors"
            title="Configuração do Firebase / Firestore (bemestarsaudemental)"
          >
            <Database className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline font-mono">bemestarsaudemental</span>
          </button>

          {/* Architecture / GitHub Modal */}
          <button
            id="btn-github-architecture"
            onClick={onOpenExpoModal}
            className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            title="Arquitetura do Projeto Expo Android no GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Estrutura Expo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
