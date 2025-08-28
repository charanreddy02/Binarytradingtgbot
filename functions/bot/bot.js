const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

const krakenPairs = {
  "EURUSD": "EURUSD",
  "GBPUSD": "GBPUSD",
  "USDJPY": "USDJPY",
  "EURJPY": "EURJPY",
  "GBPJPY": "GBPJPY",
  "AUDJPY": "AUDJPY",
  "AUDUSD": "AUDUSD",
  "USDCAD": "USDCAD",
  "USDCHF": "USDCHF",
  "NZDUSD": "NZDUSD",
  "EURGBP": "EURGBP",
  "USDTRY": "USDTRY",
  "USDINR": "USDINR",
  "USDBRL": "USDBRL",
  "USDPHP": "USDPHP",
  "NZDJPY": "NZDJPY"
};

// ✅ Only allow 1m, 3m, 5m
const timeframes = ["1", "3", "5"];

const userSession = {};

const getReplyKeyboard = (items, rowSize = 2, extraButtons = []) => {
  const keyboard = [];
  for (let i = 0; i < items.length; i += rowSize) {
    keyboard.push(items.slice(i, i + rowSize));
  }
  if (extraButtons.length) keyboard.push(extraButtons);
  return { keyboard, resize_keyboard: true };
};

// SMA calculation
function sma(values, period = 3) {
  if (values.length < period) return values[values.length - 1];
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Fetch candles from Kraken
async function fetchCandles(pair, interval) {
  const url = `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`;
  const { data } = await axios.get(url);
  const pairKey = Object.keys(data.result).find((k) => k !== "last");
  return data.result[pairKey];
}

// Prediction logic
async function generatePrediction(pair, timeframe) {
  try {
    const candles = await fetchCandles(krakenPairs[pair], timeframe);

    if (!candles || candles.length < 5) {
      return {
        text: `⚠️ Not enough data for ${pair} at timeframe ${timeframe}m`,
        parse_mode: "HTML"
      };
    }

    const closes = candles.slice(-5).map((c) => parseFloat(c[4]));
    const lastClose = closes[closes.length - 1];
    const avgClose = sma(closes);

    let prediction = "➖ No Significant Change";
    let emoji = "➖";
    let trendIcon = "➖";

    if (lastClose > avgClose) {
      prediction = "📈 UP (trend rising)";
      emoji = "⬆️";
      trendIcon = "📈";
    } else if (lastClose < avgClose) {
      prediction = "📉 DOWN (trend falling)";
      emoji = "⬇️";
      trendIcon = "📉";
    }

    const formattedText = `

${emoji.repeat(5)}
𝗣𝗥𝗘𝗗𝗜𝗖𝗧𝗜𝗢𝗡: ${prediction} ${trendIcon}
𝗣𝗔𝗜𝗥: ${pair}
𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠𝗘: ${timeframe}m`.trim();

    return { text: formattedText, parse_mode: "HTML" };
  } catch (err) {
    console.error("Prediction Error:", err);
    return {
      text: "⚠️ Error fetching market data.",
      parse_mode: "HTML"
    };
  }
}

// Bot Start
bot.start((ctx) => {
  userSession[ctx.chat.id] = {};
  return ctx.reply(
    "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
    { reply_markup: getReplyKeyboard(Object.keys(krakenPairs), 2, ["🔙 Back"]) }
  );
});

// Handle pair selection
bot.hears(Object.keys(krakenPairs), async (ctx) => {
  const pair = ctx.message.text;
  if (!userSession[ctx.chat.id]) userSession[ctx.chat.id] = {};
  userSession[ctx.chat.id].pair = pair;

  return ctx.reply(
    `📊 Selected Pair: ${pair}\n\nSelect a timeframe (1m, 3m, or 5m):`,
    { reply_markup: getReplyKeyboard(timeframes, 3, ["🔙 Back"]) }
  );
});

// Handle timeframe selection
bot.hears(timeframes, async (ctx) => {
  const chatId = ctx.chat.id;
  const session = userSession[chatId];

  if (!session?.pair) {
    return ctx.reply("Please select a currency pair first.");
  }

  session.time = ctx.message.text;
  const { text, parse_mode } = await generatePrediction(session.pair, session.time);

  await ctx.reply(text, { parse_mode });

  return ctx.reply("Get the next signal or go back:", {
    reply_markup: getReplyKeyboard(["📈 Next Signal", "🔙 Back"], 2)
  });
});

// Next Signal
bot.hears("📈 Next Signal", async (ctx) => {
  const session = userSession[ctx.chat.id];
  if (!session?.pair || !session?.time) {
    return ctx.reply("Please select pair and timeframe first.");
  }

  const { text, parse_mode } = await generatePrediction(session.pair, session.time);
  return ctx.reply(text, { parse_mode });
});

// Back button
bot.hears("🔙 Back", async (ctx) => {
  const session = userSession[ctx.chat.id];

  if (session?.time) {
    delete session.time;
    return ctx.reply(
      `📊 Selected Pair: ${session.pair}\n\nSelect a timeframe (1m, 3m, or 5m):`,
      { reply_markup: getReplyKeyboard(timeframes, 3, ["🔙 Back"]) }
    );
  } else if (session?.pair) {
    delete session.pair;
    return ctx.reply(
      "👋 Please select a currency pair again:",
      { reply_markup: getReplyKeyboard(Object.keys(krakenPairs), 2, ["🔙 Back"]) }
    );
  } else {
    return ctx.reply(
      "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
      { reply_markup: getReplyKeyboard(Object.keys(krakenPairs), 2, ["🔙 Back"]) }
    );
  }
});

// Netlify handler
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);

    return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
  } catch (error) {
    console.error("Telegram Bot Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
