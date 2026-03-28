const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const BOT_TOKEN = "8601245549:AAFNZ1ALZGKl2MApr7pdgbwVehrG66pOegA";
const OWNER_ID = 7467349703;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Bot started on Render.com");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min, max) => delay(min + Math.random() * (max - min));

bot.on('message', async (msg) => {
    if (msg.chat.id !== OWNER_ID) return;

    const phone = msg.text?.trim();
    if (!phone || phone.length < 8) {
        return bot.sendMessage(msg.chat.id, "❌ Please send a valid phone number");
    }

    let browser;
    try {
        await bot.sendMessage(msg.chat.id, `🚀 Starting for: ${phone}`);

        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1');
        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

        await page.goto('https://m.facebook.com/login/identify/', { waitUntil: 'domcontentloaded' });

        await randomDelay(4000, 7000);

        await page.type('input[type="text"]', phone, { delay: 80 });

        await randomDelay(3000, 5000);

        const screenshot = await page.screenshot({ fullPage: true });
        await bot.sendPhoto(msg.chat.id, screenshot, { 
            caption: `📸 Result for ${phone} (Render)` 
        });

        console.log(`Processed phone: ${phone}`);

    } catch (err) {
        console.error(err);
        await bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
});

console.log("✅ Bot is ready and listening...");
