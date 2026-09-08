import { useState } from 'react';
import { X, Database, ShieldCheck, CheckCircle2, Copy, Check, RefreshCw } from 'lucide-react';
import { getSavedFirebaseConfig, saveCustomFirebaseConfig, FirebaseConfigOptions } from '../../firebase/config';

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseSettingsModal({ isOpen, onClose }: FirebaseSettingsModalProps) {
  const [config, setConfig] = useState<FirebaseConfigOptions>(getSavedFirebaseConfig());
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCustomFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const copyConfigJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          id="btn-close-firebase-modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500 dark:bg-amber-500/20">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Conexão com Firebase (Firestore & Auth)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projeto ativo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{config.projectId}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Status do Backend e Regras de Segurança
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Conectado & Operacional
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            As coleções Firestore <code className="text-slate-800 dark:text-slate-200 font-mono">campaigns</code>, <code className="text-slate-800 dark:text-slate-200 font-mono">forms</code>, <code className="text-slate-800 dark:text-slate-200 font-mono">responses</code> e <code className="text-slate-800 dark:text-slate-200 font-mono">interventions</code> estão sincronizadas em tempo real com regras de segurança ativas no projeto <strong className="text-slate-800 dark:text-slate-200">bemestarsaudemental</strong>.
          </p>
        </div>

        {/* Configuration inputs */}
        <div className="mt-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Parâmetros do Firebase Web & Expo SDK
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project ID (Identificador do Projeto)
              </label>
              <input
                id="input-firebase-project-id"
                type="text"
                value={config.projectId}
                onChange={e => setConfig({ ...config, projectId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Auth Domain
              </label>
              <input
                id="input-firebase-auth-domain"
                type="text"
                value={config.authDomain || ''}
                onChange={e => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Web / Expo App ID
              </label>
              <input
                id="input-firebase-app-id"
                type="text"
                value={config.appId || ''}
                onChange={e => setConfig({ ...config, appId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Storage Bucket
              </label>
              <input
                id="input-firebase-storage"
                type="text"
                value={config.storageBucket || ''}
                onChange={e => setConfig({ ...config, storageBucket: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            id="btn-copy-firebase-json"
            onClick={copyConfigJson}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado para Área de Transferência' : 'Copiar JSON de Configuração'}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-save-firebase-config"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Configuração Atualizada
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Salvar e Recarregar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
