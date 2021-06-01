const scrapeObject = {
    url: 'https://www.imdb.com/title/tt0111161/?ref_=adv_li_tt',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);
    }
}

module.exports = scrapeObject;
