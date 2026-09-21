import React, { useState } from 'react';
import { 
  CheckCircle, 
  Tag, 
  Check, 
  Info 
} from 'lucide-react';
import { AnalysisResult, KeywordMatch } from '../types';

interface KeywordAnalysisCardProps {
  result: AnalysisResult;
  onAddKeywordToResume?: (keyword: string) => void;
}

export const KeywordAnalysisCard: React.FC<KeywordAnalysisCardProps> = ({ 
  result,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'tools' | 'soft'>('all');

  const { matched, matchPercentage } = result.keywords;

  const filterList = (list: KeywordMatch[]) => {
    if (activeCategory === 'all') return list;
    return list.filter(k => k.category === activeCategory);
  };

  const filteredMatched = filterList(matched);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Keyword & Skill Analysis</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
              {matchPercentage}% Overlap
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ATS parsers and recruiters index these industry technical terms and domain skills.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'technical', 'tools', 'soft'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Skills' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5">
        {/* Matched Keywords (Strengths) */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-emerald-900/30 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Successfully Matched ({filteredMatched.length})
            </span>
            <span className="text-[11px] text-emerald-400/80 font-medium bg-emerald-400/10 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            These essential terms are present in your resume and verified by the ATS parser:
          </p>

          <div className="flex flex-wrap gap-2 flex-1 content-start">
            {filteredMatched.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No matched keywords found in this filter.</p>
            ) : (
              filteredMatched.map((kw) => (
                <span
                  key={kw.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/20 text-emerald-200 text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium">{kw.name}</span>
                  {kw.frequency && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      {kw.frequency}x
                    </span>
                  )}
                </span>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Keywords matched in Work Experience carry 2x weight over those in the Skills list.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
