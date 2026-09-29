import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Campaign, PlatformType, TaskType } from '../types';
import { 
  Tv, 
  Plus, 
  Sparkles, 
  Lock, 
  Wallet, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  BrainCircuit,
  Coins
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, FacebookIcon } from './SocialIcons';
import { TransactionLedger } from './TransactionLedger';
import { generateCampaignOptimizer } from '../gemini';
import confetti from 'canvas-confetti';

interface CreatorDashboardProps {
  onOpenWallet: () => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onOpenWallet }) => {
  const { currentUser, campaigns, createCampaign } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [taskType, setTaskType] = useState<TaskType>('video_feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [channelOrHandle, setChannelOrHandle] = useState(currentUser.connectedAccounts.youtube?.handle || '@MyCreatorChannel');
  
  // Mandatory Minimum 1,000 Participants
  const [requiredParticipants, setRequiredParticipants] = useState<number>(1000);
  const [creatorCostPerTask, setCreatorCostPerTask] = useState<number>(3.0); // ₹3.00 default
  const [userRewardPerTask, setUserRewardPerTask] = useState<number>(1.0); // ₹1.00 default
  const [minimumWatchTimeSeconds, setMinimumWatchTimeSeconds] = useState<number>(90);
  
  // Verification Prompts
  const [verificationPrompts, setVerificationPrompts] = useState<{ question: string; expectedEvidence: string }[]>([
    { question: 'What was the main topic introduced in the first 2 minutes?', expectedEvidence: 'Accurate topic overview' },
    { question: 'What audio or lighting improvement would you suggest?', expectedEvidence: 'Constructive technical feedback' }
  ]);

  // AI Optimizer State
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalBudget = requiredParticipants * creatorCostPerTask;
  const platformFee = Math.max(0, creatorCostPerTask - userRewardPerTask);

  const creatorCampaigns = campaigns.filter(c => c.creatorId === currentUser.uid || currentUser.role === 'admin');

  // AI Optimizer with Gemini 3.5 Flash
  const handleAIOptimize = async () => {
    setIsAiOptimizing(true);
    setErrorMessage(null);

    try {
      const opt = await generateCampaignOptimizer({
        platform,
        topicOrChannel: channelOrHandle,
        goal: 'Get authentic video feedback, sound critique, and audience research'
      });

      setTitle(opt.optimizedTitle);
      setDescription(opt.description);
      setVerificationPrompts(opt.verificationQuestions);
      setMinimumWatchTimeSeconds(opt.suggestedDurationSeconds);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (err: any) {
      setErrorMessage("AI Optimizer temporarily unavailable, please fill manually.");
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Hard Rule 1: Minimum 1,000 Participants
    if (requiredParticipants < 1000) {
      setErrorMessage("Strict Rule: Campaigns must require at least 1,000 participants (Current: " + requiredParticipants + ").");
      return;
    }

    // Hard Rule 2: Budget check
    if (currentUser.walletBalance < totalBudget) {
      setErrorMessage(
        `Insufficient Creator Funds. Required budget is ₹${totalBudget.toFixed(2)}, but your wallet balance is ₹${currentUser.walletBalance.toFixed(2)}. Please add funds first.`
      );
      return;
    }

    if (!title || !targetUrl) {
      setErrorMessage("Please fill in campaign title and destination URL.");
      return;
    }

    const res = await createCampaign({
      platform,
      taskType,
      title,
      description,
      targetUrl,
      channelOrHandle,
      requiredParticipants,
      creatorCostPerTask,
      userRewardPerTask,
      platformFeePerTask: platformFee,
      verificationPrompts,
      minimumWatchTimeSeconds,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (res.success) {
      setSuccessMessage(res.message);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      setTimeout(() => {
        setIsCreating(false);
        setSuccessMessage(null);
      }, 2000);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Creator Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Creator Wallet Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Creator Funds</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₹{currentUser.walletBalance.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">Available to fund campaigns</p>
          </div>
          <button
            onClick={onOpenWallet}
            className="w-full py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
          >
            + Add Money
          </button>
        </div>

        {/* Escrow Locked */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Escrow Locked</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-400 font-mono">
              ₹{currentUser.lockedBalance.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">Reserved for active participant rewards</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Immutable Escrow Safe</span>
        </div>

        {/* Total Spent */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Lifetime Campaign Spend</span>
            <Coins className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              ₹{currentUser.lifetimeSpent.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">Distributed to legitimate reviewers</p>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Policy Compliant
          </span>
        </div>

        {/* Active Campaigns */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Campaigns</span>
            <Tv className="w-4 h-4 text-red-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              {creatorCampaigns.length}
            </div>
            <p className="text-[11px] text-slate-500">Minimum 1,000 participants each</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Guaranteed Scale</span>
        </div>

      </div>

      {/* Campaign Launcher Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Creator Campaigns
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {creatorCampaigns.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Real audience discovery and high-value constructive feedback</p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancel Wizard' : 'Launch New Campaign (Min 1,000)'}
        </button>
      </div>

      {/* CREATE CAMPAIGN WIZARD */}
      {isCreating && (
        <form onSubmit={handleLaunchCampaign} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Launch Compliant Engagement Campaign
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-mono">
                  Min 1,000 Participants
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Funds are held in secure escrow and released only upon automated server-side verification.
              </p>
            </div>

            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={handleAIOptimize}
              disabled={isAiOptimizing}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${isAiOptimizing ? 'animate-spin' : ''}`} />
              {isAiOptimizing ? 'Optimizing with Gemini...' : 'AI Campaign Generator'}
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Social Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'youtube', label: 'YouTube', icon: YoutubeIcon },
                  { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
                  { id: 'facebook', label: 'Facebook', icon: FacebookIcon }
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id as PlatformType)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        platform === p.id 
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permitted Task Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Permitted Task Type (YouTube / Meta Policy Compliant)
              </label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as TaskType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="video_feedback">Video Feedback &amp; Critique (Audio, Camera, Pacing)</option>
                <option value="content_discovery">Content Discovery &amp; Comprehension Takeaways</option>
                <option value="watch_and_review">Watch &amp; Thoughtful Review</option>
                <option value="audience_survey">Audience Research &amp; Preferences Survey</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Watch & Review: Smartphone Camera Shootout 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Channel Handle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Channel / Creator Handle</label>
              <input
                type="text"
                value={channelOrHandle}
                onChange={e => setChannelOrHandle(e.target.value)}
                placeholder="e.g. @MyCreatorChannel"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Destination URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Content URL</label>
              <input
                type="url"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Task Instructions for Users</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Specify what segment of content to watch and what aspects to critique..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            {/* Participants (Min 1,000) & Watch Time */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Participants Required (Strict Min 1,000)
                </label>
                {requiredParticipants < 1000 && (
                  <span className="text-[10px] text-rose-400 font-bold">&times; Must be &ge; 1,000</span>
                )}
              </div>
              <input
                type="number"
                min="1000"
                step="50"
                value={requiredParticipants}
                onChange={e => setRequiredParticipants(Number(e.target.value))}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none ${
                  requiredParticipants < 1000 ? 'border-rose-500 text-rose-400' : 'border-slate-800 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Minimum Watch Time Required (Seconds)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                step="10"
                value={minimumWatchTimeSeconds}
                onChange={e => setMinimumWatchTimeSeconds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Pricing Economics Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Transparent Wallet Economics Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Creator Cost/Task</span>
                <span className="text-sm font-bold text-white font-mono">₹{creatorCostPerTask.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">User Receives</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">₹{userRewardPerTask.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Platform Reserve</span>
                <span className="text-sm font-bold text-slate-300 font-mono">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30">
                <span className="text-[10px] text-red-300 block">Total Escrow Required</span>
                <span className="text-sm font-black text-red-400 font-mono">₹{totalBudget.toFixed(2)}</span>
              </div>

            </div>

            <div className="text-[11px] text-slate-400">
              Calculation: {requiredParticipants} participants &times; ₹{creatorCostPerTask.toFixed(2)} = ₹{totalBudget.toFixed(2)}. 
              Available in your wallet: <span className="font-bold text-emerald-400 font-mono">₹{currentUser.walletBalance.toFixed(2)}</span>.
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={requiredParticipants < 1000 || currentUser.walletBalance < totalBudget}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-40 flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Escrow &amp; Launch (₹{totalBudget.toFixed(2)})
            </button>
          </div>

        </form>
      )}

      {/* Campaigns Listing */}
      <div className="space-y-4">
        {creatorCampaigns.map(camp => {
          const percent = Math.min(100, Math.round((camp.completedParticipants / camp.requiredParticipants) * 100));

          return (
            <div 
              key={camp.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/10 text-red-400 border border-red-500/20 uppercase">
                    {camp.platform}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {camp.taskType.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{camp.title}</h3>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Target: <span className="font-mono text-slate-200">{camp.requiredParticipants} participants</span></span>
                  <span>&bull;</span>
                  <span>Escrow: <span className="font-mono text-emerald-400 font-bold">₹{camp.totalBudget.toFixed(2)}</span></span>
                  <span>&bull;</span>
                  <a href={camp.targetUrl} target="_blank" rel="noreferrer" className="text-red-400 hover:underline flex items-center gap-1">
                    Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress: {camp.completedParticipants} / {camp.requiredParticipants}</span>
                    <span className="font-mono font-bold text-slate-300">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>

              {/* Status / Analytics */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <div className="text-right mr-2 hidden sm:block">
                  <span className="text-[11px] text-slate-400 block">Creator Cost</span>
                  <span className="text-xs font-mono font-bold text-white">₹{camp.creatorCostPerTask.toFixed(2)}/task</span>
                </div>
                <div className="p-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-700">
                  {camp.completedParticipants >= camp.requiredParticipants ? 'Completed' : 'Running'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Firestore Creator Wallet Transactions Ledger */}
      <div className="pt-4">
        <TransactionLedger userId={currentUser.uid} showHeader={true} />
      </div>

    </div>
  );
};
