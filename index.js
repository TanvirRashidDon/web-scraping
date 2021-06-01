const browserObject = require("./browser");
const scraperController = require("./pageController");

// start a browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// pass the browser instance to the scraper controller
scraperController(browserInstance);