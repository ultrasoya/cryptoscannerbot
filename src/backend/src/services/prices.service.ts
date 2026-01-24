import axios from 'axios';

export class PriceService {
    private readonly baseUrl = 'https://api.coingecko.com/api/v3';

    async getTokenPrice(chain: string, address: string): Promise<number | null> {
        try {
            const platform = this.mapChainToPlatform(chain);
            const url = `${this.baseUrl}/simple/token_price/${platform}?contract_addresses=${address}&vs_currencies=usd`;

            const { data } = await axios.get(url);
            return data[address.toLowerCase()]?.usd || null;
        } catch (error) {
            console.error('Price fetch error:', error);
            return null;
        }
    }

    private mapChainToPlatform(chain: string): string {
        const mapping: Record<string, string> = {
            ETH: 'ethereum',
            BSC: 'binance-smart-chain',
            SOLANA: 'solana'
        };

        return mapping[chain] || 'ethereum';
    }
}