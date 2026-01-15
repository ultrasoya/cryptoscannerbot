import express, { type Request, type Response } from "express";
import { isAddress } from 'viem'
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { prisma } from "./prisma/index.js";
import type { ConnectWalletRequest } from "./src/types/index.js";

const app = express();

// Trust proxy - нужно для работы за туннелем/прокси (localhost.run)
app.set('trust proxy', 1);

app.use(express.json());

// Глобальная сериализация BigInt в JSON
(BigInt.prototype as any).toJSON = function() {
    return this.toString();
};

// Логирование всех запросов
app.use((req, res, next) => {
    console.log('📩 Incoming request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        body: req.body
    });
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        // Разрешаем localhost и все домены *.lhr.life
        const allowedOrigins = [
            'http://localhost:5173',
            /^https:\/\/.*\.lhr\.life$/
        ];
        
        if (!origin || allowedOrigins.some(allowed => 
            typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
        )) {
            console.log('✅ CORS allowed for origin:', origin);
            callback(null, true);
        } else {
            console.log('❌ CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10
});

app.use('/api', limiter);

app.post('/api/connect-wallet', async (req: Request, res: Response) => {
    console.log('🔵 /api/connect-wallet endpoint hit!');
    try {
        const { tgId, wallet } = req.body as ConnectWalletRequest;
        console.log('📝 Received data:', { tgId, wallet });

        if (!tgId || !wallet) {
            console.log('❌ Validation failed: Missing tgId or wallet');
            return res.status(400).json({ success: false, error: "Missing tgId or wallet" });
        }

        if (!isAddress(wallet)) {
            console.log('❌ Validation failed: Invalid wallet address:', wallet);
            return res.status(400).json({ 
                success: false, 
                error: "Invalid wallet address" 
            });
        }

        if (isNaN(Number(tgId)) || Number(tgId) <= 0) {
            console.log('❌ Validation failed: Invalid Telegram ID:', tgId);
            return res.status(400).json({
                success: false,
                error: "Invalid Telegram ID"
            });
        }

        console.log('✅ Validation passed, upserting to database...');
        const user = await prisma.user.upsert({
            where: { telegramId: BigInt(tgId) },
            update: { wallet },
            create: { telegramId: BigInt(tgId), wallet },
        });

        console.log('✅ Database updated successfully:', user);
        res.status(200).json({ success: true, message: "Wallet connected successfully", user });
    } catch (error) {
        console.error("❌ Register user error:", error);
        res.status(500).json({ success: false, error: "Failed to register user" });
    }
});


app.listen(3000, () => {
    console.log("Backend is running on port 3000");
});