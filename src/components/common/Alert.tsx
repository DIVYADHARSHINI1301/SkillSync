import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string | React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className,
  onClose,
}) => {
  const styles = {
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      container: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 text-sm flex items-start gap-3 shadow-xs relative',
        current.container,
        className
      )}
    >
      <div className="pt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5 text-sm">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-90">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
