const { Telegraf } = require("telegraf"); const fs = require("fs"); const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN); const ADMIN_ID = 5466636474; const verifiedPath = path.join(__dirname, "verified-ids.json");

const loadVerifiedIds = () => { try { const data = fs.readFileSync(verifiedPath); return JSON.parse(data); } catch { fs.writeFileSync(verifiedPath, JSON.stringify([])); return []; } };

const saveVerifiedIds = (ids) => { fs.writeFileSync(verifiedPath, JSON.stringify(ids)); };

let userState = {};

bot.start((ctx) => { if (ctx.chat.id === ADMIN_ID) { return ctx.reply("🔧 Admin Commands:\n/adduser <id>\n/deleteuser <id>\n/userlist\n/stats"); } else { return ctx.reply( `👋🤖 Hi, are you ready to get a unique trading robot based on OpenAI in conjunction with 30 indicators?

🏆 I want to tell you right away that this is not gold bars that will come to your hands by themselves.

This is a shovel that you can use to dig out your gold!

✔️ Trading is a path you have to take yourself! And this bot will help you to do it! I spent a lot of money and time to make this bot free for everyone. You need to follow some simple steps to get started, it will take you 10 minutes.

Click the "Get access to bot" button and you'll get instructions to get started!`, { reply_markup: { inline_keyboard: [[{ text: "📱Main Menu📱", callback_data: "main_menu" }]], }, } ); } });

bot.action("main_menu", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply( `<b>Main menu of Trade Mind Ai📈</b> <code>Here you can get test signals, familiarize yourself with the bot interface and learn how it works.

Read the reviews, browse the information channel, ask your manager a question, and don't forget to subscribe to our YouTube channel with weekly bot reviews. And of course, here you can get full access to the bot forever absolutely free.</code>`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [ [{ text: "❓How it work's", callback_data: "how_it_works" }], [{ text: "🔐 Full Access", callback_data: "full_access" }], [{ text: "📈 Trade", callback_data: "trade" }], [{ text: "☎️ Support", url: "https://t.me/BinaryMindsetTg" }], ], }, } ); });

bot.action("how_it_works", async (ctx) => { await ctx.answerCbQuery(); return ctx.replyWithHTML( `<b>Trade Mind Ai: innovative neural network-based product</b> <code>The bot performs technical and volume market analysis, considering numerous factors to provide accurate signals for binary options trading📊

Key features:

Technical analysis🛠 Identifies optimal points to buy options. Volume analysis🌐 Assesses market strength based on trading volume, predicting reversals or trends. Japanese candlesticks📊 Determines opening, max, and min stock prices. Global factors🌎 Monitors economic and political events impacting the market. Self-learning🧙 Learns from past mistakes to improve accuracy. Advanced AI🤖 Built on cutting-edge AI technology, enabling constant evolution in trading.

Our tool enhances trading efficiency, giving you a competitive edge and increasing income on Pocket Option and other platforms. Use it today for stable profits.</code>` ); });

bot.action("trade", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("Access Denied, please complete the registration.❌"); });

bot.action("full_access", async (ctx) => { await ctx.answerCbQuery(); return ctx.replyWithHTML( `To activate full access to the bot, you will need to register a new account with Quotex broker by following this link🫵

🫵 <b>Attention</b> 🫵 - You must register using the link above or the <a href="https://broker-qx.pro/sign-up/?lid=1349529">Register</a> button. Otherwise the bot will not be able to confirm registration and you will not get access to it.

We do not hide that we use an affiliate program, on the contrary, we openly declare it. We cooperate with <a href="https://broker-qx.pro/sign-up/?lid=1349529">Quotex</a> on the basis of an affiliate program, which allows us to maintain and develop our product, and you - to use it for free, without the need to make an expensive subscription.

<b>Important*</b> We do not profit from your losses, only % of the total amount of deposits, which means that we are not interested in you losing, on the contrary, your success contributes to the development of ours.Through the affiliate program we help each other`, { reply_markup: { inline_keyboard: [ [{ text: "✍️ Registration", url: "https://broker-qx.pro/sign-up/?lid=1349529" }], [{ text: "🔍 Enter Id", callback_data: "enter_id" }], [{ text: "Back", callback_data: "main_menu" }], ], }, } ); });

bot.action("enter_id", async (ctx) => { await ctx.answerCbQuery(); userState[ctx.chat.id] = { enteringId: true }; return ctx.reply("❗After completing the registration process, enter your ID:", { reply_markup: { inline_keyboard: [[{ text: "↩️ Back", callback_data: "full_access" }]], }, }); });

bot.on("text", async (ctx) => { const chatId = ctx.chat.id; const message = ctx.message.text.trim();

if (userState[chatId]?.enteringId) { userState[chatId].enteringId = false; await ctx.reply(✅ Your ID ${message} has been received and is under review.); await ctx.reply("⌛ Checking your ID for registration, please expect ~1-2 minutes...");

await bot.telegram.sendMessage(
  ADMIN_ID,
  `👤 New ID submitted for approval: ${message}\nFrom user: @${ctx.from.username || "(no username)"} (ID: ${chatId})`,
  {
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve_${message}_${chatId}` },
        { text: "❌ Reject", callback_data: `reject_${chatId}` }
      ]],
    },
  }
);

} });

bot.action(/approve_(\d+)_(\d+)/, async (ctx) => { const id = ctx.match[1]; const userId = ctx.match[2]; const ids = loadVerifiedIds(); if (!ids.includes(id)) { ids.push(id); saveVerifiedIds(ids); } await bot.telegram.sendMessage(userId, "🎉 Your ID has been successfully verified and full access is now granted! Welcome to Trade Mind AI 🚀✅"); await ctx.answerCbQuery("User approved."); });

bot.action(/reject_(\d+)/, async (ctx) => { const userId = ctx.match[1]; await bot.telegram.sendMessage(userId, "❌ Your ID was rejected. Please contact support."); await ctx.answerCbQuery("User rejected."); });

bot.command("adduser", (ctx) => { if (ctx.chat.id !== ADMIN_ID) return; const id = ctx.message.text.split(" ")[1]; if (!id) return ctx.reply("Usage: /adduser <id>"); const ids = loadVerifiedIds(); if (!ids.includes(id)) { ids.push(id); saveVerifiedIds(ids); } ctx.reply(✅ ID ${id} manually added.); });

bot.command("deleteuser", (ctx) => { if (ctx.chat.id !== ADMIN_ID) return; const id = ctx.message.text.split(" ")[1]; if (!id) return ctx.reply("Usage: /deleteuser <id>"); let ids = loadVerifiedIds(); ids = ids.filter((i) => i !== id); saveVerifiedIds(ids); ctx.reply(❌ ID ${id} removed.); });

bot.command("userlist", (ctx) => { if (ctx.chat.id !== ADMIN_ID) return; const ids = loadVerifiedIds(); ctx.reply(📋 Verified Users (${ids.length}):\n${ids.join("\n")}); });

bot.command("stats", (ctx) => { if (ctx.chat.id !== ADMIN_ID) return; const ids = loadVerifiedIds(); ctx.reply(📊 Total verified users: ${ids.length}); });

exports.handler = async (event) => { try { if (event.httpMethod !== "POST") { return { statusCode: 405, body: "Method Not Allowed" }; } const update = JSON.parse(event.body); await bot.handleUpdate(update); return { statusCode: 200, body: JSON.stringify({ status: "ok" }) }; } catch (error) { console.error("Error in bot handler:", error); return { statusCode: 500, body: "Internal Server Error" }; } };

