import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Briefcase, 
  Sparkles, 
  Check, 
  RefreshCw,
  FileCheck,
  FileText
} from 'lucide-react';

interface UploadAndJobInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  targetCompany?: string;
  setTargetCompany?: (company: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  selectedFile?: File | null;
  setSelectedFile?: (file: File | null) => void;
}

export const UploadAndJobInput: React.FC<UploadAndJobInputProps> = ({
  setResumeText,
  targetRole,
  setTargetRole,
  onAnalyze,
  isLoading,
  selectedFile,
  setSelectedFile
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(selectedFile ? selectedFile.name : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    if (setSelectedFile) {
      setSelectedFile(file);
    }
    setResumeText('');
  };

  const handleClear = () => {
    setResumeText('');
    setFileName(null);
    if (setSelectedFile) {
      setSelectedFile(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl mb-8">
      {/* Top Header */}
      <div className="pb-5 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Resume Analyzer & ATS Optimizer
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload your resume PDF to evaluate ATS parsability, impact metrics, action verbs, and recruiter impression.
        </p>
      </div>

      {/* Target Role Input Bar */}
      <div className="pt-5 pb-3">
        <div className="max-w-md">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            Target Role / Field <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Backend Engineer, AI Engineer, Full-Stack Developer"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Resume PDF Upload Area */}
      <div className="relative mt-2">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`min-h-[260px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3.5 border border-indigo-500/20">
            {fileName ? (
              <FileText className="w-7 h-7 text-rose-400" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {fileName ? fileName : 'Drop your resume PDF here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Supports native PDF extraction and deep ATS parsing directly through your Python FastAPI backend.
          </p>
          {fileName && (
            <div className="mt-3.5 flex items-center gap-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" /> {fileName} ready
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Trigger Bar */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {selectedFile 
              ? `PDF "${selectedFile.name}" selected. Click below to run AI ATS analysis.`
              : 'Upload your resume PDF above to evaluate ATS compliance and job match.'}
          </span>
        </div>

        <button
          id="run-analysis-button"
          onClick={onAnalyze}
          disabled={isLoading || !selectedFile}
          className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Resume PDF...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Run AI ATS Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
