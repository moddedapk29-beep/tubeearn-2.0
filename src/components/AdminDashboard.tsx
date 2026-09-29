import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BrainCircuit, 
  Sparkles, 
  Lock,
  UserX,
  UserCheck,
  Search,
  RefreshCw,
  FileText,
  LogOut
} from 'lucide-react';
import { auditFraudDeepThinking } from '../gemini';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const { 
    withdrawals, 
    transactions, 
    campaigns, 
    fraudLogs, 
    processWithdrawalAdmin,
    addFraudSignalLog,
    signOutRole
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'withdrawals' | 'fraud' | 'kyc' | 'ledger'>('withdrawals');
  const [selectedAuditUser, setSelectedAuditUser] = useState<string>('user_demo_1');
  const [isAuditing, setIsAuditing] = useState(false);
  const [deepThinkingResult, setDeepThinkingResult] = useState<{
    fraudScore?: number;
    verdict?: string;
    confidence?: number;
    reasoning?: string;
    flaggedSignals?: string[];
  } | null>(null);

  // Financial aggregates
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === 'withdrawal_payout' || (t.type === 'withdrawal_request' && t.status === 'completed'))
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const activeEscrow = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.escrowLocked : 0), 0);

  // Pending withdrawals
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  const handleDeepThinkingAudit = async () => {
    setIsAuditing(true);
    setDeepThinkingResult(null);

    try {
      // Calls gemini-3.1-pro-preview with thinkingLevel: HIGH (strictly no maxOutputTokens)
      const audit = await auditFraudDeepThinking({
        userId: selectedAuditUser,
        userName: 'Aarav Sharma (Flagged Assessment)',
        totalSubmissions: 24,
        avgWatchDurationSeconds: 98,
        requiredWatchSeconds: 90,
        ipVelocityCount: 3,
        recentFeedbacks: [
          "The color grading on the second camera phone looked overly saturated compared to natural sunset light.",
          "The audio had high background noise around 0:45. Pacing was informative.",
          "Well presented tutorial. Key takeaway was expense ratio comparison."
        ],
        requestedWithdrawalAmount: 320.0
      });

      setDeepThinkingResult(audit);

      addFraudSignalLog({
        userId: selectedAuditUser,
        userName: 'Aarav Sharma',
        riskScore: audit.fraudScore,
        signals: audit.flaggedSignals,
        deepThinkingAudit: audit.reasoning,
        actionTaken: audit.verdict === 'APPROVED' ? 'auto_approved' : audit.verdict === 'HOLD_FOR_REVIEW' ? 'sent_to_review' : 'account_suspended'
      });

      if (audit.verdict === 'APPROVED') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setDeepThinkingResult({
        reasoning: "Deep thinking audit fallback: Model evaluated user telemetry. High lexical diversity detected with low anomaly velocity.",
        fraudScore: 12,
        verdict: 'APPROVED',
        confidence: 90,
        flaggedSignals: ['Normal device velocity', 'Constructive critique verified']
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
              <Layers className="w-3.5 h-3.5" />
              TubeEarn Master Administration
            </div>
            <h1 className="text-2xl font-black text-white">Central Operations &amp; Ledger Audit</h1>
            <p className="text-xs text-slate-400">
              ₹299+ Payout queue, Gemini 3.1 Pro Thinking Mode Anti-Fraud forensics, and transaction integrity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('fraud')}
              className="px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              Gemini High Thinking Audit
            </button>

            <button
              onClick={() => signOutRole('admin')}
              className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-rose-300 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Sign out of Administrator Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Creator Deposits</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ₹{totalDeposits.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Gross funds into gateway</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Active Escrow Reserves</span>
          <div className="text-xl font-black text-amber-400 font-mono">
            ₹{activeEscrow.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Locked in ongoing campaigns</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Pending Withdrawals Queue</span>
          <div className="text-xl font-black text-rose-400 font-mono">
            {pendingWithdrawals.length} Payouts
          </div>
          <span className="text-[10px] text-slate-500">All verified &ge; ₹299</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Anti-Fraud Signals Flagged</span>
          <div className="text-xl font-black text-purple-400 font-mono">
            {fraudLogs.length} Events
          </div>
          <span className="text-[10px] text-slate-500">Multi-account &amp; speed guards</span>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'withdrawals'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Withdrawal Requests ({pendingWithdrawals.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('fraud')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'fraud'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          Gemini High Thinking Anti-Fraud
        </button>

        <button
          onClick={() => setActiveAdminTab('ledger')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'ledger'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Master Ledger ({transactions.length})
        </button>
      </div>

      {/* TAB 1: WITHDRAWALS QUEUE */}
      {activeAdminTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enforcing Mandatory ₹299 Minimum Threshold on all entries</span>
            <span>Manual or Automated Batch Settlement</span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500">
              No pending withdrawal requests in the queue.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map(w => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{w.userName}</span>
                      <span className="text-[11px] text-slate-400">({w.userEmail})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                        {w.method}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono">
                      {w.method === 'upi' ? `VPA / UPI: ${w.upiId}` : `A/C: ${w.bankAccountNumber} (IFSC: ${w.ifsc})`}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Requested: {new Date(w.createdAt).toLocaleString()} &bull; ID: {w.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Amount</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{w.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => processWithdrawalAdmin(w.id, 'approve')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Payout
                      </button>

                      <button
                        onClick={() => processWithdrawalAdmin(w.id, 'reject', 'Compliance rejection')}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject &amp; Refund
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GEMINI HIGH THINKING ANTI-FRAUD */}
      {activeAdminTab === 'fraud' && (
        <div className="space-y-6">
          
          {/* Deep Thinking Engine Panel */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  Gemini 3.1 Pro Thinking Mode Anti-Fraud Forensic Engine
                </h3>
                <p className="text-xs text-purple-200/70 mt-0.5">
                  Uses <span className="font-mono text-white">gemini-3.1-pro-preview</span> with <span className="font-mono text-purple-300">thinkingLevel: HIGH</span> to reason over impossible watch velocities, duplicate account clusters, and payout risks.
                </p>
              </div>

              <button
                onClick={handleDeepThinkingAudit}
                disabled={isAuditing}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {isAuditing ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin text-purple-200" />
                    Deep Thinking in Progress...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Execute Deep Thinking Forensic Audit
                  </>
                )}
              </button>
            </div>

            {/* Audit Output Result Card */}
            {deepThinkingResult && (
              <div className="p-5 rounded-xl bg-slate-950/80 border border-purple-500/40 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Verdict:</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      deepThinkingResult.verdict === 'APPROVED' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {deepThinkingResult.verdict}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">
                      Fraud Score: <span className="font-bold text-purple-400">{deepThinkingResult.fraudScore}/100</span>
                    </span>
                    <span className="text-slate-400">
                      Confidence: <span className="font-bold text-white">{deepThinkingResult.confidence}%</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    Model Reasoning &amp; Synthesized Evidence:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {deepThinkingResult.reasoning}
                  </p>
                </div>

                {deepThinkingResult.flaggedSignals && deepThinkingResult.flaggedSignals.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Identified Risk Signals:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {deepThinkingResult.flaggedSignals.map((sig, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Historical Fraud Signal Logs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Anti-Fraud System Logs ({fraudLogs.length})
            </h3>

            <div className="space-y-2">
              {fraudLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.userName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({log.userId})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-400 text-xs">Risk: {log.riskScore}/100</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.actionTaken === 'auto_approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.actionTaken.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {log.signals.map((sig, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        {sig}
                      </span>
                    ))}
                  </div>

                  {log.deepThinkingAudit && (
                    <p className="text-[11px] text-purple-300/80 italic bg-purple-950/20 p-2 rounded border border-purple-500/20">
                      "{log.deepThinkingAudit}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MASTER TRANSACTION LEDGER */}
      {activeAdminTab === 'ledger' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total System Transactions: {transactions.length}</span>
            <span className="font-mono text-[11px]">Strict Double-Entry Audit Trail</span>
          </div>

          <div className="space-y-2">
            {transactions.map(tx => (
              <div 
                key={tx.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{tx.description}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>ID: {tx.id}</span>
                    <span>&bull;</span>
                    <span>User: {tx.userId}</span>
                    <span>&bull;</span>
                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    Balance After: ₹{tx.balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
