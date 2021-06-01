const pageScraper = require("./pageScraper");

const scrapeAll = (browserInstance) => {
    let browser;

    try {
        browser = await browserInstance;
    } catch (error) {
        console.log("Could not resolve the browser instance => ", error);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);