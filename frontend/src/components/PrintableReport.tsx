import React from 'react';
import { AnalysisResult } from '../types';
import { Award, CheckCircle2, Target, FileText } from 'lucide-react';

interface PrintableReportProps {
  result: AnalysisResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ result }) => {
  const formattedDate = new Date(result.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Collect all unique skills and keywords that the user has in their resume
  const candidateSkills: { name: string; category?: string; frequency?: number }[] = [];
  const seen = new Set<string>();

  // 1. From verified matched keywords
  if (result.keywords && result.keywords.matched) {
    result.keywords.matched.forEach((k) => {
      const lower = k.name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        candidateSkills.push({
          name: k.name,
          category: k.category,
          frequency: k.frequency || 1
        });
      }
    });
  }

  // 2. Scan rawResumeText for any additional standard skills & keywords present in user's resume
  if (result.rawResumeText) {
    const KNOWN_SKILLS = [
      'C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
      'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'FastAPI', 'Flask', 'Django',
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
      'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux',
      'REST APIs', 'GraphQL', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow',
      'Data Structures', 'Algorithms', 'OOP', 'CI/CD', 'Agile', 'Scrum'
    ];

    const resumeLower = result.rawResumeText.toLowerCase();
    KNOWN_SKILLS.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (!seen.has(lower)) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'i');
        if (regex.test(resumeLower)) {
          seen.add(lower);
          const matches = result.rawResumeText.match(new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'gi'));
          candidateSkills.push({
            name: skill,
            category: 'technical',
            frequency: matches ? matches.length : 1
          });
        }
      }
    });
  }

  return (
    <div className="printable-page-container bg-white text-slate-900 p-8 w-full max-w-[210mm] mx-auto min-h-screen box-border font-sans antialiased text-xs leading-relaxed">
      {/* Document Header (Matches Screenshot) */}
      <div className="border-b-2 border-indigo-600 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
              RESUMEAI &bull; ATS EXECUTIVE AUDIT REPORT
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Prepared for: <span className="text-slate-900 font-semibold">{result.candidateName || 'Candidate'}</span>
              {result.targetCompany ? ` \u2022 Target: ${result.targetRole} (${result.targetCompany})` : ` \u2022 Target: ${result.targetRole}`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono text-slate-600">
            ID: {result.id ? result.id.slice(0, 8).toUpperCase() : 'SCAN-380'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Top Section: Scorecard & Core 4 Pillars (Matches Screenshot) */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {/* Overall ATS Score Block */}
        <div className="col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OVERALL ATS SCORE</span>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-indigo-600 tracking-tight">{result.overallScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
            <Award className="w-3 h-3" />
            Grade {result.grade} &bull; {result.overallScore >= 80 ? 'Interview Ready' : result.overallScore >= 65 ? 'Competitive' : 'Needs Optimization'}
          </div>
        </div>

        {/* 4 Key Pillars */}
        <div className="col-span-8 grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>ATS Compatibility</span>
              <span className="text-indigo-600 font-bold">{result.metrics.atsScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(result.metrics.atsScore, 100)}%` }} />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>Keyword Match</span>
              <span className="text-emerald-600 font-bold">{result.metrics.keywordMatch}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(result.metrics.keywordMatch, 100)}%` }} />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>Impact &amp; Metrics</span>
              <span className="text-cyan-600 font-bold">{result.metrics.impactQuantification}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(result.metrics.impactQuantification, 100)}%` }} />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>Readability &amp; Flow</span>
              <span className="text-violet-600 font-bold">{result.metrics.readabilityScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${Math.min(result.metrics.readabilityScore, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Executive ATS Verdict & Recruiter Impression (Matches Screenshot) */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 mb-4">
        <h2 className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-600" />
          EXECUTIVE ATS VERDICT &amp; RECRUITER IMPRESSION
        </h2>
        <p className="text-[11px] text-slate-700 leading-snug">
          {result.verdict}
        </p>
      </div>

      {/* All Skills and Keywords User Has */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white mb-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                CANDIDATE SKILLS &amp; KEYWORDS ({candidateSkills.length})
              </h2>
              <p className="text-[10px] text-slate-500">
                All verified technical skills, frameworks, tools, and domain keywords detected in candidate's resume
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {result.keywords.matchPercentage || 100}% ATS Keyword Match
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {candidateSkills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{skill.name}</span>
              {skill.frequency && skill.frequency > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/80 text-slate-600 rounded font-mono font-semibold">
                  {skill.frequency}x
                </span>
              )}
            </span>
          ))}
          {candidateSkills.length === 0 && (
            <p className="text-[11px] text-slate-400 italic py-2">
              No specific skills or keywords were detected in the resume text.
            </p>
          )}
        </div>
      </div>

      {/* Document Footer (Single Page Note) */}
      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400">
        <span>ResumeAI ATS Evaluation &bull; Prepared for {result.candidateName || 'Candidate'}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};
