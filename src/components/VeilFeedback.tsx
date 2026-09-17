import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  Lock,
  EyeOff,
  Cpu,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  KeyRound,
  Layers,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Ban,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ContractLedgerState,
  ProofGenerationStep,
  deriveCommitment,
  deriveNullifier,
} from '../utils/contract';
import { DEMO_CREDENTIALS } from '../hooks/useMidnight';

interface VeilFeedbackProps {
  isConnected: boolean;
  ledgerState: ContractLedgerState;
  proofProgress: ProofGenerationStep;
  lastTxId: string | null;
  error: string | null;
  onSubmitFeedback: (secret: string, rating: number) => Promise<unknown>;
  onAddEligibleCommitment: (secretOrCommitment: string, isSecret: boolean) => Promise<void>;
  onToggleSurveyStatus: () => Promise<void>;
  onConnectWallet: () => void;
}

export const VeilFeedback: React.FC<VeilFeedbackProps> = ({
  isConnected,
  ledgerState,
  proofProgress,
  lastTxId,
  error,
  onSubmitFeedback,
  onAddEligibleCommitment,
  onToggleSurveyStatus,
  onConnectWallet,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [confidentialNote, setConfidentialNote] = useState<string>('');
  const [selectedSecret, setSelectedSecret] = useState<string>(DEMO_CREDENTIALS[0].secret);
  const [customSecret, setCustomSecret] = useState<string>('');
  const [useCustomSecret, setUseCustomSecret] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'tallies' | 'privacy' | 'admin'>('submit');

  // Admin states
  const [newMemberSecret, setNewMemberSecret] = useState<string>('');
  const [adminStatusMsg, setAdminStatusMsg] = useState<string | null>(null);

  const activeSecret = useCustomSecret ? customSecret : selectedSecret;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSecret) return;
    try {
      await onSubmitFeedback(activeSecret, selectedRating);
    } catch {
      // Error handled in hook state
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberSecret) return;
    try {
      await onAddEligibleCommitment(newMemberSecret, true);
      setAdminStatusMsg(`Registered commitment for "${newMemberSecret}" into eligible set!`);
      setNewMemberSecret('');
      setTimeout(() => setAdminStatusMsg(null), 4000);
    } catch (err: unknown) {
      const e = err as Error;
      setAdminStatusMsg(`Error: ${e.message}`);
    }
  };

  const isSubmitting = ['witness_gen', 'circuit_eval', 'zk_proof', 'submitting'].includes(
    proofProgress.step
  );

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'submit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Submit Anonymous Survey</span>
          </button>

          <button
            onClick={() => setActiveTab('tallies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'tallies'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Public Aggregate Tallies</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ZK Privacy Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Organizer Controls</span>
          </button>
        </div>

        {/* Survey Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <div
            className={`w-2 h-2 rounded-full ${
              ledgerState.surveyOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
            }`}
          />
          <span className="text-xs font-medium text-slate-300">
            {ledgerState.surveyOpen ? 'Survey Active & Open' : 'Survey Closed'}
          </span>
        </div>
      </div>

      {/* TAB 1: SUBMIT ANONYMOUS FEEDBACK */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Submission Form */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Midnight Community Feedback Survey</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your identity and response are proven in Zero-Knowledge and never revealed on-chain.
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                  1. Satisfaction Rating (Private Witness Input)
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                        selectedRating === star
                          ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.03]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 mb-1 ${
                          selectedRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                      <span className="text-sm font-bold">{star} Star{star > 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidential Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  2. Confidential Suggestions / Comments (Local Witness)
                </label>
                <textarea
                  value={confidentialNote}
                  onChange={(e) => setConfidentialNote(e.target.value)}
                  placeholder="Share details regarding governance, ergonomics, or developer experience. This text stays strictly on your machine and is never sent on-chain."
                  rows={3}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Private Credential Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3. Private Credential (Proof of Eligibility)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomSecret(!useCustomSecret)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    {useCustomSecret ? 'Use Demo Preset Credential' : 'Enter Custom Secret'}
                  </button>
                </div>

                {!useCustomSecret ? (
                  <div className="space-y-2">
                    {DEMO_CREDENTIALS.map((cred) => (
                      <label
                        key={cred.secret}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          selectedSecret === cred.secret
                            ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="credential"
                            checked={selectedSecret === cred.secret}
                            onChange={() => setSelectedSecret(cred.secret)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{cred.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">{cred.secret}</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          Eligible
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customSecret}
                    onChange={(e) => setCustomSecret(e.target.value)}
                    placeholder="Enter your confidential member secret key"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Submit Action Button */}
              <div>
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Connect Wallet to Generate ZK Proof</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !ledgerState.surveyOpen}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Generating Zero-Knowledge Proof...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Submit Anonymous Response (ZK Proof)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Live ZK Proof Pipeline & Transaction Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* ZK Proof Circuit Execution Visualizer */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Zero-Knowledge Proof Engine</span>
              </h3>

              <div className="space-y-4">
                {/* Step 1: Witness Setup */}
                <div
                  className={`p-3.5 rounded-2xl border transition ${
                    proofProgress.step === 'witness_gen'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : ['circuit_eval', 'zk_proof', 'submitting', 'confirmed'].includes(
                          proofProgress.step
                        )
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-2">
                      {['circuit_eval', 'zk_proof', 'submitting', 'confirmed'].includes(
                        proofProgress.step
                      ) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          1
                        </span>
                      )}
                      1. Private Witness Binding
                    </span>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">Client-Side</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Binds <code className="text-indigo-300">credential()</code> and private score without disclosure.
                  </p>
                </div>

                {/* Step 2: Circuit Constraint Evaluation */}
                <div
                  className={`p-3.5 rounded-2xl border transition ${
                    proofProgress.step === 'circuit_eval'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : ['zk_proof', 'submitting', 'confirmed'].includes(proofProgress.step)
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-2">
                      {['zk_proof', 'submitting', 'confirmed'].includes(proofProgress.step) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          2
                        </span>
                      )}
                      2. Compact Circuit Verification
                    </span>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">Compact</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Asserts membership in <code className="text-indigo-300">eligibleCommitments</code> & non-duplicate nullifier.
                  </p>
                </div>

                {/* Step 3: ZK Snark Synthesis */}
                <div
                  className={`p-3.5 rounded-2xl border transition ${
                    proofProgress.step === 'zk_proof'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : ['submitting', 'confirmed'].includes(proofProgress.step)
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-2">
                      {['submitting', 'confirmed'].includes(proofProgress.step) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          3
                        </span>
                      )}
                      3. Halo2 ZK Proof Synthesis
                    </span>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">Proof Server</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Constructs zero-knowledge computational proof payload.
                  </p>
                </div>

                {/* Step 4: Preprod Submission */}
                <div
                  className={`p-3.5 rounded-2xl border transition ${
                    proofProgress.step === 'submitting'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : proofProgress.step === 'confirmed'
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-2">
                      {proofProgress.step === 'confirmed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          4
                        </span>
                      )}
                      4. On-Chain Ledger Settlement
                    </span>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">Midnight Node</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Discloses aggregate tally counter increment and seals nullifier.
                  </p>
                </div>
              </div>

              {/* Status Message / Errors */}
              {error && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Submission Rejected</div>
                    <div className="text-[11px] text-rose-300/80 mt-0.5">{error}</div>
                  </div>
                </div>
              )}

              {lastTxId && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Transaction Sealed on Preprod</span>
                  </div>
                  <div className="font-mono text-[11px] break-all bg-slate-950/60 p-2 rounded border border-emerald-900/50 text-emerald-300">
                    Tx: {lastTxId}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Proof Data Breakdown */}
            {proofProgress.proofData && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 text-xs font-mono space-y-2">
                <div className="text-slate-400 text-[11px] uppercase font-sans font-semibold">
                  Zero-Knowledge Proof Artifacts
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] break-all">
                  <span className="text-slate-500">Nullifier: </span>
                  <span className="text-cyan-300">{proofProgress.proofData.nullifier}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] break-all">
                  <span className="text-slate-500">ZK Proof Hash: </span>
                  <span className="text-indigo-300">{proofProgress.proofData.proofHash}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PUBLIC AGGREGATE TALLIES */}
      {activeTab === 'tallies' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>On-Chain Aggregate Survey Results</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Public ledger tallies. Individual votes are never visible on the ledger.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Responses</div>
                <div className="text-lg font-bold text-cyan-400">{ledgerState.totalResponses}</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Average Rating</div>
                <div className="text-lg font-bold text-amber-400 flex items-center gap-1">
                  <span>{ledgerState.averageRating}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution Bars */}
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ledgerState.tallies[star - 1] || 0;
              const percentage =
                ledgerState.totalResponses > 0
                  ? Math.round((count / ledgerState.totalResponses) * 100)
                  : 0;

              return (
                <div key={star} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>{star} Star{star > 1 ? 's' : ''}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="font-mono text-slate-400">
                      {count} response{count !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* On-chain Ledger Nullifier Registry */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Public Nullifier Registry ({ledgerState.usedNullifiers.length} Registered)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Nullifiers prevent duplicate submissions. They are cryptographically one-way and cannot be tied to respondents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
              {ledgerState.usedNullifiers.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  No nullifiers recorded yet in current session.
                </div>
              ) : (
                ledgerState.usedNullifiers.map((nullifier, idx) => (
                  <div
                    key={idx}
                    className="font-mono text-[11px] p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300 truncate"
                  >
                    #{idx + 1}: {nullifier}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY ARCHITECTURE & WHAT GETS PROVED */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Zero-Knowledge Privacy Model Specification</span>
            </h2>
            <p className="text-xs text-slate-400 mb-8">
              Veil Feedback uses Midnight's Compact smart contract language to achieve mathematical privacy guarantees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Private Witness */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-500/30 relative">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-2">
                  1. Local Private Witnesses
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Never leaves the user's local device; never broadcast over network or ledger.
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>User Credential Secret (<code className="text-purple-300">credential()</code>)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Raw Response / Feedback Text</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Respondent Wallet Identity</span>
                  </li>
                </ul>
              </div>

              {/* Zero-Knowledge Proof */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 relative">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide mb-2">
                  2. Proven in ZK Circuit
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Proved mathematically via Compact ZK Snark without revealing private inputs.
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Valid membership in <code className="text-cyan-300">eligibleCommitments</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Nullifier non-membership (<code className="text-cyan-300">!usedNullifiers</code>)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Rating range constraint (<code className="text-cyan-300">1 &lt;= rating &lt;= 5</code>)</span>
                  </li>
                </ul>
              </div>

              {/* Public On-Chain Ledger */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <EyeOff className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide mb-2">
                  3. Public Ledger State
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Published to Midnight Preprod blockchain, verifiable by everyone worldwide.
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Aggregate counters (<code className="text-emerald-300">ratingOne..ratingFive</code>)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>One-way nullifier registry (Sybil prevention)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Survey Open / Closed status boolean</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORGANIZER CONTROLS */}
      {activeTab === 'admin' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <span>Survey Organizer Management Panel</span>
          </h2>
          <p className="text-xs text-slate-400 mb-8">
            Manage membership commitments and survey lifecycle using the organizer authorization circuit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Eligible Credential */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Register Eligible Member Commitment</span>
              </h3>
              <p className="text-xs text-slate-400">
                The organizer registers a cryptographic commitment hash — not the member's wallet address or email.
              </p>
              <form onSubmit={handleAddMember} className="space-y-3">
                <input
                  type="text"
                  value={newMemberSecret}
                  onChange={(e) => setNewMemberSecret(e.target.value)}
                  placeholder="Enter secret to derive commitment (e.g. member-secret-101)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                >
                  Derive Commitment & Add to Ledger
                </button>
              </form>

              {adminStatusMsg && (
                <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-300 text-xs">
                  {adminStatusMsg}
                </div>
              )}
            </div>

            {/* Lifecycle & Status Toggle */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Ban className="w-4 h-4 text-amber-400" />
                  <span>Survey Lifecycle Control</span>
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Current Status: <span className="font-bold text-white">{ledgerState.surveyOpen ? 'OPEN for Submissions' : 'CLOSED'}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Closing the survey invokes <code className="text-cyan-300">closeSurvey()</code> on the Compact contract, preventing any future submissions.
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleSurveyStatus}
                className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-lg ${
                  ledgerState.surveyOpen
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {ledgerState.surveyOpen ? 'Close Survey (Disallow Submissions)' : 'Re-open Survey'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
