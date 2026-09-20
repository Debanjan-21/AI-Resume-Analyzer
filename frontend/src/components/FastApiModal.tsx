import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Check, 
  Copy, 
  ExternalLink, 
  Code2, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Play 
} from 'lucide-react';
import { FastApiConfig } from '../types';

interface FastApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FastApiConfig;
  onSaveConfig: (newConfig: FastApiConfig) => void;
}

export const FastApiModal: React.FC<FastApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [endpointPath, setEndpointPath] = useState(config.endpointPath);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [useCustomBackend, setUseCustomBackend] = useState(config.useCustomBackend);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'schema'>('config');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      baseUrl,
      endpointPath,
      apiKey: apiKey.trim() ? apiKey.trim() : undefined,
      useCustomBackend
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging FastAPI endpoint...');
    try {
      const fullUrl = `${baseUrl.replace(/\/$/, '')}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: 'Sample test resume with Python, FastAPI and MongoDB skills.',
          job_description: 'Looking for a Python FastAPI developer with MongoDB experience.',
          target_role: 'Backend Engineer'
        })
      });
      if (res.ok) {
        setTestStatus('success');
        setTestMessage(`Connection successful! HTTP ${res.status}`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(
        err.message?.includes('Failed to fetch')
          ? 'Network error or CORS blocked. Ensure CORS middleware is enabled on your FastAPI server (see Python code tab).'
          : `Failed: ${err.message || 'Unknown error'}`
      );
    }
  };

  const pythonSnippet = `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import motor.motor_asyncio # MongoDB async driver

app = FastAPI(title="AI Resume Analyzer API")

# 1. Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
db = client.resume_analyzer_db

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = ""

@app.post("/api/analyze")
async def analyze_resume(payload: ResumeAnalysisRequest):
    # Your AI analyzer logic (e.g. LLM, spaCy, or embeddings)
    # Store result in MongoDB
    result_doc = {
        "candidate_name": "Applicant",
        "target_role": payload.target_role,
        "overall_score": 88,
        "grade": "A",
        "verdict": "Strong ATS candidate match.",
        "metrics": {
            "ats_score": 88,
            "keyword_match": 84,
            "impact_quantification": 90,
            "readability_score": 92
        }
    }
    await db.scans.insert_one(result_doc)
    return result_doc`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">FastAPI & MongoDB Integration</h2>
              <p className="text-xs text-slate-400">Connect your custom Python backend or use client simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            FastAPI Code & CORS Snippet
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MongoDB / JSON Schema
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="font-semibold text-slate-200 text-sm block">
                    Use Custom Python FastAPI Backend
                  </span>
                  <span className="text-xs text-slate-400">
                    When disabled, the app uses the built-in intelligent client-side analyzer engine.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomBackend}
                    onChange={(e) => setUseCustomBackend(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Endpoint configuration */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    FastAPI Base URL
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:8000 or https://your-api.railway.app"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Analysis Endpoint Path
                  </label>
                  <input
                    type="text"
                    value={endpointPath}
                    onChange={(e) => setEndpointPath(e.target.value)}
                    placeholder="/api/analyze"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    API Key / Bearer Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Optional Authorization header token"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  {testStatus === 'testing' ? 'Testing endpoint...' : 'Ping & Test Endpoint'}
                </button>

                {testMessage && (
                  <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${
                    testStatus === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                  }`}>
                    {testStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Copy this sample to your FastAPI <code className="text-indigo-300">main.py</code>:</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSnippet ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                {pythonSnippet}
              </pre>
              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-indigo-200">
                <span className="font-semibold">Note on CORS:</span> When developing locally, ensure <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-200 font-mono">CORSMiddleware</code> is added to FastAPI so the browser allows requests from this web dashboard.
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                The frontend sends this payload in the POST body:
              </p>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300">
{`{
  "resume_text": "string (full extracted text of resume)",
  "target_role": "string (optional, e.g. Senior Backend Engineer)"
}`}
              </pre>

              <p className="text-slate-300 pt-2">
                Recommended MongoDB Document schema for storing results:
              </p>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300">
{`{
  "_id": ObjectId("..."),
  "created_at": ISODate("2026-09-19T..."),
  "candidate_name": "Alexander Wright",
  "target_role": "Senior Backend Engineer",
  "overall_score": 88,
  "grade": "A",
  "keywords_matched": ["Python", "FastAPI", "MongoDB"],
  "keywords_missing": ["Kubernetes", "Kafka"],
  "metrics": {
    "ats_score": 88,
    "keyword_match": 84,
    "impact_quantification": 90
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
