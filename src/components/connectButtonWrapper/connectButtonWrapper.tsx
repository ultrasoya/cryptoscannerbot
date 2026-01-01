import { ConnectButton} from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import styles from './connectButtonWrapper.module.scss';

export const ConnectButtonWrapper = () => {
    const { address, isConnected } = useAccount();

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