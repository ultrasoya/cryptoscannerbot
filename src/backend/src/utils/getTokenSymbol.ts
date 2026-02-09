import type { Chain } from "@prisma/client";
import { ethers } from 'ethers';
import { PLATFORM_MAP } from "../constants/index.js";

async function getTokenSymbolWeb3(address: string, chain: Chain): Promise<string> {
    const providers = {
        ETH: new ethers.JsonRpcProvider(process.env.ETH_RPC_URL),
        BSC: new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL),
        POLYGON: new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL),
    };

    const provider = providers[chain as keyof typeof providers];
    if (!provider) return 'TOKEN';


    const contract = new ethers.Contract(
        address,
        ['function symbol() view returns (string)'],
        provider
    );

    try {
        const symbolFunction = contract.getFunction('symbol');
        return await symbolFunction();
    } catch {
        return 'TOKEN';
    }
}

async function getTokenSymbolFromCoinGecko(address: string, chain: Chain): Promise<string> {
    const platform = PLATFORM_MAP[chain];
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${address}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data.symbol?.toUpperCase() || 'TOKEN';
    } catch {
        return 'TOKEN'
    }

}

export const getTokenSymbol = async (address: string, chain: Chain): Promise<string> => {
    if (chain !== 'SOLANA') {
        try {
            return await getTokenSymbolWeb3(address, chain);
        } catch {
            return await getTokenSymbolFromCoinGecko(address, chain);
        }
    }

    return await getTokenSymbolFromCoinGecko(address, 'SOLANA');
}