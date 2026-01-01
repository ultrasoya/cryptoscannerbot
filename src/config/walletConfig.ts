import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, sepolia } from 'viem/chains';

export const walletConfig = getDefaultConfig({
    appName: 'cryptoscannerbot',
    projectId: '49680ce66a36d559bd932623dd1e5799',
    chains: [mainnet, polygon, arbitrum, sepolia],
    ssr: false
})