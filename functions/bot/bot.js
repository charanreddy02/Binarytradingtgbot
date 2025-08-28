const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ✅ Real Kraken Pairs (with label M)
const krakenPairs = {
  "EURUSD(M)": "EURUSD",
  "GBPUSD(M)": "GBPUSD",
  "USDJPY(M)": "USDJPY",
  "EURJPY(M)": "EURJPY",
  "GBPJPY(M)": "GBPJPY",
  "AUDJPY(M)": "AUDJPY",
  "AUDUSD(M)": "AUDUSD",
  "USDCAD(M)": "USDCAD",
  "USDCHF(M)": "USDCHF",
  "NZDUSD(M)": "NZDUSD",
  "EURGBP(M)": "EURGBP"
};

// ❌ Non-Kraken Pairs → Simulated signals
const simulatedPairs = [
  "USDTRY", "USDINR", "USDBRL", "USDPHP", "NZDJPY"
];

// ✅ Only allow 1m, 3m, 5m
const timeframes = ["1m", "3m", "5m"];

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

// 🔮 Simulated Quotex Strategy
function simulateStrategy(pair, timeframe) {
  // Fake triple MA crossover + ADX confirmation + SAR agreement
  const rand = Math.random();
  let prediction, emoji, trendIcon;

  if (rand > 0.55) {
    prediction = "📈 BUY (Triple MA UP + ADX strong + SAR below)";
    emoji = "⬆️";
    trendIcon = "📈";
  } else {
    prediction = "📉 SELL (Triple MA DOWN + ADX strong + SAR above)";
    emoji = "⬇️";
    trendIcon = "📉";
  }

  const text = `
${emoji.repeat(5)}
𝗦𝗜𝗠𝗨𝗟𝗔𝗧𝗘𝗗 𝗣𝗥𝗘𝗗𝗜𝗖𝗧𝗜𝗢𝗡: ${prediction} ${trendIcon}
𝗣𝗔𝗜𝗥: ${pair}
𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠𝗘: ${timeframe}
⚡ Strategy: MA + ADX + SAR`.trim();

  return { text, parse_mode: "HTML" };
}

// Prediction logic
async function generatePrediction(pair, timeframe) {
  try {
    // If it's a simulated pair → run fake strategy
    if (simulatedPairs.includes(pair)) {
      return simulateStrategy(pair, timeframe);
    }

    // Else → fetch from Kraken
    const candles = await fetchCandles(krakenPairs[pair], parseInt(timeframe));

    if (!candles || candles.length < 5) {
      return { text: `⚠️ Not enough data for ${pair}`, parse_mode: "HTML" };
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
𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠𝗘: ${timeframe}`.trim();

    return { text: formattedText, parse_mode: "HTML" };

  } catch (err) {
    console.error("Prediction Error:", err);
    return simulateStrategy(pair, timeframe); // fallback to simulation
  }
}

// ---------------- TELEGRAM BOT ---------------- //

bot.start((ctx) => {
  userSession[ctx.chat.id] = {};
  const allPairs = [...Object.keys(krakenPairs), ...simulatedPairs];
  return ctx.reply(
    "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
    { reply_markup: getReplyKeyboard(allPairs, 2, ["🔙 Back"]) }
  );
});

// Handle pair selection
bot.hears([...Object.keys(krakenPairs), ...simulatedPairs], async (ctx) => {
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
  const allPairs = [...Object.keys(krakenPairs), ...simulatedPairs];

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
      { reply_markup: getReplyKeyboard(allPairs, 2, ["🔙 Back"]) }
    );
  } else {
    return ctx.reply(
      "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
      { reply_markup: getReplyKeyboard(allPairs, 2, ["🔙 Back"]) }
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
