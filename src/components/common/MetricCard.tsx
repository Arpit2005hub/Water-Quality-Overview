import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  indicatorText?: string;
  indicatorVariant?: 'neutral' | 'warning' | 'alert' | 'positive';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  indicatorText,
  indicatorVariant = 'neutral',
}) => {
  const getIndicatorColor = () => {
    switch (indicatorVariant) {
      case 'alert':
        return 'text-[#B33939] font-semibold';
      case 'warning':
        return 'text-[#B5811A] font-semibold';
      case 'positive':
        return 'text-[#416B64] font-semibold';
      default:
        return 'text-[#6D9189]';
    }
  };

  return (
    <div className="bg-white rounded-md border border-[#DCE7E2] p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-[#343B38]/70 uppercase">
          {label}
        </span>
        <div className="w-7 h-7 rounded bg-[#DCE7E2]/50 flex items-center justify-center text-[#416B64] shrink-0">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      </div>

      <div>
        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#24473D] tabular-nums mb-1">
          {value}
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#343B38]/70">
          <span className="truncate">{subtext}</span>
          {indicatorText && (
            <span className={`shrink-0 tabular-nums ${getIndicatorColor()}`}>
              {indicatorText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
