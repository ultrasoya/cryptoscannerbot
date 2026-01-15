import { publicClient } from "../config";

export const fetchBalance = async (address: `0x${string}`) => {
    const balance = await publicClient.getBalance({
        address,
    });
    return balance;
};