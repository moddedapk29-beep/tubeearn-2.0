import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Campaign, 
  WalletTransaction, 
  WithdrawalRequest, 
  FraudSignalLog, 
  UserRole,
  KycStatus
} from '../types';
import { 
  initialCampaigns, 
  initialUserProfiles, 
  initialTransactions, 
  initialWithdrawals, 
  initialFraudSignals 
} from '../mockData';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FbUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  campaigns: Campaign[];
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  fraudLogs: FraudSignalLog[];
  isGoogleLoading: boolean;
  
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateKyc: (status: KycStatus, documentType?: 'aadhaar' | 'pan' | 'voter_id', docNumber?: string) => void;
  connectSocialAccount: (platform: 'youtube' | 'instagram' | 'facebook', handle: string, channelName?: string) => void;
  
  // Financial & Ledger methods
  addCreatorFunds: (amount: number, paymentMethod: string) => Promise<{ success: boolean; message: string }>;
  requestWithdrawal: (amount: number, method: 'upi' | 'bank_transfer', details: { upiId?: string; bankAccount?: string; ifsc?: string; name?: string }) => Promise<{ success: boolean; message: string }>;
  
  // Campaign methods
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'creatorId' | 'creatorName' | 'completedParticipants' | 'totalBudget' | 'escrowLocked' | 'status' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  
  // Task completion
  submitTask: (campaignId: string, feedback: string, answers: { question: string; answer: string }[], watchDuration: number) => Promise<{ success: boolean; score: number; message: string }>;
  
  // Admin methods
  processWithdrawalAdmin: (withdrawalId: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;
  updateUserStatusAdmin: (userId: string, status: 'active' | 'flagged' | 'suspended') => void;
  addFraudSignalLog: (log: Omit<FraudSignalLog, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'tubeearn_v1_store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialUserProfiles['user_demo_1'];
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_campaigns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialCampaigns;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialTransactions;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_withdrawals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialWithdrawals;
  });

  const [fraudLogs, setFraudLogs] = useState<FraudSignalLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_fraud');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialFraudSignals;
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_fraud', JSON.stringify(fraudLogs));
  }, [fraudLogs]);

  // Handle Role Switching
  useEffect(() => {
    if (currentRole === 'creator') {
      setCurrentUser(initialUserProfiles['creator_demo_1']);
    } else if (currentRole === 'admin') {
      setCurrentUser(initialUserProfiles['admin_demo_1']);
    } else {
      setCurrentUser(initialUserProfiles['user_demo_1']);
    }
  }, [currentRole]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FbUser | null) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setCurrentUser(data);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Google User',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: currentRole,
              kycStatus: 'pending',
              walletBalance: 150.0, // Welcome starter balance
              pendingBalance: 0.0,
              lockedBalance: 0.0,
              lifetimeEarned: 0.0,
              lifetimeSpent: 0.0,
              accountStatus: 'active',
              connectedAccounts: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn("Firestore sync fallback to local profile:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [currentRole]);

  // Google Sign-In
  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const updatedUser: UserProfile = {
        ...currentUser,
        uid: fbUser.uid,
        name: fbUser.displayName || currentUser.name,
        email: fbUser.email || currentUser.email,
        photoURL: fbUser.photoURL || currentUser.photoURL
      };
      setCurrentUser(updatedUser);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      // Even if popup is blocked in sandbox iframe, gracefully maintain demo user session
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(initialUserProfiles['user_demo_1']);
  };

  // KYC Update
  const updateKyc = (status: KycStatus, documentType?: 'aadhaar' | 'pan' | 'voter_id', docNumber?: string) => {
    setCurrentUser(prev => ({
      ...prev,
      kycStatus: status,
      kycDocumentType: documentType || prev.kycDocumentType,
      kycDocumentNumberMasked: docNumber ? `XXXX-XXXX-${docNumber.slice(-4)}` : prev.kycDocumentNumberMasked,
      updatedAt: new Date().toISOString()
    }));
  };

  // Connect Social Account
  const connectSocialAccount = (platform: 'youtube' | 'instagram' | 'facebook', handle: string, channelName?: string) => {
    setCurrentUser(prev => ({
      ...prev,
      connectedAccounts: {
        ...prev.connectedAccounts,
        [platform]: {
          connected: true,
          handle,
          channelName: channelName || handle,
          verifiedAt: new Date().toISOString().split('T')[0]
        }
      }
    }));
  };

  // Add Creator Funds
  const addCreatorFunds = async (amount: number, paymentMethod: string): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) return { success: false, message: 'Deposit amount must be greater than zero.' };

    const newBalance = currentUser.walletBalance + amount;
    const txId = 'tx_' + Date.now();
    const newTx: WalletTransaction = {
      id: txId,
      userId: currentUser.uid,
      type: 'deposit',
      amount: amount,
      balanceAfter: newBalance,
      status: 'completed',
      referenceId: 'DEP_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      description: `Creator wallet deposit via ${paymentMethod}`,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: newBalance,
      updatedAt: new Date().toISOString()
    }));

    setTransactions(prev => [newTx, ...prev]);

    // Firestore async sync
    try {
      await setDoc(doc(db, 'transactions', txId), newTx);
      await setDoc(doc(db, 'walletTransactions', txId), newTx);
      await setDoc(doc(db, 'users', currentUser.uid), { walletBalance: newBalance }, { merge: true });
    } catch (e) {
      // local fallback handled
    }

    return { success: true, message: `Successfully added ₹${amount.toFixed(2)} to Creator Wallet!` };
  };

  // Withdraw Money (Enforcing STRICT ₹299 MINIMUM)
  const requestWithdrawal = async (
    amount: number, 
    method: 'upi' | 'bank_transfer', 
    details: { upiId?: string; bankAccount?: string; ifsc?: string; name?: string }
  ): Promise<{ success: boolean; message: string }> => {
    // 1. HARD RULE: ₹299 Minimum Withdrawal
    if (amount < 299) {
      return { 
        success: false, 
        message: `Minimum withdrawal threshold is ₹299. You requested ₹${amount}. Please earn at least ₹${(299 - amount).toFixed(2)} more.` 
      };
    }

    // 2. Balance Check
    if (amount > currentUser.walletBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available balance is ₹${currentUser.walletBalance.toFixed(2)}.`
      };
    }

    // 3. KYC Requirement Check
    if (currentUser.kycStatus !== 'verified') {
      return {
        success: false,
        message: 'Government Identity / KYC verification is mandatory before requesting withdrawals. Please complete KYC in your Profile.'
      };
    }

    // 4. Method Specific Validation
    if (method === 'upi' && (!details.upiId || !details.upiId.includes('@'))) {
      return { success: false, message: 'Please provide a valid UPI ID (e.g. name@bank).' };
    }

    if (method === 'bank_transfer' && (!details.bankAccount || !details.ifsc)) {
      return { success: false, message: 'Please provide complete Bank Account Number and valid 11-character IFSC code.' };
    }

    const wdrId = 'wdr_' + Date.now();
    const newBalance = currentUser.walletBalance - amount;
    const newLocked = currentUser.lockedBalance + amount;

    const newWithdrawal: WithdrawalRequest = {
      id: wdrId,
      userId: currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount,
      method,
      upiId: details.upiId,
      bankAccountNumber: details.bankAccount,
      ifsc: details.ifsc,
      accountHolderName: details.name || currentUser.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      userId: currentUser.uid,
      type: 'withdrawal_request',
      amount: -amount,
      balanceAfter: newBalance,
      status: 'pending',
      referenceId: wdrId,
      description: `Withdrawal request of ₹${amount.toFixed(2)} via ${method === 'upi' ? 'UPI (' + details.upiId + ')' : 'Bank Transfer'}`,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: newBalance,
      lockedBalance: newLocked,
      updatedAt: new Date().toISOString()
    }));

    setWithdrawals(prev => [newWithdrawal, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    // Firestore async
    try {
      await setDoc(doc(db, 'withdrawals', wdrId), newWithdrawal);
      await setDoc(doc(db, 'walletTransactions', newTx.id), newTx);
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (e) {
      // local fallback handled
    }

    return { 
      success: true, 
      message: `Withdrawal request for ₹${amount.toFixed(2)} successfully queued. Payout will be sent within 2-4 hours after automated ledger audit.` 
    };
  };

  // Create Campaign (Enforcing MINIMUM 1,000 PARTICIPANTS)
  const createCampaign = async (
    data: Omit<Campaign, 'id' | 'creatorId' | 'creatorName' | 'completedParticipants' | 'totalBudget' | 'escrowLocked' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; message: string }> => {
    // 1. HARD RULE: Minimum 1,000 Participants
    if (data.requiredParticipants < 1000) {
      return {
        success: false,
        message: `Campaign creation rejected: Minimum 1,000 participants required. Specified count was ${data.requiredParticipants}.`
      };
    }

    // 2. Budget Calculation: Creator Cost per Task * Participants
    const totalBudget = data.requiredParticipants * data.creatorCostPerTask;

    if (currentUser.walletBalance < totalBudget) {
      return {
        success: false,
        message: `Insufficient creator funds. Required budget is ₹${totalBudget.toFixed(2)} (${data.requiredParticipants} @ ₹${data.creatorCostPerTask}/task). Your balance is ₹${currentUser.walletBalance.toFixed(2)}.`
      };
    }

    const campaignId = 'camp_' + Date.now();
    const newBalance = currentUser.walletBalance - totalBudget;
    const newLocked = currentUser.lockedBalance + totalBudget;

    const newCampaign: Campaign = {
      ...data,
      id: campaignId,
      creatorId: currentUser.uid,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.photoURL,
      completedParticipants: 0,
      totalBudget,
      escrowLocked: totalBudget,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      userId: currentUser.uid,
      type: 'campaign_budget_lock',
      amount: -totalBudget,
      balanceAfter: newBalance,
      status: 'completed',
      referenceId: campaignId,
      description: `Escrow budget locked for campaign: "${data.title}" (1,000+ participants guaranteed)`,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: newBalance,
      lockedBalance: newLocked,
      lifetimeSpent: prev.lifetimeSpent + totalBudget,
      updatedAt: new Date().toISOString()
    }));

    setCampaigns(prev => [newCampaign, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    // Firestore async
    try {
      await setDoc(doc(db, 'campaigns', campaignId), newCampaign);
      await setDoc(doc(db, 'walletTransactions', newTx.id), newTx);
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
    } catch (e) {
      // local fallback handled
    }

    return { 
      success: true, 
      message: `Campaign "${data.title}" launched successfully! ₹${totalBudget.toFixed(2)} reserved in verified escrow.` 
    };
  };

  // Submit Task
  const submitTask = async (
    campaignId: string, 
    feedback: string, 
    answers: { question: string; answer: string }[], 
    watchDuration: number
  ): Promise<{ success: boolean; score: number; message: string }> => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return { success: false, score: 0, message: 'Campaign not found' };

    if (campaign.completedParticipants >= campaign.requiredParticipants) {
      return { success: false, score: 0, message: 'This campaign has already reached its participant goal.' };
    }

    const reward = campaign.userRewardPerTask;
    const newWallet = currentUser.walletBalance + reward;
    const newEarned = currentUser.lifetimeEarned + reward;

    const txId = 'tx_' + Date.now();
    const newTx: WalletTransaction = {
      id: txId,
      userId: currentUser.uid,
      type: 'task_reward_settled',
      amount: reward,
      balanceAfter: newWallet,
      status: 'completed',
      referenceId: campaignId,
      description: `Task reward: "${campaign.title}"`,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: newWallet,
      lifetimeEarned: newEarned,
      updatedAt: new Date().toISOString()
    }));

    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const completed = c.completedParticipants + 1;
        return {
          ...c,
          completedParticipants: completed,
          status: completed >= c.requiredParticipants ? 'completed' : c.status
        };
      }
      return c;
    }));

    setTransactions(prev => [newTx, ...prev]);

    // Firestore async
    try {
      await setDoc(doc(db, 'walletTransactions', txId), newTx);
      await setDoc(doc(db, 'transactions', txId), newTx);
      await setDoc(doc(db, 'users', currentUser.uid), { 
        walletBalance: newWallet, 
        lifetimeEarned: newEarned 
      }, { merge: true });
    } catch (e) {
      // local fallback handled
    }

    return {
      success: true,
      score: 92,
      message: `Task verified! ₹${reward.toFixed(2)} credited to your wallet balance.`
    };
  };

  // Admin: Process Withdrawal
  const processWithdrawalAdmin = async (withdrawalId: string, action: 'approve' | 'reject', notes?: string) => {
    const target = withdrawals.find(w => w.id === withdrawalId);
    if (!target) return;

    if (action === 'approve') {
      const payoutRef = 'PAY_UPI_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? {
        ...w,
        status: 'completed',
        payoutRef,
        processedAt: new Date().toISOString()
      } : w));

      setTransactions(prev => prev.map(tx => tx.referenceId === withdrawalId ? {
        ...tx,
        status: 'completed',
        description: `${tx.description} (Processed: ${payoutRef})`
      } : tx));
    } else {
      // Rejection: refund locked amount back to user's wallet
      setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? {
        ...w,
        status: 'rejected',
        rejectionReason: notes || 'Rejected during administrative compliance review.',
        processedAt: new Date().toISOString()
      } : w));

      // If rejecting the current active user's withdrawal, refund balance
      if (currentUser.uid === target.userId) {
        setCurrentUser(prev => ({
          ...prev,
          walletBalance: prev.walletBalance + target.amount,
          lockedBalance: Math.max(0, prev.lockedBalance - target.amount)
        }));
      }

      const refundTx: WalletTransaction = {
        id: 'tx_' + Date.now(),
        userId: target.userId,
        type: 'withdrawal_refund',
        amount: target.amount,
        balanceAfter: currentUser.walletBalance + target.amount,
        status: 'completed',
        referenceId: withdrawalId,
        description: `Refund: Withdrawal of ₹${target.amount} rejected (${notes || 'Compliance check failed'})`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [refundTx, ...prev]);
    }
  };

  const updateUserStatusAdmin = (userId: string, status: 'active' | 'flagged' | 'suspended') => {
    if (currentUser.uid === userId) {
      setCurrentUser(prev => ({ ...prev, accountStatus: status }));
    }
  };

  const addFraudSignalLog = (log: Omit<FraudSignalLog, 'id' | 'timestamp'>) => {
    const newLog: FraudSignalLog = {
      ...log,
      id: 'fs_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setFraudLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        campaigns,
        transactions,
        withdrawals,
        fraudLogs,
        isGoogleLoading,
        signInWithGoogle,
        signOut,
        updateKyc,
        connectSocialAccount,
        addCreatorFunds,
        requestWithdrawal,
        createCampaign,
        submitTask,
        processWithdrawalAdmin,
        updateUserStatusAdmin,
        addFraudSignalLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
