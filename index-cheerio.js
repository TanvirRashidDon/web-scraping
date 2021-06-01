const request = require("request-promise")
const puppeteer = require("puppeteer-core")
const cheerio = require("cheerio")
const fs = require("fs")
const json2csv = require("json2csv").Parser;


const initialUrl = 'https://www.imdb.com/title/tt0111161/?ref_=adv_li_tt';

/**
* Create header object.
*
* return the header for the URL.
*/
const crateHeaders = () => {
    const header = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,bn;q=0.8",
    }

    return header;
};



/** #5
* Get scraped data in required.
* Importent note: rrsponse type goes here
*
* param url, headers the pagination information.
* return the formated data.
*/
const scrapeAnyItem = (url, headers) => {
    const response = request({
        uri: url,
        headers: headers,
        gzip: true, // content-encoding from Response Headers (expected response type)
    });

    const $ = cheerio.load(response);

    const title = $('.TitleBlock__TitleContainer-sc-1nlhx7j-1 jxsVNt').html();
    // const director = $('div[class="ipc-metadata-list-item__content-container"] > ul > li > a').innerText;

    const data = {
         title, 
        // director
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



// run with command $ node index-cheerio.js
(async () => {
    let parsedData = [];
    const fileToWrite = "./data.csv";

    const headers = crateHeaders();
    const data = scrapeAnyItem(initialUrl, headers);

    parsedData.push(data);

    writeInCSVFile(parsedData, fileToWrite);
}
) ();
