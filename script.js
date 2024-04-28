"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = require("puppeteer");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var browser = await puppeteer_1.default.launch({
    headless: false,
    defaultViewport: null,
});
var page = await browser.newPage();
await page.goto('https://www.google.pl', {
    waitUntil: 'domcontentloaded'
});
var emailInput = await page.waitForSelector("#loginform-username");
var passInput = await page.waitForSelector("#loginform-password");
await page.focus(emailInput);
page.keyboard.type(process.env.PDF_EMAIL, { delay: 100 });
await page.focus(passInput);
page.keyboard.type(process.env.PDF_PASSWORD, { delay: 100 });
await browser.close();
