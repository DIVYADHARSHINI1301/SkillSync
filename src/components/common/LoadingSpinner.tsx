import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-slate-300 border-t-indigo-600 animate-spin',
          sizeClasses[size]
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
    </div>
  );
};
