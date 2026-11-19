import React from 'react';
import { PredictionRecord } from '../types';
import { IconClose, IconDownload, IconShield } from './Icons';

interface RecordModalProps {
  record: PredictionRecord | null;
  onClose: () => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const q = record.predicted_quality;
  const badgeColor =
    q === 'high'
      ? 'bg-[#E8F5EC] text-[#216B45] border-[#C3E2CD]'
      : q === 'medium'
      ? 'bg-[#FFF3DC] text-[#D98B24] border-[#F3DBB0]'
      : 'bg-[#FAECEB] text-[#BB5A55] border-[#EBC6C4]';
  const colorHex = q === 'high' ? '#216B45' : q === 'medium' ? '#D98B24' : '#BB5A55';

  const downloadCertificate = () => {
    window.open(`/api/reports/sample/${record.sample_id}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4EAE6] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4EAE6] flex items-center justify-between bg-[#F8FAF8]">
          <div>
            <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
              SAMPLE INSPECTION DETAILS
            </div>
            <h3 className="text-base font-extrabold text-[#26332B] mt-0.5">
              {record.sample_id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6E7C73] hover:text-[#26332B] rounded-lg hover:bg-white transition-colors"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Quality Banner */}
          <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: `${colorHex}44` }}>
            <div>
              <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
                Classification Result
              </div>
              <div className="text-xl font-extrabold mt-0.5" style={{ color: colorHex }}>
                {record.predicted_label || q.toUpperCase()}
              </div>
              <div className="text-xs text-[#6E7C73] mt-0.5">{record.created_at}</div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                {record.confidence ? `${record.confidence.toFixed(1)}% Conf.` : 'Evaluated'}
              </span>
            </div>
          </div>

          {/* Parameters Grid */}
          <div>
            <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider mb-2">
              Laboratory Measurements
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">pH Level:</span>
                <strong className="text-[#26332B]">{record.ph.toFixed(2)}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Temperature:</span>
                <strong className="text-[#26332B]">{record.temperature.toFixed(1)} °C</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Taste:</span>
                <strong className="text-[#26332B]">
                  {record.taste === 1 ? 'Acceptable' : 'Unacceptable'}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Odor:</span>
                <strong className="text-[#26332B]">
                  {record.odor === 1 ? 'Normal' : 'Abnormal'}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Fat Content:</span>
                <strong className="text-[#26332B]">
                  {record.fat === 1 ? 'Present' : 'Absent'}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Turbidity:</span>
                <strong className="text-[#26332B]">
                  {record.turbidity === 0 ? 'Clear' : 'Turbid'}
                </strong>
              </div>
              <div className="col-span-2 p-2.5 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] flex justify-between">
                <span className="text-[#6E7C73]">Color Value:</span>
                <strong className="text-[#26332B]">{record.color} RGB</strong>
              </div>
            </div>
          </div>

          {/* Inspector Remarks */}
          {record.inspector_notes && (
            <div className="p-3 rounded-lg bg-[#F8FAF8] border border-[#E4EAE6] text-xs">
              <span className="font-bold text-[#26332B] block mb-0.5">Inspector Notes:</span>
              <span className="text-[#6E7C73]">{record.inspector_notes}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAF8] border-t border-[#E4EAE6] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#6E7C73]">
            <IconShield size={14} className="text-[#216B45]" />
            <span>Audited Entry</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-colors"
            >
              <IconDownload size={14} />
              <span>Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#E4EAE6] bg-white text-xs font-bold text-[#6E7C73] hover:text-[#26332B]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

