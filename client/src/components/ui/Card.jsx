import { cn } from '../../utils/helpers';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-white border border-slate-200 rounded-lg shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-200', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-800', className)}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg', className)}>
      {children}
    </div>
  );
}

export function SummaryCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <Card>
      <CardBody className="flex items-start gap-4">
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', colorMap[color])}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-600')}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

