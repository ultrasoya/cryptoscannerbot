import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PriceService } from '../services/prices.service.js';
import { Bot } from 'grammy';
import { connection, PRICE_CHECK_QUEUE } from './config.js';

const prisma = new PrismaClient();
const priceService = new PriceService();

export const createPriceWorker = (bot: Bot) => {
    return new Worker(
        PRICE_CHECK_QUEUE,
        async (job: Job<{ alertId: string }>) => {
            const { alertId } = job.data;

            const alert = await prisma.alert.findUnique({
                where: { id: alertId, isActive: true }
            });

            if (!alert) return;

            const currentPrice = await priceService.getTokenPrice(alert.chain, alert.tokenAddress);
            if (!currentPrice) throw new Error(`Could not fetch price ${alert.tokenAddress}`);

            const isTriggered = (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
                (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice);

            if (isTriggered) {
                const message = `🔔 **Alert!**\n\n${alert.symbol} достиг цены **$${currentPrice}**\nУсловие: ${alert.condition} $${alert.targetPrice}`;
                await bot.api.sendMessage(alert.telegramId, message, { parse_mode: 'Markdown' });

                await prisma.alert.update({
                    where: { id: alert.id },
                    data: { isActive: false, lastTriggered: new Date() }
                });

            };
        },
        {
            connection,
            concurrency: 5,
            limiter: {
                max: 10,
                duration: 60000
            }
        }
    );
};