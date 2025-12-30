import { publicClient } from "../config";

export const fetchBalance = async (address: string) => {
    const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
    });
    return balance;
};