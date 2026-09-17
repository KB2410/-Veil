import { useState, useEffect, useCallback } from 'react';
import {
  ContractLedgerState,
  MIDNIGHT_CONFIG,
  ProofGenerationStep,
  deriveCommitment,
  deriveIssuerPublicKey,
  generateProofAndSubmit,
  persistentHash,
} from '../utils/contract';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js/contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js/network-id';
import { buildMidnightProviders } from '../midnight/providers';
import { createVeilContract } from '../midnight/contract';

// Pre-seeded demo credentials for instant testing
export const DEMO_CREDENTIALS = [
  { name: 'Core Contributor Alpha', secret: 'veil-cred-alpha-9921-secret' },
  { name: 'DAO Delegate Beta', secret: 'veil-cred-beta-4182-secret' },
  { name: 'Verified Auditor Gamma', secret: 'veil-cred-gamma-7731-secret' },
];

export const DEMO_ORGANIZER_SECRET = 'veil-organizer-master-key-2026';

type ConnectedWalletApi = {
  getShieldedAddresses?: () => Promise<{ shieldedAddress?: string }>;
  getUnshieldedAddress?: () => Promise<{ unshieldedAddress?: string }>;
  getConfiguration?: () => Promise<{ networkId?: string }>;
  getProvingProvider?: (keyMaterialProvider: unknown) => Promise<unknown>;
};

type InitialWalletApi = {
  name?: string;
  connect?: (networkId: string) => Promise<ConnectedWalletApi>;
};

