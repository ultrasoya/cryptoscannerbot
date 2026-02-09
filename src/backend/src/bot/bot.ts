import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import { Chain } from '@prisma/client';
import { getTokenSymbol } from '../utils/getTokenSymbol.js';

import prisma from '../../prisma/prisma.js';
import { getNativeSymbolStatic } from '../utils/getNativeSymbol.js';

const bot = new Bot(process.env.BOT_TOKEN || '');

const userStates = new Map<number, {
    step: 'chain' | 'assetType' | 'address' | 'condition' | 'price';
    chain?: Chain;
    isNative?: boolean;
    tokenAddress?: string;
    symbol?: string;
    condition?: 'ABOVE' | 'BELOW';
}>();

bot.command('start', async (ctx) => {
    const keyboard = new Keyboard()
        .text('🔔 Создать алерт')
        .text('📋 Мои алерты').row()
        .text('❌ Удалить алерт')
        .text('❓ Помощь')
        .resized()
        .persistent();

    await ctx.reply(
        '👋 Привет! Я помогу отслеживать цены токенов.\n\n' +
        'Выберите действие на клавиатуре ниже ⬇️',
        { reply_markup: keyboard }
    );
});

bot.hears('🔔 Создать алерт', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    userStates.set(userId, { step: 'chain' });

    const keyboard = new InlineKeyboard()
        .text('ETH', 'chain_ETH')
        .text('BSC', 'chain_BSC').row()
        .text('SOLANA', 'chain_SOLANA')
        .text("POLYGON", 'chain_POLYGON');

    await ctx.reply('🔔 Создаем новый алерт!\n\nВыберите сеть:', {
        reply_markup: keyboard
    });

});

bot.hears('📋 Мои алерты', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const alerts = await prisma.alert.findMany({
        where: { telegramId: userId.toString(), isActive: true }
    });

    if (alerts.length === 0) {
        await ctx.reply('У вас нет активных алертов.\n\nИспользуйте "🔔 Создать алерт" для создания.');
        return;
    }

    let message = '📋 Ваши активные алерты:\n\n';
    alerts.forEach((alert, index) => {
        message += `${index + 1}. ${alert.symbol || 'TOKEN'}\n`;
        message += `   Сеть: ${alert.chain}\n`;
        message += `   Условие: ${alert.condition === 'ABOVE' ? '📈' : '📉'} $${alert.targetPrice}\n`;
        message += `   ID: ${alert.id}\n\n`;
    });

    await ctx.reply(message);
});

bot.hears('❓ Помощь', async (ctx) => {
    await ctx.reply(
        '❓ Помощь\n\n' +
        '🔔 Создать алерт - Создать новое оповещение о цене\n' +
        '📋 Мои алерты - Посмотреть активные алерты\n' +
        '❌ Удалить алерт - Удалить алерт по ID\n\n' +
        'Просто нажимайте кнопки на клавиатуре!'
    );
});

bot.command('create_alert', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    userStates.set(userId, { step: 'chain' });

    const keyboard = new InlineKeyboard()
        .text('ETH', 'chain_ETH')
        .text('BSC', 'chain_BSC').row()
        .text('SOLANA', 'chain_SOLANA')
        .text("POLYGON", 'chain_POLYGON');

    await ctx.reply('🔔 Создаем новый алерт!\n\nВыберите сеть:', {
        reply_markup: keyboard
    });

});

bot.callbackQuery(/^chain_(.+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const chain = ctx.match[1] as Chain;
    const state = userStates.get(userId);
    if (!state) return;


    state.chain = chain;
    state.step = 'assetType';

    const keyboard = new InlineKeyboard()
        .text('💎 Нативная монета', 'assetType_native')
        .text('🪙 Токен', 'assetType_token');

    await ctx.editMessageText(
        `✅ Сеть: ${chain}\n\nВыберите тип актива:`,
        { reply_markup: keyboard }
    )
});

bot.callbackQuery(/^assetType_(.+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const assetType = ctx.match[1];
    const state = userStates.get(userId);
    if (!state) return;


    if (assetType === 'native') {
        state.isNative = true;
        state.tokenAddress = '';

        if (!state.chain) {
            await ctx.answerCallbackQuery();
            await ctx.reply('❌ Ошибка: сеть не выбрана. Начните заново с /create_alert');
            return
        }
        
        state.symbol = getNativeSymbolStatic(state.chain);
        state.step = 'condition';

        const keyboard = new InlineKeyboard()
            .text('📈 Выше цены', 'cond_ABOVE')
            .text('📉 Ниже цены', 'cond_BELOW')

        await ctx.editMessageText(
            `✅ Актив: ${state.symbol} (нативная монета)\n\nВыберите условие:`,
            { reply_markup: keyboard }
        )

    } 
});

