const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const currencyPairs = [
  "AUD/NZD", "EUR/SGD", "GBP/NZD", "NZD/CAD", "NZD/CHF", "NZD/USD",
  "USD/BDT", "USD/BRL", "USD/COP", "USD/DZD", "USD/EGP", "USD/INR",
  "USD/NGN", "USD/PKR", "USD/PHP", "USD/TRY", "UKBrent", "USCrude"
];

const timeframes = ["10S", "30S", "1min", "3min", "5min"];

const userState = {};

// Helper to group buttons side-by-side
const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// Start command - show pair selection
bot.start((ctx) => {
  userState[ctx.chat.id] = {};
  ctx.reply("👋 Welcome! Please select a currency pair:", Markup.keyboard(
    [...chunk(currencyPairs, 2), ["🔙 Back"]]
  ).resize());
});

// Handle currency pair selection
bot.hears(currencyPairs, (ctx) => {
  const pair = ctx.message.text;
  userState[ctx.chat.id].pair = pair;

  ctx.reply(`📊 Selected Pair: ${pair}\n\nNow select a timeframe:`, Markup.keyboard(
    [...chunk(timeframes, 2), ["🔙 Back"]]
  ).resize());
});

// Handle timeframe selection
bot.hears(timeframes, (ctx) => {
  const time = ctx.message.text;
  userState[ctx.chat.id].time = time;

  const prediction = Math.random() > 0.5 ? '⬆️' : '⬇️';
  ctx.reply(`📈 Signal for ${userState[ctx.chat.id].pair} @ ${time}:`);
  ctx.reply(prediction, Markup.keyboard([
    ["📈 Next Signal", "🔙 Back"]
  ]).resize());
});

// Handle next signal request
bot.hears("📈 Next Signal", (ctx) => {
  const prediction = Math.random() > 0.5 ? '⬆️' : '⬇️';
  ctx.reply(prediction, Markup.keyboard([
    ["📈 Next Signal", "🔙 Back"]
  ]).resize());
});

// Handle back navigation
bot.hears("🔙 Back", (ctx) => {
  const state = userState[ctx.chat.id];

  if (!state.pair) {
    // Already at main
    ctx.reply("👋 Welcome! Please select a currency pair:", Markup.keyboard(
      [...chunk(currencyPairs, 2), ["🔙 Back"]]
    ).resize());
  } else if (state.pair && !state.time) {
    // Go back to pair selection
    state.pair = null;
    ctx.reply("👋 Welcome! Please select a currency pair:", Markup.keyboard(
      [...chunk(currencyPairs, 2), ["🔙 Back"]]
    ).resize());
  } else if (state.pair && state.time) {
    // Go back to timeframe selection
    state.time = null;
    ctx.reply(`📊 Selected Pair: ${state.pair}\n\nNow select a timeframe:`, Markup.keyboard(
      [...chunk(timeframes, 2), ["🔙 Back"]]
    ).resize());
  }
});

// Webhook handler for Netlify
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);

    return {
      statusCode: 200,
      body: "Success",
    };
  } catch (err) {
    console.error("Error in Telegram handler:", err);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
