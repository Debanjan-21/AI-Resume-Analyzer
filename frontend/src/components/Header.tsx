import React from 'react';
import { 
  FileText, 
  Printer 
} from 'lucide-react';
import { FastApiConfig } from '../types';

interface HeaderProps {
  fastApiConfig?: FastApiConfig;
  backendHealth?: 'untested' | 'connected' | 'error';
  onOpenFastApiModal?: () => void;
  onExport: () => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExport,
  hasResults
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">ResumeAI</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ATS Analyzer
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Job Seeker Intelligence & Resume Optimizer
            </p>
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-2.5">
          {hasResults && (
            <button
              id="export-report-button"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
