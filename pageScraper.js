const { Configuration } = require("./configuration");

const scraperObject = {
    url: Configuration.initialURL,
    async scraper(browser){
        const getAllItemURLFromAPage = async (url) => {
            // go to the page and wait till the loadin completed
            await page.goto(url);
            await page.waitForSelector('#main')

            let urls = await page.$$eval('#main > div > div.lister.list.detail.sub-list > div > div > div.lister-item-content', links => {
                // add filter if any exist (example below)
                // links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
                // Extract the links from the data
                links = links.map(el => el.querySelector('h3 > a').href)
                return links;
            });

            console.log(`Found ${urls.length} item in page: ${url}`);
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
                        //console.log("Page URL: " + page.url())
                    }
                }
            }

            return pageURLS;
        }

        const addItems = async (urls) => {
            let items = [];
            for(pageUrl of urls) {
                const itemInAPage = await getAllItemURLFromAPage(pageUrl);
                //console.log(itemInAPage.leanth);
                items.push(...itemInAPage);
            }
            return items;
        }

        const getTotalAdsCount = (items) => {
            console.log("\nItem count for the initial URL: " + items.length)
        }

        const scrapeCarItems = async (urls) => {
            let scrapedData = [];

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

            console.log(`\nScraping started...\n`)
            for(link in urls) { // avoid loop with callbacks like forEach
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                // console.log(currentPageData);
            }

            return scrapedData;
        }


        // =================== Start Here =================
        let page = await browser.newPage();
        console.log(`Navigating to initial url ${this.url}\n`);
        // Navigate to the selected page
        await page.goto(this.url);

        const allPagesURLs = await getNextPageUrl(page, 10)
        //console.log(allPagesURLs);
        
        const allItems = await addItems(allPagesURLs);
        //console.log(allItems);

        getTotalAdsCount(allItems);

        const scrapedData = await scrapeCarItems(allItems);
        await page.close();

        console.log(scrapedData);
        // return data;
    }
}

module.exports = scraperObject;