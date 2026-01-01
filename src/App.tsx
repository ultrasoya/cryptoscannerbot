import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css'
import { WagmiProvider } from 'wagmi';
import { walletConfig } from './config';
import { BalanceOfWallet, ConnectButtonWrapper } from './components';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

const VITALIK_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

function App() {

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectButtonWrapper />
          <BalanceOfWallet address={VITALIK_ADDRESS} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
