import React from 'react';
import { Layout } from './components/Layout';
import { VeilFeedback } from './components/VeilFeedback';
import { useMidnight } from './hooks/useMidnight';

export function App() {
  const {
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
  } = useMidnight();

  return (
    <Layout
      isConnected={isConnected}
      isConnecting={isConnecting}
      walletAddress={walletAddress}
      contractAddress={contractAddress}
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
      onUpdateContractAddress={updateContractAddress}
      onDeployContract={deployPreprodContract}
    >
      <VeilFeedback
        isConnected={isConnected}
        ledgerState={ledgerState}
        proofProgress={proofProgress}
        lastTxId={lastTxId}
        error={error}
        onSubmitFeedback={submitFeedback}
        onAddEligibleCommitment={addEligibleCommitment}
        onToggleSurveyStatus={toggleSurveyStatus}
        onConnectWallet={connectWallet}
      />
    </Layout>
  );
}

export default App;
