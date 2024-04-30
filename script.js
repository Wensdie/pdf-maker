var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import { setTimeout } from "node:timers/promises";
import PDFDocument from 'pdfkit';
import fs from "fs";
dotenv.config();
Pdf_maker();
function Pdf_maker() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({
            headless: false,
            defaultViewport: null,
        });
        try {
            const page = yield browser.newPage();
            yield page.goto('https://www.ibuk.pl/logowanie.html', {
                waitUntil: 'networkidle0'
            });
            yield page.waitForSelector(">>> span#cmpwelcomebtnyes");
            yield page.click(">>> span#cmpwelcomebtnyes");
            yield page.waitForSelector(".close.abo__close");
            yield page.click(".close.abo__close");
            yield page.waitForSelector("#loginform-username");
            yield page.waitForSelector("#loginform-password");
            yield page.focus("#loginform-username");
            page.keyboard.type(process.env["PDF_EMAIL"], { delay: 100 }).then(() => __awaiter(this, void 0, void 0, function* () {
                yield page.focus("#loginform-password");
                page.keyboard.type(process.env["PDF_PASSWORD"], { delay: 100 });
            }));
            yield setTimeout(4000);
            yield page.waitForSelector("#customer_login > div.clearfix > button");
            yield page.click("#customer_login > div.clearfix > button");
            yield page.waitForSelector("a[title='Moje konto']");
            yield page.click("a[title='Moje konto']");
            yield page.waitForSelector(".small-button.small-button--dark-red.account__button");
            const href = yield page.evaluate(() => {
                var _a;
                let href_Atr;
                try {
                    href_Atr = (_a = document.querySelector(".small-button.small-button--dark-red.account__button")) === null || _a === void 0 ? void 0 : _a.getAttribute("href");
                }
                catch (er) {
                    console.log(er);
                }
                finally {
                    return href_Atr;
                }
            });
            yield page.goto("https://www.ibuk.pl" + href);
            yield page.waitForSelector("#message-button-0");
            yield page.click("#message-button-0");
            let pdf = new PDFDocument({
                autoFirstPage: false,
                size: [611, 876]
            });
            pdf.pipe(fs.createWriteStream("Analiza matematyczna w zadaniach. Część 2.pdf"));
            for (let i = 1; i <= 3; i++) {
                yield setTimeout(2000);
                yield page.waitForSelector(`#page${i}`);
                let screenshot_Page = yield page.waitForSelector(`#page${i}`);
                screenshot_Page === null || screenshot_Page === void 0 ? void 0 : screenshot_Page.screenshot({
                    path: `screenshot/img_${i}.jpg`
                });
                yield setTimeout(2000);
                yield page.waitForSelector("#nextPageImg");
                yield page.click("#nextPageImg");
                pdf.addPage();
                pdf.image(`./screenshot/img_${i}.jpg`, 0, 0, {
                    align: 'center',
                    valign: 'center'
                });
            }
            pdf.end();
        }
        catch (er) {
            console.log(er);
        }
        finally {
            console.log("End.");
            yield browser.close();
        }
    });
}
