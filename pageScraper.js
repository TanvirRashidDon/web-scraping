const { Configuration } = require("./configuration");

const scraperObject = {
    url: Configuration.initialURL,
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to base url ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);

        let scrapedData = [];

        const getAllLinksFromAPage = async (page) => {
           let item = await page.waitForSelector('#main')

            let urls = await page.$$eval('#main > div > div.lister.list.detail.sub-list > div > div > div.lister-item-content', links => {
                // add filter if any exist
                // links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
                // Extract the links from the data
                links = links.map(el => el.querySelector('h3 > a').href)
                return links;
            });

            return urls;
        }

        // Get Next page url call
        const getNextPageUrl = async (page, pageCount) => {
            let pageURLS = []
            pageURLS.push(this.url);
                      
            if (pageCount <= 0) {
                return allUrls;
            } else {
                for (let i = 0; i < pageCount ; i++) {
                    let nextButtonExist = false;
                    try {
                        const nextButton = await page.$eval('.desc > a.next-page', a => a.textContent);
                        nextButtonExist = true;
                    } catch (error) {
                        nextButtonExist = false;
                        break;
                    }

                    if (nextButtonExist) {
                        await page.click('.desc > a');

                        pageURLS.push(page.url());
                        console.log("Page URL: " + page.url())
                    }
                }
            }

            return pageURLS;
        }

        const allPagesURLs = await getNextPageUrl(page, 10)
        console.log(allPagesURLs);

        async function scrapeCurrentPage(){

            // Wait for the required DOM to be rendered
            await page.waitForSelector('#main');

            // Get the link to all the links

            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);

                dataObj['title'] = await newPage.$eval('h1', text => text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ""));
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
                console.log(dataObj);
                await newPage.close();
            })

            for(link in allUrls){
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                // console.log(currentPageData);
            }

            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.
           
            await page.close();

            return scrapedData;
        }

     
  

        // let data = await scrapeCurrentPage();
        // console.log(data);
        // return data;
    }
}

module.exports = scraperObject;