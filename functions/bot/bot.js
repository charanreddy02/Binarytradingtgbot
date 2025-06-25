// telegram-bot.js 
import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

const currencyPairs = [ "AUD/NZD", "EUR/SGD", "GBP/NZD", "NZD/CAD", "NZD/CHF", "NZD/USD", "USD/BDT", "USD/BRL", "USD/COP", "USD/DZD", "USD/EGP", "USD/INR", "USD/NGN", "USD/PKR", "USD/PHP", "USD/TRY", "UKBrent", "USCrude" ];

const timeframes = ["10S", "30S", "1min", "3min", "5min"];

const userSession = {}; // { chatId: { pair: '', time: '' } }

bot.start((ctx) => { userSession[ctx.chat.id] = {}; ctx.reply( '👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:', Markup.inlineKeyboard( currencyPairs.map((pair) => [Markup.button.callback(pair, PAIR_${pair})]) ) ); });

bot.action(/PAIR_.+/, async (ctx) => { const pair = ctx.match[0].replace('PAIR_', ''); userSession[ctx.chat.id].pair = pair;

await ctx.editMessageText( 📊 Selected Pair: ${pair}\n\nSelect a timeframe:, Markup.inlineKeyboard( timeframes.map((t) => [Markup.button.callback(t, TIME_${t})]).concat([ [Markup.button.callback('🔙 Back', 'BACK_TO_PAIRS')] ]) ) ); });

bot.action(/TIME_.+/, async (ctx) => { const time = ctx.match[0].replace('TIME_', ''); userSession[ctx.chat.id].time = time;

const pair = userSession[ctx.chat.id].pair;

// Simulate logic for prediction (random here, but you can replace it) 
const prediction = Math.random() > 0.5 ? '⬆️' : '⬇️';

await ctx.reply(prediction);

await ctx.reply( 'Get the next signal or go back:', Markup.inlineKeyboard([ [Markup.button.callback('📈 Next Signal', 'NEXT_SIGNAL')], [Markup.button.callback('🔙 Back', 'BACK_TO_TIME')] ]) ); });

bot.action('NEXT_SIGNAL', async (ctx) => { const prediction = Math.random() > 0.5 ? '⬆️' : '⬇️'; await ctx.reply(prediction);

await ctx.reply( 'Get the next signal or go back:', Markup.inlineKeyboard([ [Markup.button.callback('📈 Next Signal', 'NEXT_SIGNAL')], [Markup.button.callback('🔙 Back', 'BACK_TO_TIME')] ]) ); });

bot.action('BACK_TO_TIME', async (ctx) => { const pair = userSession[ctx.chat.id].pair; await ctx.editMessageText( 📊 Selected Pair: ${pair}\n\nSelect a timeframe:, Markup.inlineKeyboard( timeframes.map((t) => [Markup.button.callback(t, TIME_${t})]).concat([ [Markup.button.callback('🔙 Back', 'BACK_TO_PAIRS')] ]) ) ); });

bot.action('BACK_TO_PAIRS', async (ctx) => { await ctx.editMessageText( '👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:', Markup.inlineKeyboard( currencyPairs.map((pair) => [Markup.button.callback(pair, PAIR_${pair})]) ) ); });

export default bot.handler();
