import React, { useState, useMemo } from 'react';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewTab } from './components/overview/OverviewTab';
import { GhatMonitoringTab } from './components/ghats/GhatMonitoringTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { HistoricalTrendsTab } from './components/trends/HistoricalTrendsTab';
import { PriorityAnalysisTab } from './components/priority/PriorityAnalysisTab';
import { AIAssistantTab } from './components/assistant/AIAssistantTab';
import { MethodologyTab } from './components/methodology/MethodologyTab';
import { dataService } from './services/dataService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const availableYears = useMemo(() => dataService.getAvailableYears(), []);

  // Filter observations by selected year
  const currentObservations = useMemo(() => {
    return dataService.getObservations({ year: selectedYear });
  }, [selectedYear, dataVersion]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await dataService.reloadDataset();
    setDataVersion((v) => v + 1);
    setIsRefreshing(false);
  };

  const handleResetFilters = () => {
    setSelectedYear('all');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172B27] flex">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          selectedYear={selectedYear}
          availableYears={availableYears}
          onSelectYear={setSelectedYear}
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewTab
              observations={currentObservations}
              selectedYear={selectedYear}
              onResetFilters={handleResetFilters}
            />
          )}

          {activeTab === 'ghats' && (
            <GhatMonitoringTab selectedYear={selectedYear} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab selectedYear={selectedYear} />
          )}

          {activeTab === 'trends' && (
            <HistoricalTrendsTab />
          )}

          {activeTab === 'priority' && (
            <PriorityAnalysisTab selectedYear={selectedYear} />
          )}

          {activeTab === 'assistant' && (
            <AIAssistantTab />
          )}

          {activeTab === 'methodology' && (
            <MethodologyTab />
          )}
        </main>
      </div>
    </div>
  );
}
