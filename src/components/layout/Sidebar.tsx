import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Activity,
  TrendingUp,
  AlertTriangle,
  Bot,
  BookOpen,
  Waves,
  X,
} from 'lucide-react';

export type NavTabId =
  | 'overview'
  | 'ghats'
  | 'analytics'
  | 'trends'
  | 'priority'
  | 'assistant'
  | 'methodology';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Summary KPIs & benchmarks',
  },
  {
    id: 'ghats',
    label: 'Ghat Monitoring',
    icon: MapPin,
    description: 'Bhopal immersion sites',
  },
  {
    id: 'analytics',
    label: 'Water Quality Analytics',
    icon: Activity,
    description: 'DO, BOD & pH metrics',
  },
  {
    id: 'trends',
    label: 'Historical Trends',
    icon: TrendingUp,
    description: 'Pre vs post-visarjan shifts',
  },
  {
    id: 'priority',
    label: 'Priority Analysis',
    icon: AlertTriangle,
    description: 'Confirmatory testing priority',
  },
  {
    id: 'assistant',
    label: 'AI Assistant',
    icon: Bot,
    description: 'Environmental intelligence',
  },
  {
    id: 'methodology',
    label: 'Data & Methodology',
    icon: BookOpen,
    description: 'CPCB criteria & dataset',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-[#24473D] text-[#F5F5F0] flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#DCE7E2]/15 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#DCE7E2]/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#416B64] flex items-center justify-center text-white shrink-0">
                <Waves className="w-5 h-5 text-[#DCE7E2]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                  Visarjan Ghat Watch
                </h1>
                <p className="text-[11px] text-[#DCE7E2]/80 font-medium">
                  Bhopal Water Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#416B64] text-white border-l-3 border-[#DCE7E2]'
                    : 'text-[#DCE7E2]/85 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#6D9189]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Project Prototype Note */}
        <div className="p-4 border-t border-[#DCE7E2]/15 bg-[#1B362E]">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white">
              Historical Research Screening
            </div>
            <div className="text-[11px] text-[#DCE7E2]/70">
              Student Project · Bhopal Lakes
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#DCE7E2]/10 text-[10px] text-[#DCE7E2]/60 leading-relaxed">
            Historical dataset calibrated to CPCB Class B standards for hackathon evaluation. Not an official government portal.
          </div>
        </div>
      </aside>
    </>
  );
};
