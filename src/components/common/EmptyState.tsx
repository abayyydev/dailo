import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" role="status">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
