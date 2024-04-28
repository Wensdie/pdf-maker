import puppeteer from "puppeteer";
import dotenv from 'dotenv';

dotenv.config();

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
});

const page = await browser.newPage();
await page.goto('https://www.google.pl', {
  waitUntil: 'domcontentloaded' 
});

const emailInput = await page.waitForSelector("#loginform-username");
const passInput = await page.waitForSelector("#loginform-password");

await page.focus(emailInput);
page.keyboard.type(process.env.PDF_EMAIL, {delay: 100});

await page.focus(passInput);
page.keyboard.type(process.env.PDF_PASSWORD, {delay: 100});  

await browser.close();