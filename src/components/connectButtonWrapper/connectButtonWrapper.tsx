import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { connectWallet } from '@/shared';

import styles from './connectButtonWrapper.module.scss';

interface ConnectButtonWrapperProps {
    tgId: number;
}

export const ConnectButtonWrapper = ({ tgId }: ConnectButtonWrapperProps) => {
    const { address, isConnected } = useAccount();
    const [isWalletSent, setIsWalletSent] = useState(false);

    useEffect(() => {
        if (isConnected && !isWalletSent && address && tgId) {
            connectWallet(`${tgId}`, address)
            .then(() => setIsWalletSent(true))
            .catch(err => {
                console.error('Failed to connect wallet:', err);
            })
        }
    }, [isConnected, address, tgId, isWalletSent])

    return (
        <div className={styles.wrapper}>
            <ConnectButton />

            {isConnected ? (
                <div>
                    <p>Address: {address}</p>
                </div>
            ) : (
                <p>Connect your wallet to continue</p>
            )}

        </div>
    )    
};