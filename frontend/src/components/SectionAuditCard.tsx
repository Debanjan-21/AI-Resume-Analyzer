import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SectionHealth } from '../types';

interface SectionAuditCardProps {
  audits: SectionHealth[];
}

export const SectionAuditCard: React.FC<SectionAuditCardProps> = ({ audits }) => {
  const getStatusBadge = (status: SectionHealth['status']) => {
    switch (status) {
      case 'excellent':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            ATS Compliant
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            Needs Attention
          </span>
        );
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Critical Fix
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Section-by-Section ATS Health Audit</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {audits.length} Sections Scanned
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validates proper section labeling, parseability, and information structure for corporate ATS software.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {audits.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {item.section}
                </h4>
                {getStatusBadge(item.status)}
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 90 ? 'bg-emerald-500' : item.score >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">{item.score}%</span>
              </div>

              {/* Findings */}
              <ul className="space-y-1.5 mb-3">
                {item.findings.map((f, fIdx) => (
                  <li key={fIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
              <span className="text-indigo-300 font-semibold block mb-0.5">Recommendation:</span>
              <span>{item.recommendation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
