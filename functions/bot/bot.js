const { Telegraf } = require("telegraf");

// Initialize bot with token from environment variable
const bot = new Telegraf(process.env.BOT_TOKEN);

// State tracking (Note: This will reset between function calls)
const userState = {};

// Image range and sent images tracker
const startIndex = 17;
const endIndex = 24;
let sentImages = [];

// Function to get the next image
const getNextImage = () => {
  const allImages = Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
  const remainingImages = allImages.filter((image) => !sentImages.includes(image));

  if (remainingImages.length === 0) {
    sentImages = [];
    return getNextImage();
  }

  const randomIndex = Math.floor(Math.random() * remainingImages.length);
  const selectedImage = remainingImages[randomIndex];
  sentImages.push(selectedImage);

  return `https://t.me/minespredictorcs/${selectedImage}`;
};

// Start command
bot.start((ctx) => {
  return ctx.reply("Register here to access to powerfull Stake Mines Bot👇🏻", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Click to register", url: "stake.bet/?c=stakeminertg" }],
        [{ text: "START STAKE MINES 3.0 Bot 💣", callback_data: "start_stake_mines" }],
      ],
    },
  });
});

// Handle "START STAKE MINES 3.0 Bot 💣"
bot.action("start_stake_mines", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Choose the number of mines you want ⬇️", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "1", callback_data: "mines_1" }],
        [{ text: "2", callback_data: "mines_2" }],
        [{ text: "3", callback_data: "mines_3" }],
        [{ text: "4", callback_data: "mines_4" }],
        [{ text: "5", callback_data: "mines_5" }],
      ],
    },
  });
});

// Handle mines selection
bot.action(/^mines_\d$/, async (ctx) => {
  await ctx.answerCbQuery();
  const mines = ctx.match[0].split("_")[1];
  userState[ctx.chat.id] = { mines };

  await ctx.replyWithPhoto("https://t.me/minesassetscs/2", { caption: "Follow the instructions and copy code from stake 💰" });
  return ctx.reply(`Enter Server Seed From Stake 🤖 ⬇️:`, { parse_mode: "HTML" });
});

// Handle server seed input
bot.on("text", async (ctx) => {
  const userId = ctx.chat.id;

  // If user is providing the initial server seed
  if (userState[userId] && !userState[userId].serverSeed) {
    userState[userId].serverSeed = ctx.message.text;

    await ctx.reply("Seed Input Successful ✅");
    await ctx.reply("Calculating Result........");

    const photoUrl = getNextImage();
    return ctx.replyWithPhoto(photoUrl, {
      caption: "Prediction with 98% accuracy ✅💎!",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Generate New Prediction 🚀", callback_data: "generate_new_prediction" }],
          [{ text: "Want to change mines 💣 ?", callback_data: "change_mines" }],
        ],
      },
    });
  }

  // If user is changing the server seed
  if (userState[userId] && userState[userId].isChangingSeed) {
    userState[userId].serverSeed = ctx.message.text;
    userState[userId].isChangingSeed = false;

    await ctx.reply("Seed Input Successful ✅");
    await ctx.reply("Calculating Result...");

    const photoUrl = getNextImage();
    return ctx.replyWithPhoto(photoUrl, {
      caption: "Prediction with 98% accuracy ✅💎!",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Generate New Prediction 🚀", callback_data: "generate_new_prediction" }],
          [{ text: "Want to change mines 💣 ?", callback_data: "change_mines" }],
        ],
      },
    });
  }
});

// Handle Generate New Prediction
bot.action("generate_new_prediction", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Do you want to change the server seed?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Continue with this seed ▶️", callback_data: "continue_with_seed" }],
        [{ text: "Change server seed 🔁", callback_data: "change_server_seed" }],
      ],
    },
  });
});

// Handle continuing with the current seed
bot.action("continue_with_seed", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Calculating Result...");

  const photoUrl = getNextImage();
  return ctx.replyWithPhoto(photoUrl, {
    caption: "Prediction with 98% accuracy ✅💎!",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Generate New Prediction 🚀", callback_data: "generate_new_prediction" }],
        [{ text: "Want to change mines 💣 ?", callback_data: "change_mines" }],
      ],
    },
  });
});

// Handle changing the server seed
bot.action("change_server_seed", async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.chat.id;

  if (userState[userId]) {
    userState[userId].isChangingSeed = true;
  }

  await ctx.replyWithPhoto("https://t.me/minesassetscs/2", { caption: "Follow the instructions!" });
  return ctx.reply("Enter new Server Seed From Stake 🤖 ⬇️:");
});

// Handle changing mines
bot.action("change_mines", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Choose the number of mines you want ⬇️", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "1", callback_data: "mines_1" }],
        [{ text: "2", callback_data: "mines_2" }],
        [{ text: "3", callback_data: "mines_3" }],
        [{ text: "4", callback_data: "mines_4" }],
        [{ text: "5", callback_data: "mines_5" }],
      ],
    },
  });
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