export function useMidnight() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>(
    localStorage.getItem('veil_contract_address') || MIDNIGHT_CONFIG.defaultContractAddress
  );

  const [ledgerState, setLedgerState] = useState<ContractLedgerState>({
    organizer: '',
    surveyOpen: true,
    eligibleCommitments: [],
    usedNullifiers: [],
    tallies: [0, 0, 0, 0, 0],
    totalResponses: 0,
    averageRating: 0,
  });

  const [proofProgress, setProofProgress] = useState<ProofGenerationStep>({
    step: 'idle',
    message: '',
  });

  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof buildMidnightProviders>> | null>(null);

  const randomWitness = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  };
  const organizerWitness = () => {
    const key = 'veil_preprod_organizer_witness';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const value = randomWitness();
    localStorage.setItem(key, value);
    return value;
  };

  // Initialize initial mock ledger state with demo commitments
  useEffect(() => {
    async function init() {
      const organizerKey = await deriveIssuerPublicKey(DEMO_ORGANIZER_SECRET);
      const initialCommitments: string[] = [];
      for (const cred of DEMO_CREDENTIALS) {
        const comm = await deriveCommitment(cred.secret);
        initialCommitments.push(comm);
      }

      setLedgerState({
        organizer: organizerKey,
        surveyOpen: true,
        eligibleCommitments: initialCommitments,
        usedNullifiers: [],
        tallies: [1, 2, 8, 14, 25],
        totalResponses: 50,
        averageRating: 4.2,
      });
    }
    init();
  }, []);

  // Connect through the standard Midnight DApp Connector (1AM, Lace, etc.).
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const walletWindow = window as Window & { midnight?: Record<string, InitialWalletApi> };
      const availableWallets = Object.values(walletWindow.midnight ?? {}).filter(
        (wallet) => typeof wallet?.connect === 'function'
      );
      const selectedWallet = availableWallets.find((wallet) => wallet.name?.toLowerCase().includes('1am'))
        ?? availableWallets[0];

      if (!selectedWallet?.connect) {
        throw new Error('No Midnight wallet detected. Install and unlock 1AM, then reload this page.');
      }

      const api = await selectedWallet.connect('preprod');
      const network = await api.getConfiguration?.();
      if (network?.networkId && network.networkId !== 'preprod') {
        throw new Error(`Wallet is connected to ${network.networkId}; switch it to Preprod and try again.`);
      }
      setNetworkId((network?.networkId ?? 'preprod') as never);

      const shielded = await api.getShieldedAddresses?.();
      const unshielded = await api.getUnshieldedAddress?.();
      const address = shielded?.shieldedAddress ?? unshielded?.unshieldedAddress;
      if (!address) {
        throw new Error('The wallet connected but did not provide an account address.');
      }

      const walletProviders = await buildMidnightProviders(api as Parameters<typeof buildMidnightProviders>[0]);
      setProviders(walletProviders);
      setIsConnected(true);
      setWalletAddress(address);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e?.message || 'Failed to connect Midnight Lace Wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress('');
    setProviders(null);
  }, []);

  const updateContractAddress = useCallback((address: string) => {
    setContractAddress(address);
    localStorage.setItem('veil_contract_address', address);
  }, []);

  const deployPreprodContract = useCallback(async () => {
    if (!providers) throw new Error('Connect 1AM Wallet before deploying.');
    setError(null);
    setProofProgress({ step: 'submitting', message: 'Creating and submitting the Veil Feedback deployment transaction…' });
    try {
      const compiledContract = createVeilContract(organizerWitness(), randomWitness());
      const deployed = await deployContract(providers as never, { compiledContract } as never);
      const address = deployed.deployTxData.public.contractAddress;
      updateContractAddress(address);
      setLastTxId(deployed.deployTxData.public.txId);
      setProofProgress({ step: 'confirmed', message: 'Contract confirmed on Midnight Preprod.' });
      return address;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Contract deployment failed';
      setError(message);
      setProofProgress({ step: 'error', message });
      throw err;
    }
  }, [providers, updateContractAddress]);

  // Submit anonymous feedback via Compact Zero-Knowledge Proof
  const submitFeedback = useCallback(
    async (secret: string, rating: number) => {
      setError(null);
      setLastTxId(null);
      setProofProgress({ step: 'witness_gen', message: 'Initiating ZK proof pipeline...' });

      try {
        if (!providers || !contractAddress) {
          throw new Error('Connect 1AM and deploy or enter an explorer-verified Preprod contract address first.');
        }
        setProofProgress({ step: 'witness_gen', message: 'Binding your private credential witness locally…' });
        const credentialWitness = await persistentHash('veil-feedback:witness', secret);
        const compiledContract = createVeilContract(organizerWitness(), credentialWitness);
        setProofProgress({ step: 'zk_proof', message: 'Generating a Zero-Knowledge proof through the connected wallet…' });
        const call = await submitCallTx(providers as never, {
          compiledContract,
          contractAddress,
          circuitId: 'submit',
          args: [BigInt(rating)],
        } as never);
        setLastTxId(call.public.txId);
        setProofProgress({ step: 'confirmed', message: 'Feedback transaction confirmed on Midnight Preprod.' });
        return call;
        /* The simulator below remains as unit-tested reference logic until a
           public-state reader is added for confirmed aggregate refreshes. */
        /* c8 ignore start */
        const result = await generateProofAndSubmit(
          secret,
          rating,
          ledgerState,
          (stepInfo) => setProofProgress(stepInfo)
        );

        setLedgerState(result.newState);
        setLastTxId(result.txId);
        return result;
        /* c8 ignore stop */
      } catch (err: unknown) {
        const e = err as Error;
        const errMsg = e?.message || 'Failed to generate ZK proof and submit feedback';
        setError(errMsg);
        setProofProgress({ step: 'error', message: errMsg });
        throw e;
      }
    },
    [contractAddress, ledgerState, providers]
  );

  // Organizer: Register an eligible credential commitment
  const addEligibleCommitment = useCallback(
    async (secretOrCommitment: string, isSecret = false) => {
      setError(null);
      try {
        if (!isSecret) throw new Error('Enter a credential secret so the Compact circuit can derive its private commitment.');
        if (!providers || !contractAddress) {
          throw new Error('Connect 1AM and deploy or enter an explorer-verified Preprod contract address first.');
        }
        const credentialWitness = await persistentHash('veil-feedback:witness', secretOrCommitment);
        const compiledContract = createVeilContract(organizerWitness(), credentialWitness);
        const call = await submitCallTx(providers as never, {
          compiledContract,
          contractAddress,
          circuitId: 'addEligibleCredential',
        } as never);
        setLastTxId(call.public.txId);
        setProofProgress({ step: 'confirmed', message: 'Credential commitment registered on Midnight Preprod.' });
        return;
        /* c8 ignore start */
        let commitment = secretOrCommitment;
        if (isSecret) {
          commitment = await deriveCommitment(secretOrCommitment);
        }

        if (ledgerState.eligibleCommitments.includes(commitment)) {
          throw new Error('Credential commitment is already registered in eligible set');
        }

        setLedgerState((prev) => ({
          ...prev,
          eligibleCommitments: [...prev.eligibleCommitments, commitment],
        }));
        /* c8 ignore stop */
      } catch (err: unknown) {
        const e = err as Error;
        setError(e?.message || 'Failed to register eligible commitment');
        throw e;
      }
    },
    [contractAddress, ledgerState.eligibleCommitments, providers]
  );

  // Organizer: Toggle survey open status
  const toggleSurveyStatus = useCallback(async () => {
    setLedgerState((prev) => ({
      ...prev,
      surveyOpen: !prev.surveyOpen,
    }));
  }, []);

  return {
    isConnected,
    isConnecting,
    walletAddress,
    contractAddress,
    ledgerState,
    proofProgress,
    lastTxId,
    error,
    connectWallet,
    disconnectWallet,
    updateContractAddress,
    deployPreprodContract,
    submitFeedback,
    addEligibleCommitment,
    toggleSurveyStatus,
  };
}
