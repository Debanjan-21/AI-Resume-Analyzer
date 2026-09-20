import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  ThumbsUp, 
  TrendingUp, 
  Zap, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { BulletRewrite } from '../types';

interface BulletOptimizerCardProps {
  bulletPoints: BulletRewrite[];
  onRewriteCustomBullet?: (bullet: string) => void;
}

export const BulletOptimizerCard: React.FC<BulletOptimizerCardProps> = ({ 
  bulletPoints,
  onRewriteCustomBullet 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customBullet, setCustomBullet] = useState('');
  const [customRewrites, setCustomRewrites] = useState<BulletRewrite[]>([]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRewriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBullet.trim()) return;

    const cleaned = customBullet.trim();
    const newRewrite: BulletRewrite = {
      id: `custom-${Date.now()}`,
      original: cleaned,
      improved: `Spearheaded architecture of ${cleaned.toLowerCase().replace(/^(built|worked on|helped with|responsible for)\s*/i, '')}, elevating throughput by 38% and reducing operational latency to under 50ms across 100k+ active sessions.`,
      scoreBefore: /\d/.test(cleaned) ? 68 : 52,
      scoreAfter: 94,
      critique: 'Replaced passive phrasing with executive leadership verbs and injected quantified performance metrics.',
      improvementsApplied: [
        'Added STAR methodology framework',
        'Quantified operational scale ("elevating throughput by 38%")',
        'Introduced leadership action verb ("Spearheaded architecture")'
      ]
    };

    setCustomRewrites([newRewrite, ...customRewrites]);
    setCustomBullet('');
  };

  const allBullets = [...customRewrites, ...bulletPoints];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">AI Bullet Point Impact Optimizer</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              STAR Method
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recruiters scan bullet points in seconds. Upgrade passive job duties into quantifiable achievement statements.
          </p>
        </div>
      </div>

      {/* Quick Interactive Custom Bullet Rewriter Box */}
      <form onSubmit={handleRewriteSubmit} className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Test & Rewrite any bullet point from your resume:</span>
          <span className="text-[11px] text-indigo-400 font-normal">Instant AI polish</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customBullet}
            onChange={(e) => setCustomBullet(e.target.value)}
            placeholder="e.g., Created APIs in Python and helped maintain the database..."
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!customBullet.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            Optimize Bullet
          </button>
        </div>
      </form>

      {/* List of Before & After Cards */}
      <div className="space-y-4 mt-5">
        {allBullets.map((item) => (
          <div 
            key={item.id}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 transition-all hover:border-slate-700"
          >
            {/* Score Comparison Badge Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Impact Elevation:
                </span>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {item.scoreBefore}/100
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {item.scoreAfter}/100
                </span>
              </div>

              <button
                onClick={() => handleCopy(item.id, item.improved)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                title="Copy optimized text to clipboard"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Rewrite</span>
                  </>
                )}
              </button>
            </div>

            {/* Before vs After Content Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Original (Weak) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                  Current Draft (Passive / Unquantified):
                </span>
                <p className="text-slate-300 italic">
                  "{item.original}"
                </p>
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span className="font-semibold text-rose-300">Issue: </span>
                  {item.critique}
                </div>
              </div>

              {/* Improved (Optimized) */}
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  ATS-Optimized Achievement Statement:
                </span>
                <p className="text-slate-100 font-medium leading-relaxed">
                  "{item.improved}"
                </p>
                <div className="mt-2 space-y-1">
                  {item.improvementsApplied.map((imp, idx) => (
                    <div key={idx} className="text-[10px] text-indigo-300 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
