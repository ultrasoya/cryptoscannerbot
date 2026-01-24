import { PrismaClient } from "@prisma/client";
import { priceQueue } from "../queues/config.js";

const prisma = new PrismaClient();

export const schedulePriceChecks = async () => {
    const activeAlerts = await prisma.alert.findMany({
        where: { isActive: true },
        select: { id: true }
    });

    const jobs = activeAlerts.map(alert => ({
        name: `check-alert-${alert.id}`,
        data: { alertId: alert.id },
        opts: {
            removeOnComplete: true,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 }
        }
    }))


    await priceQueue.addBulk(jobs);

    console.log(`[Scheduler] Added ${jobs.length} alerts to queue`);
}