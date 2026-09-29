import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/Navbar';
import { UserDashboard } from './components/UserDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WalletModal } from './components/WalletModal';
import { KycModal } from './components/KycModal';
import { SocialAccountsModal } from './components/SocialAccountsModal';
import { AutomatedTestsModal } from './components/AutomatedTestsModal';
import { Shield, Sparkles, CheckCircle2, Lock, HelpCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole } = useApp();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenKyc={() => setIsKycOpen(true)}
        onOpenSocials={() => setIsSocialsOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'user' && (
          <UserDashboard
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenSocials={() => setIsSocialsOpen(true)}
          />
        )}

        {currentRole === 'creator' && (
          <CreatorDashboard
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-300">Tube<span className="text-red-500">Earn</span></span>
              <span>&bull;</span>
              <span>Compliant Creator Engagement Marketplace</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> ₹299 Minimum Payout Enforced
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-purple-400">
                <Sparkles className="w-3.5 h-3.5" /> Gemini 3.1 Pro Thinking Mode Anti-Fraud
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Policy Disclosure: TubeEarn provides legitimate creator discovery, video feedback, and audience research tasks. TubeEarn strictly prohibits and does not offer artificial engagement, paid subscribers, or sub-for-sub schemes in full adherence to YouTube and Meta platform developer policies.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onOpenKyc={() => {
          setIsWalletOpen(false);
          setIsKycOpen(true);
        }}
      />

      <KycModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
      />

      <SocialAccountsModal
        isOpen={isSocialsOpen}
        onClose={() => setIsSocialsOpen(false)}
      />

      <AutomatedTestsModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
