import type { Chain } from "@prisma/client";

const NATIVE_DATA: Record<Chain, { symbol: string; name: string }> = {
    ETH: { symbol: 'ETH', name: 'Ethereum' },
    BSC: { symbol: 'BNB', name: 'Binance Coin' },
    POLYGON: { symbol: 'MATIC', name: 'Polygon' },
    SOLANA: { symbol: 'SOL', name: 'Solana' },
};

export const getNativeSymbolStatic = (chain: Chain): string => {
    return NATIVE_DATA[chain]?.symbol || 'ETH';
};