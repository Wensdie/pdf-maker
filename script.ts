import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import {setTimeout} from "node:timers/promises"
import PDFDocument from 'pdfkit';
import fs from "fs";

dotenv.config();
Pdf_maker();

async function Pdf_maker() {
  const PDF_PASSWORD = process.env["PDF_PASSWORD"];
  const PDF_EMAIL = process.env["PDF_EMAIL"]

  if(!PDF_PASSWORD || !PDF_EMAIL){
    throw new Error("Cannot access email or password.")
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  try{
    const page = await browser.newPage();
    await page.goto('https://www.ibuk.pl/logowanie.html', {
      waitUntil: 'networkidle0' 
    });

    await page.waitForSelector(">>> span#cmpwelcomebtnyes");
    await page.click(">>> span#cmpwelcomebtnyes");

    await page.waitForSelector(".close.abo__close");
    await page.click(".close.abo__close");
    
    await page.waitForSelector("#loginform-username");
    await page.waitForSelector("#loginform-password");

    await page.focus("#loginform-username");
    page.keyboard.type(PDF_EMAIL, {delay: 100}).then(async () => {
      await page.focus("#loginform-password");
      page.keyboard.type(PDF_PASSWORD, {delay: 100}); 
    }) 

    await setTimeout(4000);

    await page.waitForSelector("#customer_login > div.clearfix > button");
    await page.click("#customer_login > div.clearfix > button");

    await page.waitForSelector("a[title='Moje konto']");
    await page.click("a[title='Moje konto']");

    await page.waitForSelector(".small-button.small-button--dark-red.account__button");
    const href = await page.evaluate(
      () => {
        try{
          const href_Atr = document.querySelector(".small-button.small-button--dark-red.account__button")?.getAttribute("href");
          return href_Atr;
        }
        catch(er){
          console.log(er);
        }
    });

    await page.goto("https://www.ibuk.pl" + href);

    await page.waitForSelector("#message-button-0");
    await page.click("#message-button-0");

    const pdf = new PDFDocument({
      autoFirstPage: false,
      size: [611, 876]
    });
    pdf.pipe(fs.createWriteStream("Analiza matematyczna w zadaniach. Część 2.pdf"));
    

    for(let i = 1; i <= 493; i++){
      await setTimeout(2000);
      await page.waitForSelector(`#page${i}`);
      let screenshot_Page = await page.waitForSelector(`#page${i}`);
      
      screenshot_Page?.screenshot({
      path: `screenshot/img_${i}.jpg`
      });

      await setTimeout(2000);
      await page.waitForSelector("#nextPageImg");
      await page.click("#nextPageImg");

      pdf.addPage();

      pdf.image(`./screenshot/img_${i}.jpg`, 0, 0, {
        align: 'center',
        valign: 'center'
      });
    }
    pdf.end();
  }
  catch(er){
    console.log(er);
  }
  finally{
    console.log("PDF successfully generated.")
    await browser.close();
  }
}