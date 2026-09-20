import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  History, 
  TrendingUp, 
  ArrowRight,
  HelpCircle,
  ExternalLink,
  Target,
  Layers,
  Award
} from 'lucide-react';
import { AnalysisResult, FastApiConfig } from './types';
import { SAMPLE_PROFILES, INITIAL_ANALYSIS } from './mockData';
import { runClientSideAnalysis, analyzeWithFastApi, analyzeFileWithFastApi } from './services/analyzer';
import { Header } from './components/Header';
import { UploadAndJobInput } from './components/UploadAndJobInput';
import { AtsScoreCard } from './components/AtsScoreCard';
import { KeywordAnalysisCard } from './components/KeywordAnalysisCard';
import { BulletOptimizerCard } from './components/BulletOptimizerCard';
import { RecruiterImpressionCard } from './components/RecruiterImpressionCard';
import { SectionAuditCard } from './components/SectionAuditCard';
import { JobRoleRecommendationsCard } from './components/JobRoleRecommendationsCard';
import { FastApiModal } from './components/FastApiModal';
import { HistoryModal } from './components/HistoryModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(INITIAL_ANALYSIS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'keywords' | 'bullets' | 'recruiter' | 'sections' | 'roles'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Modals
  const [isFastApiModalOpen, setIsFastApiModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // FastAPI Config state
  const [fastApiConfig, setFastApiConfig] = useState<FastApiConfig>(() => {
    const saved = localStorage.getItem('resume_ai_fastapi_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          baseUrl: parsed.baseUrl || 'http://localhost:8000',
          endpointPath: parsed.endpointPath || '/api/analyze',
          useCustomBackend: true,
          apiKey: parsed.apiKey || undefined
        };
      } catch (e) {}
    }
    return {
      baseUrl: 'http://localhost:8000',
      endpointPath: '/api/analyze',
      useCustomBackend: true
    };
  });

  // Backend live connectivity status
  const [backendHealth, setBackendHealth] = useState<'untested' | 'connected' | 'error'>('untested');
  const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // History state
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('resume_ai_scan_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [INITIAL_ANALYSIS];
  });

  // Check backend connectivity on mount
  useEffect(() => {
    pingBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('resume_ai_fastapi_config', JSON.stringify(fastApiConfig));
  }, [fastApiConfig]);

  useEffect(() => {
    localStorage.setItem('resume_ai_scan_history', JSON.stringify(history));
  }, [history]);

  const showNotification = (type: 'success' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const pingBackend = async () => {
    setIsPinging(true);
    setBackendErrorMsg(null);
    try {
      const baseUrl = fastApiConfig.baseUrl.replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      }).catch(() => fetch(`${baseUrl}/`, { method: 'GET' }));

      if (res && res.ok) {
        setBackendHealth('connected');
        setBackendErrorMsg(null);
      } else {
        setBackendHealth('error');
        const msg = res ? `FastAPI responded with HTTP ${res.status}` : 'No response from server';
        setBackendErrorMsg(msg);
      }
    } catch (e: any) {
      setBackendHealth('error');
      const msg = e.message?.includes('Failed to fetch')
        ? 'Cannot reach localhost:8000. Start backend with: cd backend; uvicorn main:app --reload'
        : e.message;
      setBackendErrorMsg(msg);
    } finally {
      setIsPinging(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !selectedFile) {
      showNotification('warning', 'Please enter or upload a resume before analyzing.');
      return;
    }

    setIsLoading(true);

    try {
      let result: AnalysisResult;
      
      // If a PDF file is uploaded, we always use the FastAPI backend (PyMuPDF parser)
      if (selectedFile && selectedFile.name.toLowerCase().endsWith('.pdf')) {
        try {
          result = await analyzeFileWithFastApi(fastApiConfig, selectedFile, jobDescription, targetRole, targetCompany);
          if (result.rawResumeText) {
            setResumeText(result.rawResumeText);
          }
          setBackendHealth('connected');
          setBackendErrorMsg(null);
          showNotification('success', 'PDF parsed & analyzed successfully via Python FastAPI!');
        } catch (fastApiErr: any) {
          console.error('FastAPI PDF analysis failed:', fastApiErr);
          const isNetworkError = fastApiErr.message?.includes('Cannot connect') || fastApiErr.message?.includes('Failed to fetch');
          if (isNetworkError) {
            setBackendHealth('error');
            setBackendErrorMsg('Backend offline');
            showNotification(
              'warning',
              `FastAPI backend is offline. Please start it: cd backend; uvicorn main:app --reload --port 8000`
            );
          } else {
            // Backend IS online, but returned a specific error (e.g. 400 Bad Request, unscannable PDF)
            setBackendHealth('connected');
            showNotification('warning', fastApiErr.message || 'Error parsing document.');
          }
          setIsLoading(false);
          return;
        }
      } else if (fastApiConfig.useCustomBackend) {
        try {
          result = await analyzeWithFastApi(fastApiConfig, resumeText, jobDescription, targetRole, targetCompany);
          setBackendHealth('connected');
          setBackendErrorMsg(null);
          showNotification('success', 'Analyzed successfully via Python FastAPI backend!');
        } catch (fastApiErr: any) {
          console.warn('FastAPI backend request failed, falling back to client-side engine:', fastApiErr);
          setBackendHealth('error');
          setBackendErrorMsg(fastApiErr.message || 'Connection failed');
          result = runClientSideAnalysis(resumeText, jobDescription, targetRole, targetCompany);
          showNotification(
            'warning',
            `FastAPI unreachable (${fastApiErr.message || 'connection error'}). Showing client-side analysis.`
          );
        }
      } else {
        await new Promise((r) => setTimeout(r, 650));
        result = runClientSideAnalysis(resumeText, jobDescription, targetRole, targetCompany);
        showNotification('success', `ATS analysis complete! Overall score: ${result.overallScore}/100.`);
      }

      setAnalysisResult(result);
      setHistory((prev) => [result, ...prev.filter((p) => p.id !== result.id)].slice(0, 15));
    } catch (err: any) {
      showNotification('warning', err.message || 'Error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeywordToResume = (keyword: string) => {
    if (resumeText.includes(keyword)) {
      showNotification('info', `"${keyword}" is already in your resume text.`);
      return;
    }

    // Attempt to append to Technical Skills or at bottom of text
    let updated = resumeText;
    if (updated.includes('SKILLS') || updated.includes('Skills')) {
      updated = updated.replace(/(SKILLS[^\n]*\n|Skills[^\n]*\n)/i, `$1- Added Keyword: ${keyword}\n`);
    } else {
      updated = `${updated.trim()}\n\nADDITIONAL SKILLS:\n- ${keyword}`;
    }

    setResumeText(updated);
    showNotification('success', `Added "${keyword}" to resume. Re-run scan to see score update!`);
  };

  const handleSelectHistoricalScan = (scan: AnalysisResult) => {
    setAnalysisResult(scan);
    if (scan.rawResumeText) setResumeText(scan.rawResumeText);
    if (scan.rawJobDescription) setJobDescription(scan.rawJobDescription);
    setTargetRole(scan.targetRole);
    if (scan.targetCompany) setTargetCompany(scan.targetCompany);
    showNotification('info', `Loaded past scan from ${new Date(scan.timestamp).toLocaleDateString()}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('resume_ai_scan_history');
    showNotification('info', 'Scan history cleared.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        fastApiConfig={fastApiConfig}
        backendHealth={backendHealth}
        onOpenFastApiModal={() => setIsFastApiModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        hasResults={Boolean(analysisResult)}
      />

      {/* Floating Status Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/30'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/30'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Resume Input Form */}
        <UploadAndJobInput
          resumeText={resumeText}
          setResumeText={setResumeText}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          targetCompany={targetCompany}
          setTargetCompany={setTargetCompany}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />

        {/* Analysis Dashboard Section */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Navigation & Section View Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  ATS Audit & Optimization Dashboard
                </h2>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Last updated {new Date(analysisResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Modules
                  </button>
                  <button
                    onClick={() => setActiveTab('keywords')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'keywords' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Keywords & Gaps
                  </button>
                  <button
                    onClick={() => setActiveTab('bullets')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'bullets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    STAR Bullets
                  </button>
                  <button
                    onClick={() => setActiveTab('recruiter')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'recruiter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    6s Impression
                  </button>
                  <button
                    onClick={() => setActiveTab('sections')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'sections' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Section Audits
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeTab === 'roles' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Role & Skills
                  </button>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  title="View scan history"
                >
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>History ({history.length})</span>
                </button>
              </div>
            </div>

            {/* Core ATS Score Gauge Card (Always visible on top of dashboard) */}
            <AtsScoreCard result={analysisResult} />

            {/* Tabbed / Grid Modular Layout */}
            <div className="space-y-6">
              {(activeTab === 'all' || activeTab === 'keywords') && (
                <KeywordAnalysisCard 
                  result={analysisResult} 
                  onAddKeywordToResume={handleAddKeywordToResume}
                />
              )}

              {(activeTab === 'all' || activeTab === 'bullets') && (
                <BulletOptimizerCard 
                  bulletPoints={analysisResult.bulletPoints}
                />
              )}

              {(activeTab === 'all' || activeTab === 'recruiter') && (
                <RecruiterImpressionCard
                  impression={analysisResult.recruiterImpression}
                  candidateName={analysisResult.candidateName}
                />
              )}

              {(activeTab === 'all' || activeTab === 'sections') && (
                <SectionAuditCard audits={analysisResult.sectionAudits} />
              )}

              {(activeTab === 'all' || activeTab === 'roles') && (
                <JobRoleRecommendationsCard recommendations={analysisResult.recommendations} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>AI Resume Analyzer • Tailored for Python, FastAPI, and Modern Tech Stacks</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFastApiModalOpen(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              FastAPI & MongoDB Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Previous Audits
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FastApiModal
        isOpen={isFastApiModalOpen}
        onClose={() => setIsFastApiModalOpen(false)}
        config={fastApiConfig}
        onSaveConfig={(newConfig) => {
          setFastApiConfig(newConfig);
          showNotification(
            'success',
            newConfig.useCustomBackend 
              ? 'FastAPI backend mode activated!' 
              : 'Switched to smart client-side analysis engine.'
          );
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectScan={handleSelectHistoricalScan}
        onClearHistory={handleClearHistory}
        currentScanId={analysisResult?.id}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={analysisResult}
      />
    </div>
  );
}
