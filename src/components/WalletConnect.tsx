import React from 'react';
import { Wallet, CheckCircle2, Loader2, ShieldCheck, LogOut } from 'lucide-react';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  walletAddress,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2 bg-slate-900/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide">
            {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
          </span>
          <div className="h-3.5 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Preprod</span>
          </div>
          <button
            onClick={onDisconnect}
            title="Disconnect Wallet"
            className="ml-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
              <span>Connecting wallet…</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect 1AM Wallet</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
