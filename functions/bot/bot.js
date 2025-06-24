const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 5466636474;
const verifiedPath = path.join(__dirname, "verified-ids.json");

const loadVerifiedIds = () => {
  try {
    const data = fs.readFileSync(verifiedPath);
    return JSON.parse(data);
  } catch {
    fs.writeFileSync(verifiedPath, JSON.stringify([]));
    return [];
  }
};

const saveVerifiedIds = (ids) => {
  fs.writeFileSync(verifiedPath, JSON.stringify(ids));
};

let userState = {};

bot.start((ctx) => {
  if (ctx.chat.id === ADMIN_ID) {
    return ctx.reply(
      "🔧 Admin Commands:\n/adduser <id>\n/deleteuser <id>\n/userlist\n/stats"
    );
  } else {
    return ctx.reply(
      "👋🤖 Hi, are you ready to get a unique trading robot based on OpenAI in conjunction with 30 indicators?\n\nThis is a shovel that you can use to dig out your gold!\n✔️ Trading is a path you have to take yourself! This bot will help you.\nClick 'Get access to bot' to start!",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱Main Menu📱", callback_data: "main_menu" }],
          ],
        },
      }
    );
  }
});

bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply(
    "<b>Main menu of Trade Mind Ai📈</b>\n\n<code>Use this bot to get trading signals and insights.\nFollow steps to unlock full access!</code>",
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

bot.action("how_it_works", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.replyWithHTML(
    "<b>Trade Mind Ai:</b> Uses AI + technical/volume analysis to generate signals.\n\nSelf-learning engine. Free to use."
  );
});

bot.action("trade", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("Access Denied, please complete the registration.❌");
});

bot.action("full_access", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.replyWithHTML(
    `To get full access, register using our affiliate link:

👉 <a href="https://broker-qx.pro/sign-up/?lid=1349529">Click to Register</a>

After registration, click 'Enter ID' to submit your Quotex ID.`,
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
          [{ text: "Back", callback_data: "main_menu" }],
        ],
      },
    }
  );
});

bot.action("enter_id", async (ctx) => {
  await ctx.answerCbQuery();
  userState[ctx.chat.id] = { enteringId: true };
  return ctx.reply("❗Enter your Quotex ID:", {
    reply_markup: {
      inline_keyboard: [[{ text: "↩️ Back", callback_data: "full_access" }]],
    },
  });
});

bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const message = ctx.message.text.trim();

  if (userState[chatId]?.enteringId) {
    userState[chatId].enteringId = false;

    await ctx.reply(
      `✅ Your ID ${message} has been received and is under review.`
    );
    await ctx.reply(
      "⌛ Checking your ID for registration, please expect ~1-2 minutes..."
    );

    try {
      await bot.telegram.sendMessage(
        ADMIN_ID,
        `👤 New ID submitted for approval: ${message}\nFrom user: @${
          ctx.from.username || "(no username)"
        } (ID: ${chatId})`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Approve",
                  callback_data: `approve_${message}_${chatId}`,
                },
                { text: "❌ Reject", callback_data: `reject_${chatId}` },
              ],
            ],
          },
        }
      );
    } catch (error) {
      console.error("❌ Failed to notify admin:", error);
      await ctx.reply("⚠️ Could not notify admin. Please contact support.");
    }
  }
});

bot.action(/approve_(\d+)_(\d+)/, async (ctx) => {
  const [id, userId] = ctx.match.slice(1);
  const ids = loadVerifiedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveVerifiedIds(ids);
  }
  await bot.telegram.sendMessage(
    userId,
    "🎉 Your ID has been approved! Full access granted. ✅"
  );
  await ctx.answerCbQuery("User approved.");
});

bot.action(/reject_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  await bot.telegram.sendMessage(
    userId,
    "❌ Your ID was rejected. Contact support."
  );
  await ctx.answerCbQuery("User rejected.");
});

bot.command("adduser", (ctx) => {
  if (ctx.chat.id !== ADMIN_ID) return;
  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("Usage: /adduser <id>");
  const ids = loadVerifiedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveVerifiedIds(ids);
  }
  ctx.reply(`✅ ID ${id} manually added.`);
});

bot.command("deleteuser", (ctx) => {
  if (ctx.chat.id !== ADMIN_ID) return;
  const id = ctx.message.text.split(" ")[1];
  if (!id) return ctx.reply("Usage: /deleteuser <id>");
  let ids = loadVerifiedIds();
  ids = ids.filter((i) => i !== id);
  saveVerifiedIds(ids);
  ctx.reply(`❌ ID ${id} removed.`);
});

bot.command("userlist", (ctx) => {
  if (ctx.chat.id !== ADMIN_ID) return;
  const ids = loadVerifiedIds();
  ctx.reply(`📋 Verified Users (${ids.length}):\n${ids.join("\n")}`);
});

bot.command("stats", (ctx) => {
  if (ctx.chat.id !== ADMIN_ID) return;
  const ids = loadVerifiedIds();
  ctx.reply(`📊 Total verified users: ${ids.length}`);
});

// Export Netlify Function
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);

    return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };
  } catch (error) {
    console.error("Error in bot handler:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
