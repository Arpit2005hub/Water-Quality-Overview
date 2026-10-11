import React, { useState, useMemo } from 'react';
import {
  Observation,
  WaterQualityParameter,
} from '../../types/waterQuality';
import { Search, ArrowUpDown, Download, Filter, RotateCcw } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface ObservationsTableProps {
  observations: Observation[];
  onResetFilters?: () => void;
}

type SortField = 'date' | 'ghatName' | 'parameter' | 'value';
type SortDirection = 'asc' | 'desc';

export const ObservationsTable: React.FC<ObservationsTableProps> = ({
  observations,
  onResetFilters,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParam, setSelectedParam] = useState<WaterQualityParameter | 'all'>('all');
  const [selectedGhat, setSelectedGhat] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const ghats = useMemo(() => dataService.getGhats(), []);

  // Filter & Search
  const filteredData = useMemo(() => {
    return observations.filter((obs) => {
      if (selectedParam !== 'all' && obs.parameter !== selectedParam) return false;
      if (selectedGhat !== 'all' && obs.ghatId !== selectedGhat) return false;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matches =
          obs.ghatName.toLowerCase().includes(q) ||
          obs.waterBody.toLowerCase().includes(q) ||
          obs.parameter.toLowerCase().includes(q) ||
          obs.date.includes(q) ||
          obs.fieldNotes.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [observations, selectedParam, selectedGhat, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      } else if (sortField === 'ghatName') {
        comparison = a.ghatName.localeCompare(b.ghatName);
      } else if (sortField === 'parameter') {
        comparison = a.parameter.localeCompare(b.parameter);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    dataService.triggerCSVDownload(sortedData, `visarjan_observations_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bg-white rounded-md border border-[#DCE7E2] shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-3.5 sm:p-4 border-b border-[#DCE7E2]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#24473D]">
              Historical Water Quality Observations
            </h3>
            <p className="text-xs text-[#343B38]/70 mt-0.5">
              CPCB Class B calibrated screening observations ({sortedData.length} records shown).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#343B38]/50" />
              <input
                type="text"
                placeholder="Search ghat or notes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 pr-2.5 py-1 bg-[#F5F5F0] text-xs text-[#24473D] rounded border border-[#DCE7E2] focus:outline-hidden focus:border-[#416B64] focus:bg-white"
              />
            </div>

            {/* Parameter Filter */}
            <select
              value={selectedParam}
              onChange={(e) => {
                setSelectedParam(e.target.value as WaterQualityParameter | 'all');
                setCurrentPage(1);
              }}
              className="bg-[#F5F5F0] text-xs font-medium text-[#24473D] border border-[#DCE7E2] rounded px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Parameters</option>
              <option value="DO">Dissolved Oxygen (DO)</option>
              <option value="BOD">BOD (3-day 27°C)</option>
              <option value="pH">pH</option>
              <option value="Turbidity">Turbidity</option>
            </select>

            {/* Ghat Filter */}
            <select
              value={selectedGhat}
              onChange={(e) => {
                setSelectedGhat(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F5F5F0] text-xs font-medium text-[#24473D] border border-[#DCE7E2] rounded px-2 py-1 focus:outline-hidden cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Ghats</option>
              {ghats.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* CSV Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#DCE7E2] bg-white text-xs font-semibold text-[#24473D] hover:bg-[#F5F5F0] hover:border-[#416B64] transition-colors cursor-pointer shrink-0"
              title="Download CSV table of filtered records"
            >
              <Download className="w-3.5 h-3.5 text-[#416B64]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F9F7] border-b border-[#E1E9E4] text-[#687873] uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-[#172B27] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Date & Phase</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ghatName')}
                className="py-3 px-4 cursor-pointer hover:text-[#172B27] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Ghat & Water Body</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('parameter')}
                className="py-3 px-4 cursor-pointer hover:text-[#172B27] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Parameter</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('value')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#172B27] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Observed Value</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Benchmark Rule</th>
              <th className="py-3 px-4 whitespace-nowrap">Interpretation</th>
              <th className="py-3 px-4 whitespace-nowrap">Data Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E9E4]">
            {paginatedData.length > 0 ? (
              paginatedData.map((obs) => {
                return (
                  <tr
                    key={obs.id}
                    className="hover:bg-[#F7F9F7]/80 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#172B27] font-mono tabular-nums">
                        {obs.date}
                      </div>
                      <div className="text-[11px] text-[#687873]">
                        {obs.phase}
                      </div>
                    </td>

                    {/* Ghat */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#172B27]">
                        {obs.ghatName}
                      </div>
                      <div className="text-[11px] text-[#687873] truncate max-w-[180px]">
                        {obs.waterBody}
                      </div>
                    </td>

                    {/* Parameter */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#172B27]">
                        {obs.parameter}
                      </div>
                      <div className="text-[11px] text-[#687873]">
                        {obs.unit}
                      </div>
                    </td>

                    {/* Observed Value */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="text-sm font-bold font-mono tabular-nums text-[#172B27]">
                        {obs.value}
                      </div>
                      <div className="text-[11px] text-[#687873]">
                        {obs.unit}
                      </div>
                    </td>

                    {/* Benchmark */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs text-[#172B27]">
                        {obs.benchmarkRule}
                      </div>
                      <div className="text-[11px] text-[#687873]">
                        Class B Standard
                      </div>
                    </td>

                    {/* Interpretation */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {obs.isOutOfBenchmark ? (
                        <div className="text-xs font-semibold text-[#B33939] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B33939]" />
                          <span>Out of Benchmark</span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-[#416B64] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#416B64]" />
                          <span>Within Benchmark</span>
                        </div>
                      )}
                      <div className="text-[11px] text-[#343B38]/70 truncate max-w-[200px]" title={obs.fieldNotes}>
                        {obs.fieldNotes}
                      </div>
                    </td>

                    {/* Data Quality */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-[#172B27]">
                        {obs.dataQuality}
                      </div>
                      <div className="text-[10px] text-[#687873] truncate max-w-[160px]" title={obs.labTechnique}>
                        {obs.labTechnique}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <Filter className="w-8 h-8 text-[#687873] mx-auto opacity-50" />
                    <div className="text-sm font-semibold text-[#172B27]">
                      No observations match the selected criteria
                    </div>
                    <p className="text-xs text-[#687873]">
                      Try clearing search terms or selecting a different year/parameter.
                    </p>
                    {onResetFilters && (
                      <button
                        onClick={onResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23856D] text-white text-xs font-medium hover:bg-[#155E63] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#E1E9E4] bg-[#F7F9F7] flex items-center justify-between text-xs text-[#687873]">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} observations
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-[#E1E9E4] bg-white text-[#172B27] disabled:opacity-50 cursor-pointer font-medium"
            >
              Previous
            </button>
            <span className="px-2 font-mono tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-md border border-[#E1E9E4] bg-white text-[#172B27] disabled:opacity-50 cursor-pointer font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
