import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  Share2 
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownSummary = () => {
    return `# ATS Resume Analysis Report
**Target Role:** ${result.targetRole}
**Target Company:** ${result.targetCompany || 'N/A'}
**Overall ATS Score:** ${result.overallScore}/100 (Grade: ${result.grade})
**Date:** ${new Date(result.timestamp).toLocaleDateString()}

---
## 📊 Score Breakdown
- ATS Match Rate: ${result.metrics.atsScore}%
- Keyword Match: ${result.metrics.keywordMatch}%
- Impact & Quantification: ${result.metrics.impactQuantification}%
- Readability & Parseability: ${result.metrics.readabilityScore}%

---
## 🎯 Verdict
${result.verdict}

---
## 🔍 Top Matched Keywords (${result.keywords.matched.length})
${result.keywords.matched.map(k => `- ${k.name} (Found ${k.frequency || 1}x)`).join('\n')}

---
## ⚠️ High-Priority Missing Keywords (${result.keywords.missing.length})
${result.keywords.missing.map(k => `- ${k.name} (${k.importance} priority)`).join('\n')}

---
## 💡 Recommended Bullet Point Optimizations
${result.bulletPoints.map((bp, i) => `### Bullet #${i + 1}
- **Original:** "${bp.original}"
- **ATS Optimized:** "${bp.improved}"
- **Improvement:** ${bp.critique}
`).join('\n')}

---
## ⏱️ 6-Second Recruiter Impression
${result.recruiterImpression.firstGlanceSummary}

### Key Strengths:
${result.recruiterImpression.topStrengths.map(s => `- ${s}`).join('\n')}

### Critical Red Flags:
${result.recruiterImpression.criticalRedFlags.map(f => `- ${f}`).join('\n')}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdownSummary()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `ATS-Resume-Report-${result.targetRole.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:w-full print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export ATS Audit Report</h2>
              <p className="text-xs text-slate-400">Save your score breakdown and bullet rewrites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-300 bg-slate-950/60 leading-relaxed max-h-[60vh]">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-sans space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">AI ATS Resume Analysis</h3>
                <p className="text-xs text-slate-400">Prepared for {result.candidateName}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-indigo-400">{result.overallScore} / 100</span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Grade {result.grade}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Executive Verdict:
              </span>
              <p className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {result.verdict}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Keywords Matched:</span>
                <span className="font-semibold text-emerald-400">{result.keywords.matched.length} terms ({result.keywords.matchPercentage}%)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Missing Keywords:</span>
                <span className="font-semibold text-amber-400">{result.keywords.missing.length} high-priority terms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Markdown' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .MD
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
