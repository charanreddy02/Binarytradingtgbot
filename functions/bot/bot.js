const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const currencyPairs = [
  "AUD/NZD", "EUR/SGD", "GBP/NZD", "NZD/CAD", "NZD/CHF", "NZD/USD",
  "USD/BDT", "USD/BRL", "USD/COP", "USD/DZD", "USD/EGP", "USD/INR",
  "USD/NGN", "USD/PKR", "USD/PHP", "USD/TRY", "UKBrent", "USCrude"
];

const timeframes = ["10S", "30S", "1min", "3min", "5min"];

const userSession = {};

bot.start((ctx) => {
  userSession[ctx.chat.id] = {};
  return ctx.reply(
    '👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:',
    Markup.inlineKeyboard(
      currencyPairs.map((pair) => [Markup.button.callback(pair, `PAIR_${pair}`)])
    )
  );
});

bot.action(/^PAIR_.+/, async (ctx) => {
  const pair = ctx.match[0].replace('PAIR_', '');
  userSession[ctx.chat.id].pair = pair;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `📊 Selected Pair: ${pair}\n\nSelect a timeframe:`,
    Markup.inlineKeyboard(
      timeframes.map((t) => [Markup.button.callback(t, `TIME_${t}`)]).concat([
        [Markup.button.callback("🔙 Back", "BACK_TO_PAIRS")]
      ])
    )
  );
});

bot.action(/^TIME_.+/, async (ctx) => {
  const time = ctx.match[0].replace('TIME_', '');
  const chatId = ctx.chat.id;
  userSession[chatId].time = time;

  await ctx.answerCbQuery();

  const prediction = Math.random() > 0.5 ? "⬆️" : "⬇️";
  await ctx.reply(prediction); // Big emoji style

  return ctx.reply(
    "Get the next signal or go back:",
    Markup.inlineKeyboard([
      [Markup.button.callback("📈 Next Signal", "NEXT_SIGNAL")],
      [Markup.button.callback("🔙 Back", "BACK_TO_TIME")]
    ])
  );
});

bot.action("NEXT_SIGNAL", async (ctx) => {
  await ctx.answerCbQuery();

  const prediction = Math.random() > 0.5 ? "⬆️" : "⬇️";
  await ctx.reply(prediction);

  return ctx.reply(
    "Get the next signal or go back:",
    Markup.inlineKeyboard([
      [Markup.button.callback("📈 Next Signal", "NEXT_SIGNAL")],
      [Markup.button.callback("🔙 Back", "BACK_TO_TIME")]
    ])
  );
});

bot.action("BACK_TO_TIME", async (ctx) => {
  const chatId = ctx.chat.id;
  const pair = userSession[chatId]?.pair || "Not selected";

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `📊 Selected Pair: ${pair}\n\nSelect a timeframe:`,
    Markup.inlineKeyboard(
      timeframes.map((t) => [Markup.button.callback(t, `TIME_${t}`)]).concat([
        [Markup.button.callback("🔙 Back", "BACK_TO_PAIRS")]
      ])
    )
  );
});

bot.action("BACK_TO_PAIRS", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    '👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:',
    Markup.inlineKeyboard(
      currencyPairs.map((pair) => [Markup.button.callback(pair, `PAIR_${pair}`)])
    )
  );
});

// Netlify webhook export
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (error) {
    console.error("Error handling update:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
