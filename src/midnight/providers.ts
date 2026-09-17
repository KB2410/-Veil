import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { CostModel, Transaction } from '@midnight-ntwrk/ledger-v8';
import { createProofProvider } from '@midnight-ntwrk/midnight-js/types';

type ConnectedWallet = {
  getConfiguration(): Promise<{ indexerUri: string; indexerWsUri: string; proverServerUri?: string }>;
  getProvingProvider?: (keyMaterialProvider: unknown) => Promise<Parameters<typeof createProofProvider>[0]>;
  getShieldedAddresses(): Promise<{ shieldedAddress: string; shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  getUnshieldedAddress(): Promise<{ unshieldedAddress: string }>;
  balanceUnsealedTransaction(serialized: string): Promise<{ tx: string }>;
  submitTransaction(serialized: string): Promise<void>;
};

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) => new Uint8Array((hex.replace(/^0x/, '').match(/.{1,2}/g) ?? []).map((item) => parseInt(item, 16)));

/** Build official Midnight JS providers backed by the connected wallet. */
export async function buildMidnightProviders(wallet: ConnectedWallet) {
  const config = await wallet.getConfiguration();
  const zkConfigProvider = new FetchZkConfigProvider(
    `${window.location.origin}/contract/veil_feedback`,
    fetch.bind(window)
  );
  const rawPublicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri);
  const publicDataProvider = {
    ...rawPublicDataProvider,
    async queryZSwapAndContractState(...args: Parameters<typeof rawPublicDataProvider.queryZSwapAndContractState>) {
      const result = await rawPublicDataProvider.queryZSwapAndContractState(...args);
      if (!result) return result;
      const [zswapState, contractState, parameters] = result;
      return [zswapState.postBlockUpdate(new Date()), contractState, parameters] as typeof result;
    },
  };
  const proofProvider = config.proverServerUri
    ? httpClientProofProvider(config.proverServerUri, zkConfigProvider)
    : wallet.getProvingProvider
      ? createProofProvider(await wallet.getProvingProvider(zkConfigProvider.asKeyMaterialProvider()))
      : (() => { throw new Error('The connected wallet does not provide a proof server or DApp Connector proving provider.'); })();
  const shielded = await wallet.getShieldedAddresses();

  const walletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    async balanceTx(tx: { serialize(): Uint8Array }) {
      const balanced = await wallet.balanceUnsealedTransaction(toHex(tx.serialize()));
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };
  const midnightProvider = {
    async submitTx(tx: { serialize(): Uint8Array; identifiers(): string[] }) {
      await wallet.submitTransaction(toHex(tx.serialize()));
      return tx.identifiers()[0];
    },
  };
  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => 'veil-feedback-local-private-state-v1',
    accountId: shielded.shieldedAddress,
  });

  return { privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider, costModel: CostModel.initialCostModel() };
}
