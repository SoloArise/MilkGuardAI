import React, { useState, useMemo } from 'react';
import { PredictionRecord, MilkQuality } from '../types';
import {
  IconSearch,
  IconDownload,
  IconEye,
  IconChevron,
  IconAlert,
  IconCheck,
  IconTrash,
} from '../components/Icons';

interface HistoryPageProps {
  records: PredictionRecord[];
  onViewRecord: (record: PredictionRecord) => void;
  onExportCSV: () => void;
  onClearAllData?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  onViewRecord,
  onExportCSV,
  onClearAllData,
}) => {
  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<'all' | MilkQuality>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Quality check
      if (qualityFilter !== 'all' && r.predicted_quality !== qualityFilter) {
        return false;
      }
      // Search check
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = r.sample_id.toLowerCase().includes(q);
        const matchNotes = (r.inspector_notes || '').toLowerCase().includes(q);
        if (!matchId && !matchNotes) return false;
      }
      // Date check
      if (dateFilter && !r.created_at.startsWith(dateFilter)) {
        return false;
      }
      return true;
    });
  }, [records, search, qualityFilter, dateFilter]);

  const hasActiveFilters = search !== '' || qualityFilter !== 'all' || dateFilter !== '';

  const clearFilters = () => {
    setSearch('');
    setQualityFilter('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          Page Header
          ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
            RECORDS
          </div>
          <h2 className="text-2xl font-extrabold text-[#26332B] tracking-tight mt-0.5">
            Prediction History
          </h2>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            Search, filter, and review previous milk quality predictions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {onClearAllData && records.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FAECEB] bg-[#FAECEB] text-xs font-bold text-[#BB5A55] hover:bg-[#F3D5D4] transition-colors shadow-xs"
            >
              <IconTrash size={15} className="text-[#BB5A55]" />
              <span>Clear All Data</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4EAE6] bg-white text-xs font-bold text-[#26332B] hover:bg-[#F8FAF8] hover:border-[#D1DBD5] transition-colors shadow-xs"
          >
            <IconDownload size={15} className="text-[#216B45]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Filter Bar Card
          ------------------------------------------------------------- */}
      <div className="card-base p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Search */}
            <div className="relative">
              <IconSearch
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E7C73]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Sample ID..."
                className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#26332B] placeholder-[#6E7C73] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
              />
            </div>

            {/* Quality Filter */}
            <select
              value={qualityFilter}
              onChange={(e) => {
                setQualityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all cursor-pointer"
            >
              <option value="all">All Qualities</option>
              <option value="high">High Quality Only</option>
              <option value="medium">Medium Quality Only</option>
              <option value="low">Low Quality Only</option>
            </select>

            {/* Date Picker */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all cursor-pointer"
            />
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#BB5A55] hover:underline self-end md:self-center shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* -------------------------------------------------------------
            Table Content
            ------------------------------------------------------------- */}
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F8FAF8] text-[#6E7C73] flex items-center justify-center mx-auto mb-3">
              <IconAlert size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#26332B]">No records found</h4>
            <p className="text-xs text-[#6E7C73] mt-1 max-w-sm mx-auto">
              No milk sample predictions match the selected filter criteria. Try adjusting your search query or reset filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE6] text-[#6E7C73] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Sample ID</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">pH</th>
                  <th className="py-3 px-3">Temperature</th>
                  <th className="py-3 px-3">Quality</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE6]">
                {paginatedRecords.map((row) => {
                  const q = row.predicted_quality;
                  const badgeColor =
                    q === 'high'
                      ? 'bg-[#E8F5EC] text-[#216B45] border-[#C3E2CD]'
                      : q === 'medium'
                      ? 'bg-[#FFF3DC] text-[#D98B24] border-[#F3DBB0]'
                      : 'bg-[#FAECEB] text-[#BB5A55] border-[#EBC6C4]';
                  const dotColor =
                    q === 'high' ? 'bg-[#216B45]' : q === 'medium' ? 'bg-[#D98B24]' : 'bg-[#BB5A55]';

                  return (
                    <tr key={row.sample_id} className="hover:bg-[#F8FAF8] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#26332B]">{row.sample_id}</td>
                      <td className="py-3.5 px-3 text-[#6E7C73]">{row.created_at}</td>
                      <td className="py-3.5 px-3 font-semibold text-[#26332B]">{row.ph.toFixed(1)}</td>
                      <td className="py-3.5 px-3 text-[#26332B]">{row.temperature.toFixed(1)}°C</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {row.predicted_label || q.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onViewRecord(row)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#216B45] hover:text-[#154E31]"
                        >
                          <IconEye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            Pagination Footer
            ------------------------------------------------------------- */}
        {filteredRecords.length > 0 && (
          <div className="pt-4 mt-2 border-t border-[#E4EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6E7C73]">
            <div>
              Showing{' '}
              <strong className="text-[#26332B]">
                {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </strong>{' '}
              of <strong className="text-[#26332B]">{filteredRecords.length}</strong> results
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E4EAE6] hover:bg-[#F8FAF8] disabled:opacity-40 transition-colors"
              >
                <IconChevron direction="left" size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                const isActive = currentPage === num;
                return (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#216B45] text-white shadow-xs'
                        : 'text-[#6E7C73] hover:bg-[#F8FAF8] hover:text-[#26332B]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E4EAE6] hover:bg-[#F8FAF8] disabled:opacity-40 transition-colors"
              >
                <IconChevron direction="right" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing All Data */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card-base p-6 max-w-md w-full bg-white space-y-4 shadow-xl animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-[#FAECEB] text-[#BB5A55] flex items-center justify-center mx-auto">
              <IconTrash size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#26332B]">Clear All Prediction History?</h3>
              <p className="text-xs text-[#6E7C73] mt-1.5 leading-relaxed">
                This will permanently delete all {records.length} milk sample prediction records from the SQLite database. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E4EAE6] text-xs font-semibold text-[#6E7C73] hover:text-[#26332B] hover:bg-[#F8FAF8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  onClearAllData?.();
                }}
                className="px-4 py-2 rounded-xl bg-[#BB5A55] hover:bg-[#A34B46] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

