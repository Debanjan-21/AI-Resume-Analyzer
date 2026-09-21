import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  TrendingUp,
  Cpu,
  Target
} from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser, loginDemoUser } from '../services/authService';

interface AuthGatewayProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-indigo-400' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-rose-500' };
    }
  }, [password]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Sign up specific checks
    if (mode === 'signup') {
      if (!name.trim()) {
        errors.name = 'Full name is required';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { user } = await loginUser(email.trim(), password, rememberMe);
        onAuthSuccess(user);
      } else {
        const { user } = await registerUser(name.trim(), email.trim(), password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { user } = loginDemoUser();
      setIsLoading(false);
      onAuthSuccess(user);
    }, 450);
  };

  const handleForgotPassword = () => {
    showToast('A secure password reset link has been dispatched to your email address.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glow Mesh & Radial Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-950/90 text-indigo-200 border border-indigo-500/30 shadow-2xl backdrop-blur-md text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40 overflow-hidden">
        
        {/* Left Column: Animated AI Resume Visual Showcase */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-indigo-950/30 relative overflow-hidden">
          
          {/* Brand header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">ResumeAI</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400">Next-Gen ATS Resume Intelligence</p>
              </div>
            </div>
          </div>

          {/* Central Animated Hologram Showcase */}
          <div className="my-10 relative flex justify-center items-center">
            {/* Holographic Resume Canvas */}
            <div className="w-64 h-80 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950/90 p-5 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl relative overflow-hidden animate-float-slow">
              
              {/* Vertical Laser Scanline */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scanline z-20" />
              
              {/* Abstract Resume Representation */}
              <div className="space-y-3.5 opacity-80">
                {/* Header line */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                    JD
                  </div>
                  <div className="space-y-1">
                    <div className="w-24 h-2.5 bg-indigo-400/40 rounded-full" />
                    <div className="w-16 h-2 bg-slate-600 rounded-full" />
                  </div>
                </div>

                {/* Simulated Experience Lines */}
                <div className="space-y-2">
                  <div className="w-20 h-2 bg-slate-500/50 rounded-full" />
                  <div className="w-full h-1.5 bg-slate-700/60 rounded-full" />
                  <div className="w-5/6 h-1.5 bg-slate-700/60 rounded-full" />
                  <div className="w-4/5 h-1.5 bg-slate-700/60 rounded-full" />
                </div>

                {/* Simulated Skills Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Python
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    FastAPI
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Docker
                  </span>
                </div>
              </div>

              {/* Holographic Glowing Badges floating */}
              <div className="absolute -bottom-1 -right-1 bg-indigo-900/90 border border-indigo-400/40 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-1.5 text-[10px] font-bold text-indigo-200">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>98% ATS Pass</span>
              </div>
            </div>

            {/* Orbiting Satellite Badges */}
            <div className="absolute -top-3 -left-4 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>STAR Rewriter</span>
            </div>

            <div className="absolute -bottom-4 -left-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recruiter Audit</span>
            </div>
          </div>

          {/* Bottom Social Proof / Feature Highlights */}
          <div className="relative z-10 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-base font-extrabold text-white">10,000+</div>
              <div className="text-[11px] text-slate-400">Resumes Analyzed</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-base font-extrabold text-white">&lt; 6s</div>
              <div className="text-[11px] text-slate-400">Recruiter Impression</div>
            </div>
          </div>
        </div>

        {/* Right Column: Sliding Glassmorphic Sign In / Sign Up Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center relative">
          
          {/* Sliding Tab Switcher */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="relative bg-slate-950/70 p-1.5 rounded-2xl border border-white/10 flex">
              {/* Active pill background slider */}
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-300 ease-out ${
                  mode === 'signin' ? 'left-1.5' : 'left-[calc(50%+3px)]'
                }`}
              />
              
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setFormError(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2.5 text-center text-xs font-bold tracking-wide relative z-10 transition-colors cursor-pointer ${
                  mode === 'signin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setFormError(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2.5 text-center text-xs font-bold tracking-wide relative z-10 transition-colors cursor-pointer ${
                  mode === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="w-full max-w-md mx-auto mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Get Started with AI'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {mode === 'signin' 
                ? 'Sign in to access your resume scans and role recommendations.'
                : 'Supercharge your job hunt with instantaneous ATS diagnostics.'
              }
            </p>
          </div>

          {/* Alert / Error banner */}
          {formError && (
            <div className="w-full max-w-md mx-auto mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{formError}</span>
                {formError.includes('Create Account') && mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setFormError(null);
                    }}
                    className="mt-1.5 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Click here to switch to Create Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
            
            {/* Full Name field (Sign Up only) */}
            {mode === 'signup' && (
              <div className="relative">
                <div className="relative rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                    }}
                    placeholder=" "
                    className="peer w-full pl-10 pr-4 pt-5 pb-2 text-sm text-white placeholder-transparent bg-transparent border-0 focus:outline-none"
                  />
                  <label
                    htmlFor="fullName"
                    className="absolute text-xs text-slate-400 left-10 top-2 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400 pointer-events-none"
                  >
                    Full Name
                  </label>
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div className="relative">
              <div className="relative rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder=" "
                  className="peer w-full pl-10 pr-4 pt-5 pb-2 text-sm text-white placeholder-transparent bg-transparent border-0 focus:outline-none"
                />
                <label
                  htmlFor="email"
                  className="absolute text-xs text-slate-400 left-10 top-2 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400 pointer-events-none"
                >
                  Email Address
                </label>
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder=" "
                  className="peer w-full pl-10 pr-10 pt-5 pb-2 text-sm text-white placeholder-transparent bg-transparent border-0 focus:outline-none"
                />
                <label
                  htmlFor="password"
                  className="absolute text-xs text-slate-400 left-10 top-2 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400 pointer-events-none"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}

              {/* Password Strength Meter (Sign Up Mode) */}
              {mode === 'signup' && password && (
                <div className="mt-2.5 px-1">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${
                      passwordStrength.score >= 3 ? 'text-emerald-400' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div className="relative">
                <div className="relative rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    placeholder=" "
                    className="peer w-full pl-10 pr-10 pt-5 pb-2 text-sm text-white placeholder-transparent bg-transparent border-0 focus:outline-none"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute text-xs text-slate-400 left-10 top-2 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400 pointer-events-none"
                  >
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password (Sign In mode) */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Your Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo 1-Click Access Divider & Button */}
          <div className="w-full max-w-md mx-auto mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Instant Guest Evaluation
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm hover:border-indigo-500/30"
            >
              <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Explore Dashboard via 1-Click Demo</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer copyright and attribution */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-3">
        <span>Protected by 256-bit Encryption</span>
        <span>•</span>
        <span>AI Resume Analyzer</span>
      </div>
    </div>
  );
};
