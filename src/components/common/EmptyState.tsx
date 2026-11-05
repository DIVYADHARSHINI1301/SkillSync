import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
  secondaryAction,
}) => {
  return (
    <div
      className={cn(
        'text-center py-12 px-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 max-w-xl mx-auto flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-md leading-relaxed">{description}</p>
      {(actionText || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <Button onClick={onAction} variant="primary">
              {actionText}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
