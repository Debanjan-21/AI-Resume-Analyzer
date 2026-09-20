import React from 'react';
import { 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface RecruiterImpressionCardProps {
  impression: AnalysisResult['recruiterImpression'];
  candidateName: string;
}

export const RecruiterImpressionCard: React.FC<RecruiterImpressionCardProps> = ({ 
  impression,
  candidateName
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">6-Second Recruiter Impression</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{impression.estimatedReadTimeSeconds}s Scan Simulation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hiring managers spend an average of 6 to 8 seconds on an initial resume screen. Here is what stands out first.
          </p>
        </div>
      </div>

      {/* Primary Glaze Narrative */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/30 border border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          First-Pass Snapshot for {candidateName}
        </span>
        <p className="text-xs text-slate-200 leading-relaxed">
          "{impression.firstGlanceSummary}"
        </p>
      </div>

      {/* Strengths vs Red Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Top Strengths */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/30">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Immediate Strengths (Keep These)
          </div>
          <ul className="space-y-2.5">
            {impression.topStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Red Flags */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-900/30">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-3 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Potential Friction Points (Fix Before Applying)
          </div>
          <ul className="space-y-2.5">
            {impression.criticalRedFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
