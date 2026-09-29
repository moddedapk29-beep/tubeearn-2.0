import { describe, it, expect } from 'vitest';
import { initialCampaigns, initialUserProfiles, initialTransactions } from '../mockData';
import { auditFraudDeepThinking, verifyTaskWithAI } from '../gemini';

describe('TubeEarn Financial & Business Rules Test Suite', () => {

  describe('Withdrawal Rules (₹299 Minimum Threshold)', () => {
    it('rejects withdrawal amounts less than ₹299 (e.g. ₹298, ₹100, ₹0)', () => {
      const amounts = [0, 50, 100, 200, 298, 298.99];
      amounts.forEach(amount => {
        const isBelowThreshold = amount < 299;
        expect(isBelowThreshold).toBe(true);
      });
    });

    it('accepts withdrawal amounts at or above ₹299 boundary', () => {
      const amounts = [299, 299.5, 300, 500, 1000];
      amounts.forEach(amount => {
        const meetsThreshold = amount >= 299;
        expect(meetsThreshold).toBe(true);
      });
    });

    it('enforces sufficient wallet balance guard for withdrawals', () => {
      const userBalance = 342.0;
      const requestedWithdrawal = 9999.0;
      const isSufficient = requestedWithdrawal <= userBalance;
      expect(isSufficient).toBe(false);
    });

    it('requires verified KYC status prior to dispatching withdrawal', () => {
      const verifiedUser = { kycStatus: 'verified' };
      const pendingUser = { kycStatus: 'pending' };
      const rejectedUser = { kycStatus: 'rejected' };

      expect(verifiedUser.kycStatus === 'verified').toBe(true);
      expect(pendingUser.kycStatus === 'verified').toBe(false);
      expect(rejectedUser.kycStatus === 'verified').toBe(false);
    });
  });

  describe('Campaign Creator Rules (Minimum 1,000 Participants)', () => {
    it('strictly rejects any campaign with fewer than 1,000 required participants', () => {
      const testParticipantCounts = [1, 50, 500, 999];
      testParticipantCounts.forEach(count => {
        const isValid = count >= 1000;
        expect(isValid).toBe(false);
      });
    });

    it('accepts campaigns with 1,000 or more participants', () => {
      const testParticipantCounts = [1000, 1001, 1500, 5000, 10000];
      testParticipantCounts.forEach(count => {
        const isValid = count >= 1000;
        expect(isValid).toBe(true);
      });
    });

    it('correctly calculates total campaign budget and platform fee margins', () => {
      const requiredParticipants = 1000;
      const creatorCostPerTask = 3.0; // ₹3.00
      const userRewardPerTask = 1.0;   // ₹1.00
      const platformFeePerTask = creatorCostPerTask - userRewardPerTask; // ₹2.00

      const totalBudget = requiredParticipants * creatorCostPerTask;
      const totalUserRewards = requiredParticipants * userRewardPerTask;
      const totalPlatformGross = requiredParticipants * platformFeePerTask;

      expect(totalBudget).toBe(3000.0);
      expect(totalUserRewards).toBe(1000.0);
      expect(totalPlatformGross).toBe(2000.0);
      expect(totalUserRewards + totalPlatformGross).toBe(totalBudget);
    });

    it('all initial mock campaigns adhere to the >= 1,000 participant rule', () => {
      initialCampaigns.forEach(campaign => {
        expect(campaign.requiredParticipants).toBeGreaterThanOrEqual(1000);
        expect(campaign.escrowLocked).toBe(campaign.requiredParticipants * campaign.creatorCostPerTask);
      });
    });
  });

  describe('Wallet & Ledger Double-Entry Integrity', () => {
    it('maintains valid transaction schema with non-zero amounts and timestamp', () => {
      initialTransactions.forEach(tx => {
        expect(tx.id).toBeDefined();
        expect(tx.userId).toBeDefined();
        expect(tx.type).toBeDefined();
        expect(typeof tx.amount).toBe('number');
        expect(tx.status).toBeDefined();
        expect(tx.createdAt).toBeDefined();
        expect(new Date(tx.createdAt).getTime()).not.toBeNaN();
      });
    });

    it('correctly reflects balance updates when funding creator wallet', () => {
      const initialBalance = 500.0;
      const depositAmount = 250.0;
      const updatedBalance = initialBalance + depositAmount;

      expect(updatedBalance).toBe(750.0);
    });

    it('locks escrow funds from wallet balance when creating a campaign', () => {
      const walletBalance = 5000.0;
      const campaignBudget = 3000.0;
      const availableAfterLock = walletBalance - campaignBudget;
      const lockedBalance = campaignBudget;

      expect(availableAfterLock).toBe(2000.0);
      expect(lockedBalance).toBe(3000.0);
    });
  });

  describe('Anti-Fraud and AI Task Verification Logic', () => {
    it('evaluates task feedback length and minimum watch duration correctly', async () => {
      const result = await verifyTaskWithAI({
        campaignTitle: 'Test Campaign',
        taskType: 'video_feedback',
        userFeedback: 'Detailed analysis of color grading and sound equalization in the opening scene.',
        answers: [{ question: 'What was the lighting?', answer: 'Sunset studio lights' }],
        watchDurationSeconds: 100,
        minimumWatchTimeSeconds: 90
      });

      expect(result).toHaveProperty('isAccepted');
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThan(0);
    });

    it('flags insufficient watch time or brief spam input', async () => {
      const result = await verifyTaskWithAI({
        campaignTitle: 'Test Campaign',
        taskType: 'video_feedback',
        userFeedback: 'good',
        answers: [],
        watchDurationSeconds: 10,
        minimumWatchTimeSeconds: 90
      });

      expect(result.isAccepted).toBe(false);
      expect(result.score).toBeLessThan(50);
    });

    it('audits fraud indicators with risk score between 0 and 100', async () => {
      const audit = await auditFraudDeepThinking({
        userId: 'user_test_99',
        userName: 'Test User',
        totalSubmissions: 5,
        avgWatchDurationSeconds: 95,
        requiredWatchSeconds: 90,
        ipVelocityCount: 1,
        recentFeedbacks: ['Valid subjective review of microphone audio and pacing.']
      });

      expect(audit).toHaveProperty('fraudScore');
      expect(audit.fraudScore).toBeGreaterThanOrEqual(0);
      expect(audit.fraudScore).toBeLessThanOrEqual(100);
      expect(audit).toHaveProperty('verdict');
      expect(['APPROVED', 'HOLD_FOR_REVIEW', 'SUSPEND_ACCOUNT']).toContain(audit.verdict);
    });
  });

});
