import { cn } from '../../utils/helpers';
import { STATUS_CONFIG, DOC_STATUS_CONFIG } from '../../utils/constants';

const colorMap = {
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  green: 'bg-green-50 text-green-700 border-green-200',
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200', className)}>{status}</span>;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorMap[config.color], className)}>
      {config.label}
    </span>
  );
}

export function DocStatusBadge({ status, className }) {
  const config = DOC_STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorMap[config.color], className)}>
      {config.label}
    </span>
  );
}

export function Badge({ color = 'gray', children, className }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorMap[color], className)}>
      {children}
    </span>
  );
}

