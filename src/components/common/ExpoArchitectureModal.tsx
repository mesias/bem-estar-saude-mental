import { useState } from 'react';
import { X, Smartphone, FolderTree, FileCode, Check, Copy, ExternalLink, Shield, BellRing, Sparkles } from 'lucide-react';

interface ExpoArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpoArchitectureModal({ isOpen, onClose }: ExpoArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'recommendation' | 'expo_code' | 'push_notifications'>('structure');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const folderStructureText = `bemestarsaudemental/
├── apps/
│   ├── mobile/                     # [Expo React Native] Android (APK/AAB) e iOS (IPA)
│   │   ├── app/                    # Expo Router (navegação moderna baseada em rotas)
│   │   │   ├── (auth)/             # Telas de Autenticação
│   │   │   │   ├── login.tsx       # Social Login (Google / Firebase Auth)
│   │   │   │   └── _layout.tsx
│   │   │   ├── (tabs)/             # Abas principais do participante
│   │   │   │   ├── index.tsx       # Hub de Avaliações ativas da Campanha
│   │   │   │   ├── history.tsx     # Gráfico de evolução do escore de bem-estar
│   │   │   │   ├── support.tsx     # Recursos imediatos (Linha 188, Respiração 4-7-8)
│   │   │   │   └── profile.tsx     # Notificações e dados do docente
│   │   │   ├── assessment/
│   │   │   │   └── [formId].tsx    # Renderizador dinâmico de questionário (7 tipos de campos)
│   │   │   ├── _layout.tsx
│   │   │   └── +not-found.tsx
│   │   ├── components/             # Componentes móveis nativos
│   │   │   ├── SliderQuestion.tsx
│   │   │   ├── OptionRadioGroup.tsx
│   │   │   ├── FilePickerButton.tsx
│   │   │   └── RiskSupportCard.tsx
│   │   ├── hooks/                  # Custom Hooks Expo
│   │   │   ├── usePushNotifications.ts  # Registro de token Expo / FCM no Firestore
│   │   │   ├── useAuth.ts               # Firebase Auth + Google Sign-In
│   │   │   └── useAssessmentSync.ts     # Cálculo de escore e envio com offline persistence
│   │   ├── services/
│   │   │   └── firebaseMobile.ts   # Inicialização Firebase compatível com React Native
│   │   ├── app.json                # Configuração Expo (bundleIdentifier, permissions, plugins)
│   │   └── package.json            # expo: ~51.0, react-native, @react-native-firebase
│   │
│   └── web-admin/                  # [Web Portal] Gestores e Psicólogos Clínicos
│       ├── src/
│       │   ├── components/         # Form Builder, Painel de Alertas de Risco, CSV Exporter
│       │   └── pages/
│       └── package.json
│
├── packages/
│   ├── types/                      # Contratos TypeScript compartilhados entre Web e Mobile
│   │   └── src/index.ts            # Campaign, AssessmentForm, FormResponse, QuestionType
│   └── utils/                      # Algoritmo de cálculo de escore e detector de risco clínico
│
├── firestore.rules                 # Regras de segurança validadas e protegidas
├── firebase-blueprint.json         # Especificação canônica dos esquemas
└── README.md                       # Documentação do projeto Open Source no GitHub`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Arquitetura Open-Source Expo Android & Web para GitHub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estrutura modular recomendada para o projeto <span className="font-mono text-emerald-600 dark:text-emerald-400">bemestarsaudemental</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-expo-modal"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-3 pb-2 dark:border-slate-800 overflow-x-auto text-xs font-medium">
          <button
            id="tab-structure"
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'structure'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
            }`}
          >
            <FolderTree className="h-4 w-4" /> Estrutura de Pastas (Monorepo)
          </button>

          <button
            id="tab-recommendation"
            onClick={() => setActiveTab('recommendation')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'recommendation'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
            }`}
          >
            <Sparkles className="h-4 w-4" /> Decisão: Web vs Expo App
          </button>

          <button
            id="tab-expo-code"
            onClick={() => setActiveTab('expo_code')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'expo_code'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
            }`}
          >
            <FileCode className="h-4 w-4" /> Código Expo (Auth & Firestore)
          </button>

          <button
            id="tab-push-notif"
            onClick={() => setActiveTab('push_notifications')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'push_notifications'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
            }`}
          >
            <BellRing className="h-4 w-4" /> Notificações & Prazos
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'structure' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Estrutura escalável mono-repositório com separação clara de responsabilidades (Clean Architecture):
                </p>
                <button
                  id="btn-copy-structure"
                  onClick={() => copyToClipboard(folderStructureText)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar Árvore'}
                </button>
              </div>

              <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed max-h-[50vh]">
                {folderStructureText}
              </pre>
            </div>
          )}

          {activeTab === 'recommendation' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
                  💡 Resposta à sua dúvida: Criar configuração e formulários no Web Desktop ou no Expo App?
                </h4>
                <p className="mt-1 text-amber-800 dark:text-amber-200">
                  <strong>Recomendação Arquitetural de Alto Nível:</strong> Mantenha a <strong>Criação de Campanhas e Construtor de Formulários (Form Builder) no Web Desktop</strong> e concentre o <strong>Expo React Native exclusivamente para a experiência dos Usuários Finais (Professores)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    💻 Web Desktop (Gestor e Psicólogo)
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li><strong>Construção de formulários:</strong> Arrastar perguntas, configurar pesos numéricos, definir gatilhos de segurança e digitar longas descrições é muito mais ergonômico em monitor com teclado físico.</li>
                    <li><strong>Análise de dados & CSV:</strong> Psicólogos e pesquisadores precisam cruzar dados com SPSS, R e Python, exigindo download ágil de planilhas.</li>
                    <li><strong>Painel de Alertas de Risco:</strong> Visão em tempo real de toda a coorte com filtros clínicos complexos.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    📱 Expo Android / iOS (Professor / Usuário)
                  </h5>
                  <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li><strong>Push Notifications Nativas:</strong> O celular está no bolso do professor; alertas de novos formulários e lembretes de prazo atingem taxas de resposta 4x maiores que e-mails isolados.</li>
                    <li><strong>Apoio Imediato & Discrição:</strong> O professor pode preencher o questionário no transporte ou na sala dos professores com sigilo individual e acionar o botão de ligar 188 / respiração em 1 toque.</li>
                    <li><strong>Acesso Offline:</strong> Com Firestore offline persistence, respostas parciais não são perdidas se a conexão da escola oscilar.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expo_code' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Exemplo real de inicialização do Firebase e Social Login no Expo React Native:
              </p>
              <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-[50vh]">
{`// apps/mobile/services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "bemestarsaudemental",
  apiKey: "AIzaSy...", // Suas credenciais
  authDomain: "bemestarsaudemental.firebaseapp.com",
  storageBucket: "bemestarsaudemental.firebasestorage.app",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth com persistência nativa AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };

// Build para Android via EAS:
// npx expo install @react-native-firebase/app @react-native-firebase/auth
// eas build --platform android --profile preview`}
              </pre>
            </div>
          )}

          {activeTab === 'push_notifications' && (
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1 flex items-center gap-1.5">
                  <BellRing className="h-4 w-4" /> Gestão de Prazos vs. Discricionário
                </h4>
                <p className="mt-1 text-blue-800 dark:text-blue-200">
                  Implementamos ambas as opções no sistema:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Modo Prazo Rígido (Strict Deadlines):</strong> Dispara notificação push inicial, calcula contagem regressiva e envia lembretes automáticos para não respondentes a cada 3 ou 7 dias até o fechamento.</li>
                  <li><strong>Modo Discricionário (Flexible):</strong> Notifica apenas a disponibilização da nova ferramenta de acolhimento e deixa a frequência a critério do docente.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-900 text-emerald-400 font-mono">
                <p className="text-[11px] text-slate-400 mb-2">// Código de registro de Token Expo:</p>
{`import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';

export async function registerForPushNotificationsAsync(userId: string, db: any) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await setDoc(doc(db, 'users', userId), { pushToken: token }, { merge: true });
  return token;
}`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-3 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Pronto para versionar no GitHub como Open-Source (GPLv3 / Apache-2.0 / MIT)
          </span>
          <button
            id="btn-close-expo-modal-footer"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
