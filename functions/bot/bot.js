// telegram-bot-netlify/functions/bot.js

const { Telegraf, Markup } = require('telegraf'); const axios = require('axios'); const bot = new Telegraf(process.env.BOT_TOKEN);

const pairs = [ "AUD/NZD", "EUR/SGD", "GBP/NZD", "NZD/CAD", "NZD/CHF", "NZD/USD", "USD/BDT", "USD/BRL", "USD/COP", "USD/DZD", "USD/EGP", "USD/INR", "USD/NGN", "USD/PKR", "USD/PHP", "USD/TRY", "UKBrent", "USCrude" ];

const timeFrames = ["10 seconds", "30 seconds", "1 min", "3 min", "5 min"];

let userState = {};

bot.start((ctx) => { userState[ctx.chat.id] = {}; ctx.reply( 🤖 Welcome to Binary AI Signal Bot\n\nI use artificial intelligence to predict market moves.\n\nSelect a currency pair:, Markup.inlineKeyboard(makeButtons(pairs, 'pair_', 2)) ); });

bot.action(/pair_(.+)/, (ctx) => { const pair = ctx.match[1]; userState[ctx.chat.id].pair = pair; ctx.editMessageText( Selected pair: ${pair}\n\nNow select a time frame:, Markup.inlineKeyboard([ ...makeButtons(timeFrames, 'time_', 2), [Markup.button.callback('🔙 Back', 'back_pairs')] ]) ); });

bot.action(/time_(.+)/, async (ctx) => { const time = ctx.match[1]; const { pair } = userState[ctx.chat.id]; userState[ctx.chat.id].time = time;

ctx.editMessageText(Analyzing market data for ${pair} - ${time}...);

const prediction = await generatePrediction(pair, time);

ctx.replyWithMarkdown( 📈 *Pair:* ${pair}\n⏱ *Timeframe:* ${time}\n\n${prediction}, Markup.inlineKeyboard([ [Markup.button.callback('➡️ Next Signal', 'next_signal')], [Markup.button.callback('🔙 Back', 'back_time')] ]) ); });

bot.action('next_signal', async (ctx) => { const { pair, time } = userState[ctx.chat.id]; const prediction = await generatePrediction(pair, time); ctx.editMessageText( 📈 *Pair:* ${pair}\n⏱ *Timeframe:* ${time}\n\n${prediction}, Markup.inlineKeyboard([ [Markup.button.callback('➡️ Next Signal', 'next_signal')], [Markup.button.callback('🔙 Back', 'back_time')] ]) ); });

bot.action('back_time', (ctx) => { ctx.editMessageText( Select a time frame:, Markup.inlineKeyboard([ ...makeButtons(timeFrames, 'time_', 2), [Markup.button.callback('🔙 Back', 'back_pairs')] ]) ); });

bot.action('back_pairs', (ctx) => { ctx.editMessageText( Select a currency pair:, Markup.inlineKeyboard(makeButtons(pairs, 'pair_', 2)) ); });

function makeButtons(list, prefix, row = 2) { const buttons = []; for (let i = 0; i < list.length; i += row) { buttons.push( list.slice(i, i + row).map((item) => Markup.button.callback(item, ${prefix}${item}) ) ); } return buttons; }

async function generatePrediction(pair, timeframe) { try { // Simulated historical price fetch (you can replace this with a real API call) const history = await mockFetchHistoricalData(pair, timeframe);

if (!history || history.length < 5) {
  return `⚠️ Insufficient data to make a reliable prediction.`;
}

// Simple logic based on price trend
const trend = history[history.length - 1] - history[0];
const volatility = Math.max(...history) - Math.min(...history);

let reasoning = `Analyzed last ${history.length} data points. Volatility: ${volatility.toFixed(4)}.`;
let prediction = '';

if (Math.abs(trend) < 0.001) {
  prediction = `⚠️ Market is moving sideways with low trend. Prediction: uncertain.`;
} else if (trend > 0) {
  prediction = `⬆️ *Prediction: UP*\nReasoning: Recent trend is upward.`;
} else {
  prediction = `⬇️ *Prediction: DOWN*\nReasoning: Recent trend is downward.`;
}

return `${reasoning}\n\n${prediction}`;

} catch (err) { return ⚠️ Error retrieving data or analyzing prediction.; } }

async function mockFetchHistoricalData(pair, timeframe) { // Replace this with real price data logic/API later const randomPrices = []; let price = 1 + Math.random(); for (let i = 0; i < 10; i++) { const change = (Math.random() - 0.5) * 0.01; price += change; randomPrices.push(Number(price.toFixed(5))); } return randomPrices; }

module.exports = bot;

