import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  Compass,
  Award
} from 'lucide-react';
import { RecommendationsBlock } from '../types';

interface JobRoleRecommendationsCardProps {
  recommendations?: RecommendationsBlock;
}

export const JobRoleRecommendationsCard: React.FC<JobRoleRecommendationsCardProps> = ({ 
  recommendations 
}) => {
  if (!recommendations || (!recommendations.suggestedRoles?.length && !recommendations.recommendedSkills?.length)) {
    return null;
  }

  const { suggestedRoles = [], recommendedSkills = [] } = recommendations;

  const getImportanceBadge = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Zap className="w-3 h-3 text-amber-400" />
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            Strategic
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Helpful
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Job Role & Skill Recommendations</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Career Compass
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized career trajectories and highest-ROI technical skills to learn, evaluated against your projects, experience, and verified competencies.
          </p>
        </div>
      </div>

      {/* 1. Suggested Job Roles */}
      {suggestedRoles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Matching Job Roles ({suggestedRoles.length})
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              Ranked by profile synergy & market demand
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedRoles.map((role, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {role.title}
                      </h5>
                    </div>

                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                      role.matchScore >= 90
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    }`}>
                      {role.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3 pl-9">
                    {role.reason}
                  </p>
                </div>

                {role.suitableSkills && role.suitableSkills.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 pl-9">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Matching Profile Strengths:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.suitableSkills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Recommended Skills to Learn */}
      {recommendedSkills.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Recommended Skills to Learn ({recommendedSkills.length})
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              High-leverage competencies to maximize career mobility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedSkills.map((skillItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-0.5">
                        {skillItem.category}
                      </span>
                      <h5 className="text-sm font-bold text-white">
                        {skillItem.skill}
                      </h5>
                    </div>
                    {getImportanceBadge(skillItem.importance)}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5 mb-3">
                    {skillItem.reason}
                  </p>
                </div>

                {skillItem.forRoles && skillItem.forRoles.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                      Unlocks Target Roles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skillItem.forRoles.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
