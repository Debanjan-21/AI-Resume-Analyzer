import React from 'react';
import { 
  Award, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  FileCheck, 
  AlertTriangle 
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AtsScoreCardProps {
  result: AnalysisResult;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ result }) => {
  const { overallScore, grade, verdict, metrics, targetRole, targetCompany } = result;

  // Grade color scheme
  const getGradeBadge = (g: string) => {
    switch (g) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 70) return 'text-indigo-400 stroke-indigo-500';
    if (score >= 60) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Circular Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`${getScoreColor(overallScore)} transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center Value */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {overallScore}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getGradeBadge(grade)}`}>
              Grade {grade}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {overallScore >= 80 ? 'Interview Ready' : overallScore >= 65 ? 'Competitive Match' : 'Optimization Required'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated via ATS weighted algorithms
          </p>
        </div>

        {/* Right: Detailed Summary & Dimension Bars */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  ATS Match Assessment: <span className="text-indigo-300">{targetRole}</span>
                </h3>
              </div>
              {targetCompany && (
                <span className="text-xs text-slate-400 font-medium">
                  Target: {targetCompany}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800 mb-4">
              {verdict}
            </p>
          </div>

          {/* 4 Dimensional Metric Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Keyword Match */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Keyword Match Rate
                </span>
                <span className="font-bold text-white">{metrics.keywordMatch}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                  style={{ width: `${metrics.keywordMatch}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Hard & soft skills overlap</span>
            </div>

            {/* Impact Quantification */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Impact & Metrics
                </span>
                <span className="font-bold text-white">{metrics.impactQuantification}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${metrics.impactQuantification}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Numbers, %, & business ROI</span>
            </div>

            {/* Readability & Layout */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  ATS Parseability
                </span>
                <span className="font-bold text-white">{metrics.readabilityScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-700" 
                  style={{ width: `${metrics.readabilityScore}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Format, fonts & clean headers</span>
            </div>

            {/* Brevity & Density */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Content Brevity
                </span>
                <span className="font-bold text-white">{metrics.brevityScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                  style={{ width: `${metrics.brevityScore}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Optimal word density balance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
