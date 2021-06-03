const { Configuration } = require("./configuration");

const scraperObject = {
    url: Configuration.initialURL,
    headers: Configuration.headers,
    async scraper(browser){
        const getAllItemURLFromAPage = async (url) => {
            // go to the page and wait till the loadin completed
            // pass headers
            await page.setExtraHTTPHeaders(this.headers);
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

            const findElement = async (page, tag) => {
                let text = "";

                try {
                    text = await page.$eval(tag, text => text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ""));
                } catch (error) {
                    text = "";
                }
                return text;
            }

            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();

                await newPage.setExtraHTTPHeaders(this.headers);
                //console.log(this.headers)
                await newPage.goto(link);
                //console.log(newPage.url());

                dataObj['title'] = await findElement(newPage, 'h1');
                
                
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
        //console.log(`Navigating to initial url ${this.url}\n`);
        // Navigate to the selected page
        await page.setExtraHTTPHeaders(this.headers);
        await page.goto(this.url);

        //const allPagesURLs = await getNextPageUrl(page, 10)
        //console.log(allPagesURLs);
        
        //const allItems = await addItems(allPagesURLs);
        //console.log(allItems);

        //getTotalAdsCount(allItems);

        let allItems = [];
        allItems.push("https://suchen.mobile.de/fahrzeuge/details.html?id=311936755&damageUnrepaired=NO_DAMAGE_UNREPAIRED&isSearchRequest=true&makeModelVariant1.makeId=25200&makeModelVariant1.modelGroupId=29&pageNumber=1&scopeId=C&sfmr=false&action=topOfPage&top=1:1&searchId=aac6c1a7-59f9-b260-ab8b-cd9ccc9c731b");
        const scrapedData = await scrapeCarItems(allItems);
        await page.close();

        console.log(scrapedData);
        // return data;
    }
}

module.exports = scraperObject;