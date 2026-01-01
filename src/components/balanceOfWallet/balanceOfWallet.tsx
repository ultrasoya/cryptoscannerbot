import { useState, useEffect } from 'react'
import { fetchBalance } from '../../utils';
import { formatEther } from 'viem';

export const BalanceOfWallet = ({ address }: { address: string }) => {
  const [balance, setBalance] = useState<string>('Загрузка...');

  useEffect(() => {
    const getBalance = async () => {
      try {
        // const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
        const rawBalance = await fetchBalance(address);
        const balance = formatEther(rawBalance);
        setBalance(balance);
      } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        setBalance('Ошибка при получении баланса');
      }
    };

    getBalance();
  }, []);

  return (
    <>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>My Web3 TWA</h1>
        <p>Баланс Виталика: {balance} ETH</p>
      </div>
    </>
  )
}
