import React, { useState } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Home,
  Clock,
  Heart,
  User,
  Wind,
  Phone,
  Sparkles
} from 'lucide-react';
import { UserView } from './UserView';
import { Campaign, AssessmentForm, FormResponse } from '../../types';

interface MobilePhoneFrameProps {
  campaigns: Campaign[];
  forms: AssessmentForm[];
  responses: FormResponse[];
  onResponseSubmitted: () => void;
  onOpenBreathingModal: () => void;
}

export const MobilePhoneFrame: React.FC<MobilePhoneFrameProps> = ({
  campaigns,
  forms,
  responses,
  onResponseSubmitted,
  onOpenBreathingModal,
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'history' | 'support'>('home');

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="mb-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Simulador Expo React Native (Android Phone Shell)
        </span>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Esta é a visualização nativa que o professor verá no aplicativo instalado no Android (APK / Play Store).
        </p>
      </div>

      {/* Android Device Mockup Shell */}
      <div className="relative w-full max-w-[390px] rounded-[48px] border-[10px] border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/50">
        {/* Device screen container */}
        <div className="relative flex h-[740px] flex-col overflow-hidden rounded-[38px] bg-slate-50 dark:bg-slate-950">
          {/* Android Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>09:41</span>
            {/* Front camera punch hole */}
            <div className="h-4 w-4 rounded-full bg-slate-800 dark:bg-slate-900" />
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Expo Mobile App Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                BE
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bem-Estar Docente
                </h4>
                <span className="text-[9px] text-teal-600 font-semibold">
                  Expo Android App
                </span>
              </div>
            </div>

            <button
              onClick={onOpenBreathingModal}
              className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300"
            >
              <Wind className="h-3 w-3" /> 4-7-8
            </button>
          </div>

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeBottomTab === 'home' && (
              <UserView
                campaigns={campaigns}
                forms={forms}
                responses={responses}
                onResponseSubmitted={onResponseSubmitted}
                onOpenBreathingModal={onOpenBreathingModal}
                isMobileLayout={true}
              />
            )}

            {activeBottomTab === 'history' && (
              <div className="space-y-3 p-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-teal-600" /> Histórico de Avaliações
                </h4>
                {responses
                  .filter(r => r.userId === 'usr-01')
                  .map(resp => (
                    <div key={resp.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{resp.formTitle}</span>
                        <span className="font-bold text-teal-600">{resp.calculatedScore} pts</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(resp.submittedAt).toLocaleDateString('pt-BR')} &middot; Risco {resp.riskLevel}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {activeBottomTab === 'support' && (
              <div className="space-y-4 p-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-600" /> Suporte Imediato & Acolhimento
                </h4>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
                  <h5 className="font-bold text-rose-900 dark:text-rose-200 mb-1 flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> Central CVV 188
                  </h5>
                  <p className="text-rose-800 dark:text-rose-300 text-[11px] mb-3">
                    Atendimento gratuito e sigiloso disponível 24 horas todos os dias.
                  </p>
                  <a
                    href="tel:188"
                    className="block text-center rounded-lg bg-rose-600 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    Ligar 188 Agora
                  </a>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
                  <h5 className="font-bold text-teal-900 dark:text-teal-200 mb-1 flex items-center gap-1.5">
                    <Wind className="h-4 w-4" /> Exercício de Respiração
                  </h5>
                  <p className="text-teal-800 dark:text-teal-300 text-[11px] mb-3">
                    Pratique a técnica 4-7-8 para acalmar a mente e diminuir a tensão.
                  </p>
                  <button
                    onClick={onOpenBreathingModal}
                    className="w-full text-center rounded-lg bg-teal-600 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    Abrir Respiração Guiada
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="flex items-center justify-around border-t border-slate-200 bg-white py-2 dark:border-slate-800 dark:bg-slate-900 text-[10px] font-medium">
            <button
              onClick={() => setActiveBottomTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                activeBottomTab === 'home' ? 'text-teal-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('history')}
              className={`flex flex-col items-center gap-0.5 ${
                activeBottomTab === 'history' ? 'text-teal-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Histórico</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('support')}
              className={`flex flex-col items-center gap-0.5 ${
                activeBottomTab === 'support' ? 'text-teal-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Apoio</span>
            </button>
          </div>

          {/* Android Home Indicator Bar */}
          <div className="flex justify-center pb-1 pt-1 bg-white dark:bg-slate-900">
            <div className="h-1 w-28 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
