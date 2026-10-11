import React, { useState } from 'react';
import { Menu, RefreshCw, Database, Check } from 'lucide-react';
import { NavTabId } from './Sidebar';

interface HeaderProps {
  activeTab: NavTabId;
  selectedYear: number | 'all';
  availableYears: number[];
  onSelectYear: (year: number | 'all') => void;
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  onOpenMobileNav: () => void;
}

const PAGE_METADATA: Record<NavTabId, { title: string; description: string }> = {
  overview: {
    title: 'Water Quality Overview',
    description: 'Explore historical water-quality observations across selected Bhopal ghats.',
  },
  ghats: {
    title: 'Ghat Monitoring Stations',
    description: 'Profile monitoring sites across Upper Lake (Bhojtal), Lower Lake, and urban water bodies.',
  },
  analytics: {
    title: 'Water Quality Analytics',
    description: 'Scientific distribution and benchmark evaluation for DO, BOD, pH, and Turbidity.',
  },
  trends: {
    title: 'Historical Trends & Pre/Post Visarjan Shifts',
    description: 'Multi-year trajectory of post-immersion oxygen drawdown and remediation recovery.',
  },
  priority: {
    title: 'Confirmatory Testing Priority Analysis',
    description: 'Screening matrix to identify ghats where follow-up verification sampling deserves priority.',
  },
  assistant: {
    title: 'Environmental Intelligence Assistant',
    description: 'Bilingual limnological assistant for Bhopal water chemistry and CPCB Class B standards.',
  },
  methodology: {
    title: 'Data, Standards & Methodology',
    description: 'CPCB Designated Best Use criteria, analytical testing methods, and dataset access.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedYear,
  availableYears,
  onSelectYear,
  onRefresh,
  isRefreshing,
  onOpenMobileNav,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const meta = PAGE_METADATA[activeTab] || PAGE_METADATA.overview;

  const handleRefreshClick = async () => {
    await onRefresh();
    setToastMessage('Data reloaded from local historical screening cache. (Demo data mode — no live API connected).');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <header className="bg-white border-b border-[#DCE7E2] sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 -ml-2 rounded-md text-[#343B38] hover:bg-[#F5F5F0]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#24473D]">
              {meta.title}
            </h2>
            <p className="text-xs text-[#343B38]/75 mt-0.5 max-w-2xl line-clamp-1">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
          {/* Transparent Data Status Indicator */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5F5F0] border border-[#DCE7E2] text-xs text-[#343B38]"
            title="Calibrated against CPCB Class B historical parameters for prototype evaluation"
          >
            <Database className="w-3.5 h-3.5 text-[#416B64]" />
            <span className="font-semibold text-[#24473D]">Historical Screening</span>
            <span className="text-[#343B38]/70 text-[11px] font-medium">(Illustrative Demo Data)</span>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-md border border-[#DCE7E2]">
            <label htmlFor="year-select" className="text-xs font-medium text-[#343B38]/80 px-1">
              Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                onSelectYear(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              className="bg-white text-xs font-semibold text-[#24473D] border border-[#DCE7E2] rounded px-2.5 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-[#416B64] cursor-pointer"
            >
              <option value="all">All Years (2021–2025)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Records
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#DCE7E2] bg-white text-xs font-semibold text-[#24473D] hover:bg-[#F5F5F0] hover:border-[#416B64] transition-colors disabled:opacity-60 cursor-pointer"
            title="Reload dataset and recalculate metrics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#416B64] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      </div>

      {/* Transparent Refresh Notification Toast */}
      {toastMessage && (
        <div className="mt-2.5 py-1.5 px-3 bg-[#DCE7E2]/60 border border-[#416B64]/40 rounded-md text-xs text-[#24473D] flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#416B64] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] font-semibold text-[#23856D] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
