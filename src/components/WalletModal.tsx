import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { TransactionLedger } from './TransactionLedger';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard,
  Building,
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKyc: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onOpenKyc }) => {
  const { 
    currentUser, 
    transactions, 
    addCreatorFunds, 
    requestWithdrawal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'withdraw' | 'ledger'>('overview');
  
  // Add Money Form State
  const [addAmount, setAddAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [addStatusMessage, setAddStatusMessage] = useState<string | null>(null);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.max(299, Math.floor(currentUser.walletBalance)));
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState(currentUser.bankDetails?.upiId || 'aarav@okaxis');
  const [bankAccount, setBankAccount] = useState(currentUser.bankDetails?.accountNumberMasked || '0984102948192');
  const [ifsc, setIfsc] = useState(currentUser.bankDetails?.ifsc || 'HDFC0001234');
  const [accountName, setAccountName] = useState(currentUser.bankDetails?.accountHolderName || currentUser.name);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingAdd(true);
    setAddStatusMessage(null);

    const res = await addCreatorFunds(addAmount, `Razorpay (${paymentMethod.toUpperCase()})`);
    setIsProcessingAdd(false);

    if (res.success) {
      setAddStatusMessage(res.message);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => {
        setAddStatusMessage(null);
        setActiveTab('overview');
      }, 1500);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    // Strict client validation
    if (withdrawAmount < 299) {
      setWithdrawError('Minimum withdrawal amount is strictly ₹299.');
      return;
    }

    if (withdrawAmount > currentUser.walletBalance) {
      setWithdrawError(`Insufficient funds. Your available balance is ₹${currentUser.walletBalance.toFixed(2)}.`);
      return;
    }

    if (currentUser.kycStatus !== 'verified') {
      setWithdrawError('KYC verification is required before initiating withdrawals. Please complete KYC.');
      return;
    }

    setIsProcessingWithdraw(true);

    const res = await requestWithdrawal(withdrawAmount, withdrawMethod, {
      upiId,
      bankAccount,
      ifsc,
      name: accountName
    });

    setIsProcessingWithdraw(false);

    if (res.success) {
      setWithdrawSuccess(res.message);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      setWithdrawError(res.message);
    }
  };

  const userTransactions = transactions.filter(t => t.userId === currentUser.uid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                TubeEarn Wallet Hub
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  INR Ledger
                </span>
              </h2>
              <p className="text-xs text-slate-400">Escrow-backed balance and automated UPI / Bank payouts</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            Add Funds
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            Withdraw (₹299+)
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'ledger'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Ledger ({userTransactions.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Primary Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Available Balance */}
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-medium">Available Balance</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{currentUser.walletBalance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Ready to withdraw or fund campaigns</p>
                </div>

                {/* Pending Balance (in settlement review) */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-medium">Pending Settlement</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400 font-mono">
                    ₹{currentUser.pendingBalance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Under 24h anti-fraud clearing</p>
                </div>

                {/* Locked Balance (escrow / active) */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-medium">Locked Escrow</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200 font-mono">
                    ₹{currentUser.lockedBalance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Reserved in campaigns or payouts</p>
                </div>
              </div>

              {/* Progress to ₹299 Withdrawal */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Minimum Payout Threshold (₹299)
                  </span>
                  <span className="font-mono text-slate-400">
                    ₹{Math.min(299, currentUser.walletBalance).toFixed(2)} / ₹299.00
                  </span>
                </div>
                
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      currentUser.walletBalance >= 299 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (currentUser.walletBalance / 299) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  {currentUser.walletBalance >= 299 ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Eligible for instant withdrawal!
                    </span>
                  ) : (
                    <span>
                      Earn ₹{(299 - currentUser.walletBalance).toFixed(2)} more to reach withdraw threshold.
                    </span>
                  )}

                  <button 
                    onClick={() => setActiveTab('withdraw')}
                    disabled={currentUser.walletBalance < 299}
                    className={`font-semibold underline ${
                      currentUser.walletBalance >= 299 ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Withdraw Now &rarr;
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('add')}
                  className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Add Funds to Wallet
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="p-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Request Payout (₹299+)
                </button>
              </div>

              {/* Recent Ledger Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Recent Ledger Entries</span>
                  <button 
                    onClick={() => setActiveTab('ledger')}
                    className="text-emerald-400 hover:underline text-xs"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80 bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
                  {userTransactions.slice(0, 3).map(tx => (
                    <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 line-clamp-1">{tx.description}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ADD FUNDS */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddFunds} className="space-y-5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300">
                Deposit funds to fund campaigns (creators) or test user wallet credits. Powered by simulated Indian Payment Gateway (Razorpay/UPI).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Deposit Amount (INR)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[500, 1000, 3000, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddAmount(amt)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        addAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={addAmount}
                    onChange={e => setAddAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Gateway / Payout Method
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'bg-slate-800 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">Instant UPI (GPay, PhonePe, Paytm)</div>
                        <div className="text-[10px] text-slate-400">Zero surcharge, instant ledger verification</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payMethod" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')}
                      className="text-emerald-500 focus:ring-0"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'bg-slate-800 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">Debit / Credit Card</div>
                        <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay cards accepted</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="payMethod" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="text-emerald-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {addStatusMessage && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {addStatusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessingAdd || addAmount <= 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isProcessingAdd ? 'Authorizing Gateway Transaction...' : `Deposit ₹${addAmount.toFixed(2)}`}
              </button>
            </form>
          )}

          {/* TAB 3: WITHDRAWAL (Strict ₹299 Rule) */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-5">
              
              {/* Mandatory Policy Warning */}
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs space-y-1 text-rose-300">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  Strict ₹299 Minimum Withdrawal Policy
                </div>
                <p className="text-[11px] text-rose-300/80">
                  As required by TubeEarn financial compliance, withdrawal requests below ₹299 are automatically rejected. All payouts are audited against fraud signals prior to UPI/NEFT transmission.
                </p>
              </div>

              {/* KYC Requirement Notice */}
              {currentUser.kycStatus !== 'verified' && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs flex items-center justify-between text-amber-300">
                  <div>
                    <span className="font-bold block">KYC Verification Required</span>
                    <span className="text-[11px] text-amber-300/80">Identity proof must be approved before withdrawal.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenKyc}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Verify Now
                  </button>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-semibold text-slate-300">Withdrawal Amount</label>
                  <span className="text-slate-400 font-mono">
                    Available: ₹{currentUser.walletBalance.toFixed(2)}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="299"
                    max={currentUser.walletBalance}
                    step="1"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                    placeholder="Enter amount (min 299)"
                  />
                </div>

                {withdrawAmount < 299 && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    &times; Amount must be at least ₹299.00
                  </p>
                )}
              </div>

              {/* Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('upi')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      withdrawMethod === 'upi'
                        ? 'bg-slate-800 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Instant UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bank_transfer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      withdrawMethod === 'bank_transfer'
                        ? 'bg-slate-800 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Bank IMPS / NEFT
                  </button>
                </div>

                {/* UPI Fields */}
                {withdrawMethod === 'upi' ? (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@paytm or name@okaxis"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Account Holder Full Name</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={e => setAccountName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={bankAccount}
                          onChange={e => setBankAccount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          value={ifsc}
                          onChange={e => setIfsc(e.target.value.toUpperCase())}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {withdrawError && (
                <div className="p-3 bg-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {withdrawSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isProcessingWithdraw || 
                  withdrawAmount < 299 || 
                  withdrawAmount > currentUser.walletBalance ||
                  currentUser.kycStatus !== 'verified'
                }
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-40"
              >
                {isProcessingWithdraw ? 'Validating Ledger & Queuing...' : `Withdraw ₹${withdrawAmount.toFixed(2)}`}
              </button>
            </form>
          )}

          {/* TAB 4: IMMUTABLE TRANSACTION LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <TransactionLedger userId={currentUser.uid} showHeader={false} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
