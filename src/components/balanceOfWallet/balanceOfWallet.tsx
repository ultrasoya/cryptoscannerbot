import { useState, useEffect } from 'react'
import { fetchBalance } from '../../utils';
import { formatEther, isAddress } from 'viem';
import { useAccount } from 'wagmi';

export const BalanceOfWallet = () => {
  const [balance, setBalance] = useState<string>('Загрузка...');

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const getBalance = async () => {
      if (!isConnected || !address) {
        setBalance('Wallet is not connected');
        return;
      }

      try {
        
        const rawBalance = await fetchBalance(address);
        const balance = formatEther(rawBalance);
        setBalance(balance);
      } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        setBalance('Ошибка при получении баланса');
      }
    };

    getBalance();
  }, [address, isConnected]);

  return (
    <>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>CryptoScanner</h1>
        <p>Your balance: {balance} ETH</p>
      </div>
    </>
  )
}
