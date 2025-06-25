const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const currencyPairs = [ "AUD/NZD", "EUR/SGD", "GBP/NZD", "NZD/CAD", "NZD/CHF", "NZD/USD", "USD/BDT", "USD/BRL", "USD/COP", "USD/DZD", "USD/EGP", "USD/INR", "USD/NGN", "USD/PKR", "USD/PHP", "USD/TRY", "UKBrent", "USCrude" ];

const timeframes = ["10S", "30S", "1min", "3min", "5min"]; const userState = {};

bot.start((ctx) => { userState[ctx.chat.id] = {}; return ctx.reply("👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:", { reply_markup: { inline_keyboard: currencyPairs.map((pair) => [ { text: pair, callback_data: PAIR_${pair} } ]) } }); });

bot.action(/^PAIR_.+/, async (ctx) => { await ctx.answerCbQuery(); const pair = ctx.match[0].replace("PAIR_", ""); userState[ctx.chat.id].pair = pair;

return ctx.editMessageText(📊 Selected Pair: ${pair}\n\nSelect a timeframe:, { reply_markup: { inline_keyboard: timeframes.map((t) => [ { text: t, callback_data: TIME_${t} } ]).concat([[ { text: "🔙 Back", callback_data: "BACK_TO_PAIRS" } ]]) } }); });

bot.action(/^TIME_.+/, async (ctx) => { await ctx.answerCbQuery(); const time = ctx.match[0].replace("TIME_", ""); userState[ctx.chat.id].time = time;

const prediction = Math.random() > 0.5 ? "⬆️" : "⬇️"; await ctx.reply(prediction);

return ctx.reply("Get the next signal or go back:", { reply_markup: { inline_keyboard: [ [{ text: "📈 Next Signal", callback_data: "NEXT_SIGNAL" }], [{ text: "🔙 Back", callback_data: "BACK_TO_TIME" }] ] } }); });

bot.action("NEXT_SIGNAL", async (ctx) => { await ctx.answerCbQuery(); const prediction = Math.random() > 0.5 ? "⬆️" : "⬇️"; await ctx.reply(prediction);

return ctx.reply("Get the next signal or go back:", { reply_markup: { inline_keyboard: [ [{ text: "📈 Next Signal", callback_data: "NEXT_SIGNAL" }], [{ text: "🔙 Back", callback_data: "BACK_TO_TIME" }] ] } }); });

bot.action("BACK_TO_TIME", async (ctx) => { await ctx.answerCbQuery(); const pair = userState[ctx.chat.id].pair; return ctx.editMessageText(📊 Selected Pair: ${pair}\n\nSelect a timeframe:, { reply_markup: { inline_keyboard: timeframes.map((t) => [ { text: t, callback_data: TIME_${t} } ]).concat([[ { text: "🔙 Back", callback_data: "BACK_TO_PAIRS" } ]]) } }); });

bot.action("BACK_TO_PAIRS", async (ctx) => { await ctx.answerCbQuery(); return ctx.editMessageText("👋 Welcome to the Binary Signal AI Bot!\n\nPlease select a currency pair:", { reply_markup: { inline_keyboard: currencyPairs.map((pair) => [ { text: pair, callback_data: PAIR_${pair} } ]) } }); });

exports.handler = async (event) => { try { if (event.httpMethod !== "POST") { return { statusCode: 405, body: "Method Not Allowed" }; }

const update = JSON.parse(event.body);
await bot.handleUpdate(update);

return {
  statusCode: 200,
  body: JSON.stringify({ message: "Success" })
};

} catch (error) { console.error("Error handling update:", error); return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) }; } };

