import React from 'react';
import { Shield, EyeOff, Lock, ExternalLink, Activity, Rocket } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { MIDNIGHT_CONFIG } from '../utils/contract';

interface LayoutProps {
  children: React.ReactNode;
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string;
  contractAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onUpdateContractAddress: (addr: string) => void;
  onDeployContract: () => Promise<string>;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  isConnected,
  isConnecting,
  walletAddress,
  contractAddress,
  onConnect,
  onDisconnect,
  onUpdateContractAddress,
  onDeployContract,
}) => {
  const hasContractAddress = contractAddress.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  Veil Feedback
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                  Zero-Knowledge
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Anonymous One-Response Surveys on Midnight Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Activity className={`w-3.5 h-3.5 ${hasContractAddress ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{hasContractAddress ? 'Preprod configured' : 'Preprod setup required'}</span>
            </div>

            <WalletConnect
              isConnected={isConnected}
              isConnecting={isConnecting}
              walletAddress={walletAddress}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Banner with Contract Address & Live Status */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-900/40 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {hasContractAddress ? 'Configured Contract:' : 'Contract Address Required:'}
                </span>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => onUpdateContractAddress(e.target.value)}
                  className="font-mono text-xs text-cyan-300 bg-slate-950/80 border border-slate-700/80 px-2 py-0.5 rounded w-64 md:w-80 focus:outline-none focus:border-cyan-500"
                  placeholder="Paste deployed Preprod contract address"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span>{hasContractAddress ? 'Compact contract on Midnight Preprod' : 'Set VITE_MIDNIGHT_CONTRACT_ADDRESS after deployment'}</span>
                {hasContractAddress && (
                  <>
                    <span>•</span>
                    <a
                      href={`${MIDNIGHT_CONFIG.explorerUri}/contract/${contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>View in Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {!hasContractAddress && isConnected && (
              <button
                type="button"
                onClick={() => void onDeployContract()}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 transition flex items-center gap-1.5"
              >
                <Rocket className="w-3 h-3" />
                Deploy to Preprod
              </button>
            )}
            <a
              href={MIDNIGHT_CONFIG.faucetUri}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>Preprod Faucet (tDUST)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-cyan-400" />
            <span>Veil Feedback — Built with Compact on Midnight Network</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Midnight Docs
            </a>
            <a
              href="https://github.com/KB2410/-Veil"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
