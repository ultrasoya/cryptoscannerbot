# Crypto Scanner Bot

A Telegram bot that monitors cryptocurrency prices and sends real-time alerts when your target conditions are met.

## Key Features

- **Multi-chain Support** - Track tokens across Ethereum, BSC, Solana, and Polygon networks
- **Price Alerts** - Set custom alerts for price going above or below your target
- **Real-time Monitoring** - Powered by BullMQ job queues for efficient price tracking
- **Native & Token Support** - Monitor both native coins (ETH, BNB, SOL) and ERC20/BEP20 tokens

## Stack

**Backend**
- Node.js + Express
- Grammy (Telegram Bot Framework)
- Prisma + PostgreSQL
- BullMQ + Redis
- Viem + Ethers.js

**Frontend**
- React + TypeScript
- Vite
- RainbowKit + Wagmi
- Telegram Mini Apps

**Infrastructure**
- Docker + Docker Compose
- PostgreSQL 15
- Redis 7

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/CryptoScannerBot.git
cd CryptoScannerBot
```

2. Create environment file:

```bash
# Backend .env
cd src/backend
cp .env.example .env
```

Add your configuration to `.env`:

```env
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/cryptobot_db
REDIS_URL=redis://localhost:6379
```

3. Start Docker services:

```bash
cd src/backend
docker-compose up -d
```

4. Install dependencies and run migrations:

```bash
npm install
npx prisma migrate deploy
```

5. Start the backend:

```bash
npm run dev
```

6. (Optional) Start the frontend:

```bash
cd ../../
npm install
npm run dev
```

### Usage

1. Open your Telegram bot
2. Send `/start` to begin
3. Click "🔔 Создать алерт" to create a new price alert
4. Follow the prompts to select chain, token, and price conditions

## Project Structure

```
CryptoScannerBot/
├── src/
│   ├── backend/           # Node.js backend & Telegram bot
│   │   ├── src/
│   │   │   ├── bot/       # Grammy bot handlers
│   │   │   ├── queues/    # BullMQ workers
│   │   │   └── services/  # Business logic
│   │   ├── prisma/        # Database schema & migrations
│   │   └── docker-compose.yml
│   └── components/        # React components
└── README.md
```

## License

MIT
