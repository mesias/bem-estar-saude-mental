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

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const [isMobilePreview, setIsMobilePreview] = useState(false);

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
  }, []);

  // Calculate unacknowledged risk alerts
  const unacknowledgedAlerts = responses.filter(r => r.isRiskAlert && !r.alertAcknowledged);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Global Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={role => {
          setCurrentRole(role);
          // If switching to user and wanting mobile experience, optionally toggle
          if (role === 'user' && !isMobilePreview) {
            // User can stay on web or toggle to mobile
          }
        }}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        unacknowledgedAlertsCount={unacknowledgedAlerts.length}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
        onOpenExpoModal={() => setShowExpoModal(true)}
        onOpenBreathingModal={() => setShowBreathingModal(true)}
        onAlertBadgeClick={() => setCurrentRole('psychologist')}
      />

      {/* Persistent Critical Safety Alert Bar for Psychology / Manager */}
      {unacknowledgedAlerts.length > 0 && currentRole !== 'user' && (
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
                responses={responses}
                onCampaignCreated={refreshData}
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
              />
            )}
          </>
        )}
      </main>

      {/* Footer Info & Disclaimers */}
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

