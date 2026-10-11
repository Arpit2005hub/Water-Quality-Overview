import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  text?: string;
  variant?: 'screening' | 'methodology' | 'info';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  text = 'Historical observations are used for screening and comparison. They do not represent real-time conditions.',
  variant = 'screening',
  className = '',
}) => {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-md border text-xs sm:text-sm transition-all ${
        variant === 'screening'
          ? 'bg-[#DCE7E2]/40 border-[#6D9189]/40 text-[#24473D]'
          : variant === 'methodology'
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-[#F5F5F0] border-[#DCE7E2] text-[#343B38]'
      } ${className}`}
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#416B64]" aria-hidden="true" />
      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
};
