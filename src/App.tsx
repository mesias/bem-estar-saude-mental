import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ManagerView } from './components/manager/ManagerView';
import { PsychologyView } from './components/psychology/PsychologyView';
import { UserView } from './components/user/UserView';
import { MobilePhoneFrame } from './components/user/MobilePhoneFrame';
import { GuidedBreathingModal } from './components/common/GuidedBreathingModal';
import { FirebaseSettingsModal } from './components/common/FirebaseSettingsModal';
import { ExpoArchitectureModal } from './components/common/ExpoArchitectureModal';
import { dataService } from './services/dataService';
import { UserRole, Campaign, AssessmentForm, FormResponse, ClinicalIntervention } from './types';
import { AlertTriangle, Sparkles, HeartHandshake, Shield, Smartphone } from 'lucide-react';

function getRouteState(): { role: UserRole; isIsolated: boolean; formId: string | null } {
  if (typeof window === 'undefined') {
    return { role: 'user', isIsolated: true, formId: null };
  }

  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get('role')?.toLowerCase();
  const formIdParam = searchParams.get('formId') || null;

  const isManagementRoute =
    path.startsWith('/gestao') ||
    path.startsWith('/painel') ||
    path.startsWith('/admin') ||
    hash.includes('gestao') ||
    hash.includes('painel') ||
    hash.includes('admin') ||
    roleParam === 'manager' ||
    roleParam === 'gestor' ||
    roleParam === 'admin';

  const isPsychRoute =
    path.startsWith('/psicologia') ||
    hash.includes('psicologia') ||
    roleParam === 'psychologist' ||
    roleParam === 'psicologia';

  if (isPsychRoute) {
    return { role: 'psychologist', isIsolated: false, formId: formIdParam };
  }

  if (isManagementRoute) {
    return { role: 'manager', isIsolated: false, formId: formIdParam };
  }

  // Default is 100% ISOLATED PARTICIPANT (Docente)
  return { role: 'user', isIsolated: true, formId: formIdParam };
}

