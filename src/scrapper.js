const commands = require('./commands')

const fs = require('fs').promises

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const {executablePath} = require('puppeteer');

puppeteer.use(StealthPlugin());

const requestParams = {
    baseURL: `http://google.com`,
    query: "starbucks",                                          // what we want to search
    coordinates: "@-6.233259, 106.819196",                 // parameter defines GPS coordinates of location where you want your query to be applied
    hl: "en",                                                    // parameter defines the language to use for the Google maps search
};

async function getLocationData () {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: executablePath(),
    });

    const page = await browser.newPage();
    const URL = `${requestParams.baseURL}/maps/search/${requestParams.query}/${requestParams.coordinates}?hl=${requestParams.hl}`;
  
    await page.setDefaultNavigationTimeout(60000);
    await page.goto(URL);
    await page.waitForNavigation();
  
    const scrollContainer = ".m6QErb[aria-label]";
    await page.waitForTimeout(2000);
    await commands.scrollPage(page, scrollContainer);
    
    var result = await commands.scrapPageData(page);
    await browser.close();
    
    return (result);
};

async function getDateNumber () {
    var currentdate = new Date(); 
    var datetime = currentdate.getDate().toString() +
                + (currentdate.getMonth()+1).toString() + 
                + currentdate.getFullYear().toString() + 
                + currentdate.getHours().toString() + 
                + currentdate.getMinutes().toString() + 
                + currentdate.getSeconds().toString();
    return datetime;
}

(async () => {
    var data = await getLocationData();
    var runNumber = await getDateNumber();
    await fs.writeFile('assets/'+ runNumber +'.json', JSON.stringify(data, null, 2), 'utf8');
    console.log(data)
})();