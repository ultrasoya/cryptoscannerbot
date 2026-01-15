import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css'
import { WagmiProvider } from 'wagmi';
import { walletConfig } from './config';
import { BalanceOfWallet, ConnectButtonWrapper } from './components';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { Telegram } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

function App() {
  const queryClient = new QueryClient();

  const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
  const tgId = tgUser?.id;


  if (!tgId) {
    return <div>Error: Telegram ID is not found</div>;
  }

  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectButtonWrapper tgId={tgId} />
          <BalanceOfWallet />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
