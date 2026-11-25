import { Check } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { ADMISSION_STEPS, STATUS_TO_STEP } from '../../utils/constants';

export function ProgressTracker({ status, className }) {
  const currentStep = STATUS_TO_STEP[status] ?? 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-start justify-between relative">
        {/* connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 mx-8" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-700 mx-8 transition-all duration-300"
          style={{ width: `calc(${(Math.max(0, currentStep) / (ADMISSION_STEPS.length - 1)) * 100}% - 0px)` }}
        />

        {ADMISSION_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const upcoming = i > currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold',
                  done && 'bg-blue-700 border-blue-700 text-white',
                  active && 'bg-white border-blue-700 text-blue-700 ring-4 ring-blue-100',
                  upcoming && 'bg-white border-slate-300 text-slate-400'
                )}
              >
                {done ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={cn(
                  'text-xs text-center leading-tight max-w-20',
                  done && 'text-blue-700 font-medium',
                  active && 'text-blue-700 font-semibold',
                  upcoming && 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

