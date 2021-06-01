const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs")


const initialUrl = 'https://www.imdb.com/title/tt0111161/?ref_=adv_li_tt';


/** #5
* Get scraped data in required.
* Importent note: rrsponse type goes here
*
* param url, headers the pagination information.
* return the formated data.
*/
const scrapeAnyItem = async (url) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { timeout: 60000, waitUntil: 'networkidle2' })
    } catch (error) {
        try {
            await page.goto(url, { timeout: 120000, waitUntil: 'networkidle2' })
        }
        catch (error) {
            console.error('Connecting to: ' + url + ' failed due to: ' + error);
            return;
        }
    }

    const title = await page.evaluate(() => document.querySelector("h1").innerText);
    const director = await page.evaluate(() => document.querySelector("li a").innerText);

    await page.close();
    await browser.close();


    const data = {
        title, 
        director
    };

    console.log(data);

    return data;
};

/** 
* write to csv file.
*
* param jseon array, file relative path .
*/
const writeInCSVFile = (inputJsonObject, pathToWrite) => {
    const j2cp = new json2csv();
    const csv = j2cp.parse(inputJsonObject);

    fs.writeFileSync(pathToWrite, csv, "utf-8");
};



// Scripte starts here
(async () => {
    let parsedData = [];
    const fileToWrite = "./data.csv";

    const data = scrapeAnyItem(initialUrl);

    await parsedData.push(data);

    await writeInCSVFile(parsedData, fileToWrite);
}
) ();
