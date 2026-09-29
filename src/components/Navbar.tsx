import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Play, 
  Wallet, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Tv, 
  Layers, 
  CheckCircle2, 
  Share2, 
  FileCheck,
  Terminal,
  LogOut,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenWallet: () => void;
  onOpenKyc: () => void;
  onOpenSocials: () => void;
  onOpenTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWallet,
  onOpenKyc,
  onOpenSocials,
  onOpenTests
}) => {
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    signInWithGoogle, 
    signOut, 
    isGoogleLoading 
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Tube<span className="text-red-500">Earn</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                  Compliant
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Creator Engagement & Reward Marketplace</p>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentRole('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'user' 
                  ? 'bg-red-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              User Earn
            </button>
            <button
              onClick={() => setCurrentRole('creator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'creator' 
                  ? 'bg-rose-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Creator Studio
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'admin' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Admin Hub
            </button>
          </div>

          {/* Right Action Icons & Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Run Automated CUJ Tests Button */}
            <button
              onClick={onOpenTests}
              title="Run Automated Tests"
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tests</span>
            </button>

            {/* Social Connect Button */}
            <button
              onClick={onOpenSocials}
              title="Manage Social Accounts"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {currentUser.connectedAccounts.youtube?.connected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              )}
            </button>

            {/* KYC Status Pill */}
            <button
              onClick={onOpenKyc}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                currentUser.kycStatus === 'verified'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : currentUser.kycStatus === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {currentUser.kycStatus === 'verified' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">KYC OK</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Verify KYC</span>
                </>
              )}
            </button>

            {/* Wallet Balance Chip */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700/80 rounded-xl transition-all shadow-sm group"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Balance</span>
                <span className="text-sm font-bold text-emerald-400 block leading-none font-mono">
                  ₹{currentUser.walletBalance.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Google Sign In or User Avatar */}
            {currentUser.email && !currentUser.email.includes('example.com') ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=ef4444&color=fff`} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={isGoogleLoading}
                className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Role Switcher */}
        <div className="flex md:hidden items-center justify-center gap-2 py-2 border-t border-slate-800">
          <button
            onClick={() => setCurrentRole('user')}
            className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
              currentRole === 'user' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setCurrentRole('creator')}
            className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
              currentRole === 'creator' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            Creator
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
              currentRole === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
        </div>

      </div>
    </header>
  );
};