export default function App() {
  const initialRoute = getRouteState();
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRoute.role);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isolatedUserMode, setIsolatedUserMode] = useState(initialRoute.isIsolated);
  const [targetFormId, setTargetFormId] = useState<string | null>(initialRoute.formId);

  // Core data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [forms, setForms] = useState<AssessmentForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [interventions, setInterventions] = useState<ClinicalIntervention[]>([]);

  // Modals
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showExpoModal, setShowExpoModal] = useState(false);

  // Load state from dataService
  const refreshData = () => {
    setCampaigns(dataService.getCampaigns());
    setForms(dataService.getForms());
    setResponses(dataService.getResponses());
    setInterventions(dataService.getInterventions());
  };

  useEffect(() => {
    refreshData();
    const unsubscribeData = dataService.subscribe(refreshData);

    const handleLocationChange = () => {
      const route = getRouteState();
      setCurrentRole(route.role);
      setIsolatedUserMode(route.isIsolated);
      if (route.formId) {
        setTargetFormId(route.formId);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      unsubscribeData();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleExitIsolatedMode = () => {
    // Switch to management mode cleanly
    const url = new URL(window.location.href);
    url.searchParams.delete('role');
    url.searchParams.delete('formId');
    if (!url.pathname.includes('/gestao') && !url.hash.includes('gestao')) {
      window.history.pushState({}, '', '/gestao');
    }
    setIsolatedUserMode(false);
    setCurrentRole('manager');
  };

  const handleSwitchToUserMode = () => {
    // Switch to isolated participant/user mode cleanly
    const url = new URL(window.location.href);
    url.searchParams.delete('role');
    window.history.pushState({}, '', '/');
    setIsolatedUserMode(true);
    setCurrentRole('user');
  };

  // Calculate unacknowledged risk alerts
  const unacknowledgedAlerts = responses.filter(r => r.isRiskAlert && !r.alertAcknowledged);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Global Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={role => {
          if (role === 'user') {
            handleSwitchToUserMode();
          } else {
            setCurrentRole(role);
            setIsolatedUserMode(false);
            const url = new URL(window.location.href);
            if (!url.pathname.includes('/gestao') && !url.hash.includes('gestao')) {
              window.history.pushState({}, '', '/gestao');
            }
          }
        }}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        unacknowledgedAlertsCount={unacknowledgedAlerts.length}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
        onOpenExpoModal={() => setShowExpoModal(true)}
        onOpenBreathingModal={() => setShowBreathingModal(true)}
        onOpenResearchModal={() => {}}
        onAlertBadgeClick={() => setCurrentRole('psychologist')}
        isolatedUserMode={isolatedUserMode}
        onExitIsolatedMode={handleExitIsolatedMode}
      />

      {/* Persistent Critical Safety Alert Bar for Psychology / Manager */}
      {!isolatedUserMode && unacknowledgedAlerts.length > 0 && currentRole !== 'user' && (
        <div className="bg-rose-600 px-4 py-2 text-white shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 animate-bounce shrink-0" />
              <span>
                <strong>Atenção Clínica:</strong> {unacknowledgedAlerts.length} docente(s) registraram escore de bem-estar abaixo do limiar de segurança ({unacknowledgedAlerts.map(a => a.userName).join(', ')}).
              </span>
            </div>
            <button
              onClick={() => setCurrentRole('psychologist')}
              className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold hover:bg-white/30 transition-colors whitespace-nowrap ml-2"
            >
              Ver Alertas e Acolher &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 ${isolatedUserMode ? 'max-w-4xl' : 'max-w-7xl'}`}>
        {/* If Mobile Simulator Preview is ON */}
        {isMobilePreview ? (
          <MobilePhoneFrame
            campaigns={campaigns}
            forms={forms}
            responses={responses}
            onResponseSubmitted={refreshData}
            onOpenBreathingModal={() => setShowBreathingModal(true)}
          />
        ) : (
          <>
            {/* 1. MANAGER VIEW */}
            {currentRole === 'manager' && (
              <ManagerView
                campaigns={campaigns}
                forms={forms}
                responses={responses}
                onCampaignCreated={refreshData}
                onSwitchToUserView={handleSwitchToUserMode}
                onNavigateToForms={() => setCurrentRole('psychologist')}
              />
            )}

            {/* 2. PSYCHOLOGY VIEW */}
            {currentRole === 'psychologist' && (
              <PsychologyView
                campaigns={campaigns}
                forms={forms}
                responses={responses}
                interventions={interventions}
                onDataUpdated={refreshData}
                onOpenBreathingModal={() => setShowBreathingModal(true)}
              />
            )}

            {/* 3. USER / TEACHER VIEW */}
            {currentRole === 'user' && (
              <UserView
                campaigns={campaigns}
                forms={forms}
                responses={responses}
                onResponseSubmitted={refreshData}
                onOpenBreathingModal={() => setShowBreathingModal(true)}
                initialFormId={targetFormId}
                isolatedMode={isolatedUserMode}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Info & Disclaimers */}
      {!isolatedUserMode ? (
        <footer className="border-t border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Bem-Estar Saúde Mental</span>
              <span>&middot; Plataforma Open Source para Pesquisa e Cuidado Docente</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <button
                onClick={() => setShowFirebaseModal(true)}
                className="hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Firestore: <span className="font-mono text-emerald-600">bemestarsaudemental</span>
              </button>
              <button
                onClick={() => setShowExpoModal(true)}
                className="hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <Smartphone className="h-3 w-3" />
                Arquitetura Expo Android
              </button>
              <span className="text-slate-400">Sigilo CFP Resolução 11/2018</span>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="border-t border-slate-200 bg-white/50 py-3 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] text-slate-400 text-center">
          <span>Ambiente Seguro & Confidencial &middot; Resolução CFP 11/2018 &middot; TCLE Digital</span>
        </footer>
      )}

      {/* Global Modals */}
      <GuidedBreathingModal
        isOpen={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
      />

      <FirebaseSettingsModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />

      <ExpoArchitectureModal
        isOpen={showExpoModal}
        onClose={() => setShowExpoModal(false)}
      />
    </div>
  );
}

