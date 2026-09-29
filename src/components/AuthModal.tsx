import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';
import { 
  X, 
  User, 
  Tv, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff,
  Video,
  Layers,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialRole = 'user' 
}) => {
  const { 
    currentRole, 
    currentUser, 
    loginAsUser, 
    loginAsCreator, 
    loginAsAdmin, 
    signInWithGoogle,
    isGoogleLoading 
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // User Form
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  // Creator Form
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [creatorChannel, setCreatorChannel] = useState('');
  const [creatorPassword, setCreatorPassword] = useState('');
  const [creatorPlatform, setCreatorPlatform] = useState<'youtube' | 'instagram' | 'facebook'>('youtube');
  
  // Admin Form
  const [adminEmail, setAdminEmail] = useState('admin@tubeearn.internal');
  const [adminSecurityKey, setAdminSecurityKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  
  // Status states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab with initialRole if prop changes
  React.useEffect(() => {
    setActiveTab(initialRole);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  // Handle User Login
  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = userEmail.trim() || 'aarav.sharma@example.com';
      const name = userName.trim() || (authMode === 'signup' ? 'New Earner' : 'Aarav Sharma');
      
      const res = await loginAsUser({ email, name, isNew: authMode === 'signup' });
      if (res.success) {
        setSuccessMessage(res.message);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick User Demo Login
  const handleQuickUserDemo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await loginAsUser({
      email: 'aarav.sharma@example.com',
      name: 'Aarav Sharma',
      isNew: false
    });
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => onClose(), 1000);
    }
  };

  // Handle Creator Login
  const handleCreatorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = creatorEmail.trim() || 'priya.patel@creators.com';
      const name = creatorName.trim() || (authMode === 'signup' ? 'New Studio Creator' : 'Priya Patel (Creator)');
      const channel = creatorChannel.trim() || '@TechVibeStudio';

      const res = await loginAsCreator({
        email,
        name,
        channelName: channel,
        handle: channel.startsWith('@') ? channel : `@${channel}`,
        isNew: authMode === 'signup'
      });

      if (res.success) {
        setSuccessMessage(res.message);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Creator authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Creator Demo Login
  const handleQuickCreatorDemo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await loginAsCreator({
      email: 'priya.patel@creators.com',
      name: 'Priya Patel (Creator)',
      channelName: 'Priya Studio Reviews',
      handle: '@priyastudios',
      isNew: false
    });
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => onClose(), 1000);
    }
  };

  // Handle Admin Login (Passkey Gated)
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginAsAdmin(adminSecurityKey);
      if (res.success) {
        setSuccessMessage(res.message);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Admin Demo
  const handleQuickAdminDemo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await loginAsAdmin('ADMIN2026');
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => onClose(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header with 3 Distinct Role Tabs */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Tube<span className="text-red-500">Earn</span> Authentication
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Role Portals
                </span>
              </h2>
              <p className="text-xs text-slate-400">Select your dedicated portal to access your account</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Three Role Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {/* User Tab */}
            <button
              onClick={() => {
                setActiveTab('user');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'user'
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>User / Earner</span>
            </button>

            {/* Creator Tab */}
            <button
              onClick={() => {
                setActiveTab('creator');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'creator'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Tv className="w-4 h-4 shrink-0" />
              <span>Creator Studio</span>
            </button>

            {/* Admin Tab */}
            <button
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Admin Hub</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: USER / EARNER LOGIN */}
          {activeTab === 'user' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-950 border border-red-500/20 space-y-1">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Earner Rewards Portal</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Earn ₹1.00 to ₹2.50 by reviewing videos and completing audience surveys. Guaranteed payouts with a strict ₹299 minimum threshold directly to your UPI ID or Bank.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {authMode === 'signin' ? 'Sign In as User' : 'Create Earner Account'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  {authMode === 'signin' ? 'Need an account? Register' : 'Already have account? Sign In'}
                </button>
              </div>

              <form onSubmit={handleUserAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">User Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="e.g. aarav.sharma@example.com"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>{authMode === 'signin' ? 'Sign In as User' : 'Register Earner Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Shortcut */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={handleQuickUserDemo}
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>⚡ One-Click Earner Demo (Aarav Sharma - ₹342 Bal)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">KYC Verified</span>
                </button>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading}
                  className="w-full py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google as Earner</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATOR STUDIO LOGIN */}
          {activeTab === 'creator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-950 border border-rose-500/20 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <Tv className="w-4 h-4" />
                  <span>Creator Campaign Management Studio</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deposit funds to escrow, design audience research tasks, and engage at least 1,000 verified viewers across YouTube, Instagram, and Facebook.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {authMode === 'signin' ? 'Creator Studio Sign In' : 'Register New Studio'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-rose-400 hover:text-rose-300 font-semibold"
                >
                  {authMode === 'signin' ? 'New creator? Register Studio' : 'Existing creator? Sign In'}
                </button>
              </div>

              <form onSubmit={handleCreatorAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Creator / Studio Name</label>
                  <input
                    type="text"
                    placeholder="e.g. TechVibe India / Priya Studios"
                    value={creatorName}
                    onChange={e => setCreatorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Channel or Social Handle</label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. @TechVibeIndia"
                      value={creatorChannel}
                      onChange={e => setCreatorChannel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Creator Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="e.g. priya.patel@creators.com"
                      value={creatorEmail}
                      onChange={e => setCreatorEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={creatorPassword}
                    onChange={e => setCreatorPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Tv className="w-4 h-4" />
                  <span>{authMode === 'signin' ? 'Sign In to Creator Studio' : 'Create Studio Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Shortcut */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={handleQuickCreatorDemo}
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>⚡ One-Click Creator Demo (Priya Patel - ₹12,450 Bal)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">1,000+ Escrow Active</span>
                </button>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading}
                  className="w-full py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google as Creator</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MASTER ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 to-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>RESTRICTED OPERATIONS PORTAL</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Security Level 3
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Access requires verified administrative credentials. Provides authority over ledger adjustments, ₹299+ UPI/bank withdrawal disbursement, and Gemini 3.1 Pro Thinking Mode forensic fraud investigations.
                </p>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Administrative Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">Master Passkey / Security Key</label>
                    <span className="text-[10px] text-amber-400 font-mono">Demo Key: ADMIN2026</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showAdminKey ? 'text' : 'password'}
                      placeholder="Enter administrative passkey..."
                      value={adminSecurityKey}
                      onChange={e => setAdminSecurityKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-10 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-amber-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate as System Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Admin Demo Button */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleQuickAdminDemo}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>⚡ Quick Admin Bypass (Pre-fill Passkey &amp; Authenticate)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">ADMIN2026</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Active Session: <strong className="text-slate-300">{currentUser.name}</strong> ({currentRole.toUpperCase()})</span>
          <span className="font-mono text-emerald-400">₹{currentUser.walletBalance.toFixed(2)} Available</span>
        </div>

      </div>
    </div>
  );
};
