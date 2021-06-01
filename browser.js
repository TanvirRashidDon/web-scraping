const puppeteer = require('puppeteer');

const startBrowser = async () => {
    let browser;

    try {
        console.log("Opening the browser......");
        browser = await puppeteer.launch({
            headless = false, // run with an Interface. 
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true // ignore any HTTPS-related errors
        });      
    } catch (error) {
        console.log("Could not create a browser instance => : ", err);
    }

    return browser;
}

module.exports = {
    startBrowser
}