import { useEffect, useRef } from 'react';
import { Lock, X, LogIn } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  countdown: number;
  onCancel: () => void;
  onProceed: () => void;
}

const TOTAL = 5;

export default function LoginPromptModal({
  isOpen,
  countdown,
  onCancel,
  onProceed,
}: LoginPromptModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onCancel();
  };

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // SVG countdown ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / TOTAL) * circumference;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c060)' }}
          >
            <Lock size={24} className="text-white" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Login Required</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              To perform this action you need to be signed in.
              <br />
              Redirecting you to login in…
            </p>
          </div>

          {/* Countdown ring */}
          <div className="relative flex items-center justify-center">
            <svg width="96" height="96" className="-rotate-90">
              {/* Track */}
              <circle
                cx="48" cy="48" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="5"
              />
              {/* Progress */}
              <circle
                cx="48" cy="48" r={radius}
                fill="none"
                stroke="#c9a84c"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: 'stroke-dashoffset 0.95s linear' }}
              />
            </svg>
            <span
              className="absolute text-3xl font-bold text-white tabular-nums"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              {countdown}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onProceed}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-100"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c060)', color: '#1a1a1a' }}
            >
              <LogIn size={16} />
              Login Now
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
    </div>
  );
}
