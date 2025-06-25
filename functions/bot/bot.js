const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const apiKey = "j9iuzH5Rz5TfnIUokQoZ9jLF";

const currencyPairs = [
  "AUD/NZD",
  "EUR/SGD",
  "GBP/NZD",
  "NZD/CAD",
  "NZD/CHF",
  "NZD/USD",
  "USD/BDT",
  "USD/BRL",
  "USD/COP",
  "USD/DZD",
  "USD/EGP",
  "USD/INR",
  "USD/NGN",
  "USD/PKR",
  "USD/PHP",
  "USD/TRY",
  "UKBrent",
  "USCrude"
];

const timeframes = ["10S", "30S", "1min", "3min", "5min"];
const userSession = {};

const getReplyKeyboard = (items, rowSize = 2, extraButtons = []) => {
  const keyboard = [];
  for (let i = 0; i < items.length; i += rowSize) {
    keyboard.push(items.slice(i, i + rowSize));
  }
  if (extraButtons.length) keyboard.push(extraButtons);
  return { keyboard, resize_keyboard: true };
};

bot.start((ctx) => {
  userSession[ctx.chat.id] = {};
  return ctx.reply(
    "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
    { reply_markup: getReplyKeyboard(currencyPairs, 2, ["🔙 Back"]) }
  );
});

bot.hears(currencyPairs, async (ctx) => {
  const pair = ctx.message.text;
  if (!userSession[ctx.chat.id]) {
    userSession[ctx.chat.id] = {};
  }
  userSession[ctx.chat.id].pair = pair;
  return ctx.reply(
    `📊 Selected Pair: ${pair}\n\nSelect a timeframe:`,
    { reply_markup: getReplyKeyboard(timeframes, 2, ["🔙 Back"]) }
  );
});

async function generatePrediction(pair, time) {
  try {
    const encodedPair = encodeURIComponent(pair);
    const url = `https://fcsapi.com/api-v3/forex/latest?symbol=${encodedPair}&access_key=${encodeURIComponent(apiKey)}`;

    const { data } = await axios.get(url);
    const res = data?.response?.[0];
    if (!res) {
      return {
        text: `⚠️ Insufficient data for ${pair} at ${time} timeframe.`,
        parse_mode: "HTML"
      };
    }

    const open = parseFloat(res.o);
    const close = parseFloat(res.c);
    const trend = close > open ? "UP" : "DOWN";
    const emoji = trend === "UP" ? "⬆️" : "⬇️";
    const trendIcon = trend === "UP" ? "📈" : "📉";

    const formattedText = `

${emoji.repeat(5)}
𝗣𝗥𝗘𝗗𝗜𝗖𝗧𝗜𝗢𝗡: ${trend} ${trendIcon}
𝗣𝗔𝗜𝗥: ${pair}
𝗧𝗜𝗠𝗘𝗙𝗥𝗔𝗠𝗘: ${time}`.trim();

    return { text: formattedText, parse_mode: "HTML" };

  } catch (err) {
    return {
      text: "⚠️ Error fetching market data. Prediction unavailable.",
      parse_mode: "HTML"
    };
  }
}

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

bot.hears("📈 Next Signal", async (ctx) => {
  const session = userSession[ctx.chat.id];
  if (!session?.pair || !session?.time) {
    return ctx.reply("Please select pair and time first.");
  }

  const { text, parse_mode } = await generatePrediction(session.pair, session.time);
  return ctx.reply(text, { parse_mode });
});

bot.hears("🔙 Back", async (ctx) => {
  const session = userSession[ctx.chat.id];

  if (session?.time) {
    delete session.time;
    return ctx.reply(
      `📊 Selected Pair: ${session.pair}\n\nSelect a timeframe:`,
      { reply_markup: getReplyKeyboard(timeframes, 2, ["🔙 Back"]) }
    );
  } else if (session?.pair) {
    delete session.pair;
    return ctx.reply(
      "👋 Please select a currency pair again:",
      { reply_markup: getReplyKeyboard(currencyPairs, 2, ["🔙 Back"]) }
    );
  } else {
    return ctx.reply(
      "👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:",
      { reply_markup: getReplyKeyboard(currencyPairs, 2, ["🔙 Back"]) }
    );
  }
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" })
    };

  } catch (error) {
    console.error("Telegram Bot Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
