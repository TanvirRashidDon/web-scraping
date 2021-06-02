const scraperObject = {
    url: 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        // Wait for the required DOM to be rendered
        await page.waitForSelector('#main');
        // Get the link to all the required books
        let urls = await page.$$eval('#main > div > div.lister.list.detail.sub-list > div > div > div.lister-item-content', links => {
            // Make sure the book to be scraped is in stock
            // links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
            // Extract the links from the data
            links = links.map(el => el.querySelector('h3 > a').href)
            return links;
        });
        // console.log(urls);

        let pagePromise = (link) => new Promise(async(resolve, reject) => {
            let dataObj = {};
            let newPage = await browser.newPage();
            await newPage.goto(link);

            dataObj['title'] = await newPage.$eval('h1', text => text.textContent);
            dataObj['year'] = await newPage.$eval('h1', (text) => {
                // Strip new line and tab spaces
                // text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                // Get the year
                let regexp = /^.*\((.*)\).*$/i;
                let year = regexp.exec(text.textContent)[1].split(' ')[0];

                return year;
            });
            dataObj['director'] = await newPage.$eval('div > ul > li > a', (text) => {          
                // Strip new line and tab spaces
                text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                return text;
            });
            
            resolve(dataObj);
            await newPage.close();
        })

        for(link in urls){
            let currentPageData = await pagePromise(urls[link]);
            // scrapedData.push(currentPageData);
            console.log(currentPageData);
        }
    }
}

module.exports = scraperObject;