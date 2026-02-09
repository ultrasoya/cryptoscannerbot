import { Queue } from 'bullmq';

export const connection = {
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,
};

export const PRICE_CHECK_QUEUE = 'price-check-queue';
export const priceQueue = new Queue(PRICE_CHECK_QUEUE, {
    connection
});