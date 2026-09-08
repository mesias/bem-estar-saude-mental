import { useState, useEffect } from 'react';
import { X, Wind, Play, Pause, RotateCcw, Heart } from 'lucide-react';

interface GuidedBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'ready';

export function GuidedBreathingModal({ isOpen, onClose }: GuidedBreathingModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('ready');
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      if (phase === 'ready') {
        setPhase('inhale');
        setCountdown(4);
      } else if (phase === 'inhale') {
        if (countdown > 1) {
          timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else {
          setPhase('hold');
          setCountdown(7);
        }
      } else if (phase === 'hold') {
        if (countdown > 1) {
          timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else {
          setPhase('exhale');
          setCountdown(8);
        }
      } else if (phase === 'exhale') {
        if (countdown > 1) {
          timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else {
          setCycleCount(c => c + 1);
          setPhase('inhale');
          setCountdown(4);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, phase, countdown]);

  if (!isOpen) return null;

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inspire suavemente pelo nariz...';
      case 'hold':
        return 'Segure o ar calmamente...';
      case 'exhale':
        return 'Solte o ar lentamente pela boca...';
      default:
        return 'Pronto para despressurizar?';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125 transition-transform duration-[4000ms] ease-out bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400';
      case 'hold':
        return 'scale-125 bg-amber-100 dark:bg-amber-950/60 border-amber-400';
      case 'exhale':
        return 'scale-90 transition-transform duration-[8000ms] ease-in bg-teal-50 dark:bg-teal-950/40 border-teal-400';
      default:
        return 'scale-100 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          id="btn-close-breathing"
          onClick={() => {
            setIsActive(false);
            setPhase('ready');
            onClose();
          }}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
          <Wind className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Apoio Imediato Docente</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Exercício de Respiração 4-7-8
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Técnica clínica para acalmar o sistema nervoso autônomo, desacelerar batimentos e reduzir ansiedade aguda.
        </p>

        {/* Animation Visualizer */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            <div
              className={`flex h-44 w-44 items-center justify-center rounded-full border-4 shadow-lg transition-all ${getCircleScale()}`}
            >
              <div className="text-center">
                <span className="text-4xl font-extrabold text-slate-800 dark:text-white">
                  {phase === 'ready' ? <Heart className="h-10 w-10 text-emerald-500 mx-auto" /> : countdown}
                </span>
                <span className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  {phase === 'ready' ? 'Iniciar' : phase === 'inhale' ? 'Inspire (4s)' : phase === 'hold' ? 'Segure (7s)' : 'Expire (8s)'}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-base font-semibold text-slate-800 dark:text-slate-200">
            {getPhaseInstruction()}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ciclos completados: <span className="font-bold text-emerald-600">{cycleCount}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <button
              id="btn-start-breathing"
              onClick={() => setIsActive(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              {phase === 'ready' ? 'Iniciar Acalmia' : 'Continuar'}
            </button>
          ) : (
            <button
              id="btn-pause-breathing"
              onClick={() => setIsActive(false)}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-amber-700 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </button>
          )}

          <button
            id="btn-reset-breathing"
            onClick={() => {
              setIsActive(false);
              setPhase('ready');
              setCountdown(4);
              setCycleCount(0);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
