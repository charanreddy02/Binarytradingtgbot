const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// /start command with ONLY your message
bot.start((ctx) => {
  const message = `
👋🤖 Hi, are you ready to get a unique trading robot based on OpenAI in conjunction with 30 indicators?

🏆 I want to tell you right away that this is not gold bars that will come to your hands by themselves.

This is a shovel that you can use to dig out your gold!

✔️ Trading is a path you have to take yourself! And this bot will help you to do it! I spent a lot of money and time to make this bot free for everyone. You need to follow some simple steps to get started, it will take you 10 minutes.

Click the "Get access to bot" button and you'll get instructions to get started!
  `;

  return ctx.reply(message.trim(), {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Get access to bot 🤖", url: "https://stake.bet/?c=stakeminertg" }],
      ],
    },
  });
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