bot.callbackQuery(/^token_(.+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tokenData = ctx.match[1];
    const state = userStates.get(userId);

    if (!state) return;

    if (tokenData === 'custom') {
        state.step = 'address';
        userStates.set(userId, state);
        await ctx.answerCallbackQuery();
        await ctx.editMessageText('Отправьте адрес токена (contract address):');
    } else {
        const address = tokenData;
        if (!address) {
            await ctx.answerCallbackQuery();
            await ctx.reply('❌ Ошибка: не удалось получить адрес токена');
            return;
        }

        if (!state.chain) {
            await ctx.answerCallbackQuery();
            await ctx.reply('❌ Ошибка: сеть не выбрана. Начните заново с /create_alert');
            return
        }
        state.tokenAddress = address;
        state.symbol = await getTokenSymbol(address, state.chain);
        state.step = 'condition';
        userStates.set(userId, state);

        const keyboard = new InlineKeyboard()
            .text('📈 Выше цены', 'cond_ABOVE')
            .text('📉 Ниже цены', 'cond_BELOW');

        await ctx.answerCallbackQuery();
        await ctx.editMessageText(
            `✅ Токен: ${state.symbol}\n\nВыберите условие:`,
            { reply_markup: keyboard }
        );
    }

});

bot.on('message:text', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = userStates.get(userId);
    if (!state) return;

    if (state.step === 'address') {
        const address = ctx.message.text;

        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            await ctx.reply('❌ Неверный формат адреса. Попробуйте снова:');
            return;
        }

        if (!state.chain) {
            await ctx.reply('❌ Ошибка состояния. Начните заново с /create_alert');
            userStates.delete(userId);
            return;
        }

        state.tokenAddress = address;
        state.symbol = await getTokenSymbol(state.tokenAddress, state.chain); // TODO: получить символ токена
        state.step = 'condition';
        userStates.set(userId, state);

        const keyboard = new InlineKeyboard()
            .text('📈 Выше цены', 'cond_ABOVE')
            .text('📉 Ниже цены', 'cond_BELOW');

        await ctx.reply(
            `✅ Токен: ${state.symbol}\n\nВыберите условие:`,
            { reply_markup: keyboard }
        );
    } else if (state.step === 'price') {
        const price = parseFloat(ctx.message.text);

        if (isNaN(price) || price <= 0) {
            await ctx.reply('❌ Неверная цена. Введите число больше 0:');
            return;
        }

        if (!state.chain || !state.tokenAddress || !state.symbol || !state.condition) {
            await ctx.reply('❌ Ошибка: не все данные заполнены. Начните заново с /create_alert');
            userStates.delete(userId);
            return;
        }

        await prisma.alert.create({
            data: {
                telegramId: userId.toString(),
                chain: state.chain,
                tokenAddress: state.tokenAddress,
                symbol: state.symbol,
                targetPrice: price,
                condition: state.condition,
                isActive: true
            }
        });

        await ctx.reply(
            `✅ Алерт создан!\n\n` +
            `📊 Детали:\n` +
            `• Токен: ${state.symbol} (${state.tokenAddress})\n` +
            `• Сеть: ${state.chain}\n` +
            `• Условие: Цена ${state.condition === 'ABOVE' ? 'выше' : 'ниже'} $${price}\n` +
            `• Статус: Активен ✅\n\n` +
            `Я уведомлю вас, когда условие выполнится!`
        );

        userStates.delete(userId);
    }

});

bot.callbackQuery(/^cond_(.+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const condition = ctx.match[1] as 'ABOVE' | 'BELOW';
    const state = userStates.get(userId);

    if (state) {
        state.condition = condition;
        state.step = 'price';
        userStates.set(userId, state);
    }

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
        `✅ Условие: ${condition === 'ABOVE' ? 'Выше' : 'Ниже'}\n\n` +
        `Введите целевую цену в USD:`
    );

});

bot.command('my_alerts', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const alerts = await prisma.alert.findMany({
        where: { telegramId: userId.toString(), isActive: true }
    });

    if (alerts.length === 0) {
        await ctx.reply('У вас нет активных алертов.\n\nИспользуйте /create_alert для создания.');
        return;
    }

    let message = '📋 Ваши активные алерты:\n\n';
    alerts.forEach((alert, index) => {
        message += `${index + 1}. ${alert.symbol || 'TOKEN'}\n`;
        message += `   Сеть: ${alert.chain}\n`;
        message += `   Условие: ${alert.condition === 'ABOVE' ? '📈' : '📉'} $${alert.targetPrice}\n`;
        message += `   ID: ${alert.id}\n\n`;
    });

    await ctx.reply(message);
});

export { bot };