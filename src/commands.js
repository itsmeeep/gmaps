const scrollPage = (page, scrollContainer) => new Promise (async (resolve, reject) => {
    try {
        let lastHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);

        while (true) {
            await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
            await page.waitForTimeout(2000);

            let newHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
            if (newHeight === lastHeight) {
                break;
            }

            lastHeight = newHeight;
        }

        resolve({
            status: "success",
            message: null
        });
    } catch (err) {
        resolve({
            status: "error",
            message: err
        });
    }
});

const scrapPageData = (page) => new Promise (async (resolve, reject) => {
    try {
        var rows = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".bfdHYd")).map((el) => {
                const placeUrl = el.parentElement.querySelector(".hfpxzc")?.getAttribute("href");
                const urlPattern = /!1s(?<id>[^!]+).+!3d(?<latitude>[^!]+)!4d(?<longitude>[^!]+)/gm;                     // https://regex101.com/r/KFE09c/1
                const dataId = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.id)[0];
                const latitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.latitude)[0];
                const longitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.longitude)[0];
    
                return {
                    title: el.querySelector(".qBF1Pd")?.textContent.trim(),
                    rating: el.querySelector(".MW4etd")?.textContent.trim(),
                    reviews: el.querySelector(".UY7F9")?.textContent.replace("(", "").replace(")", "").trim(),
                    type: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:first-child")?.textContent.replaceAll("·", "").trim(),
                    address: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:last-child")?.textContent.replaceAll("·", "").trim(),
                    openState: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:first-child")?.textContent.replaceAll("·", "").trim(),
                    phone: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:last-child")?.textContent.replaceAll("·", "").trim(),
                    website: el.querySelector("a[data-value]")?.getAttribute("href"),
                    description: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(2)")?.textContent.replace("·", "").trim(),
                    serviceOptions: el.querySelector(".qty3Ue")?.textContent.replaceAll("·", "").replaceAll("  ", " ").trim(),
                    gpsCoordinates: {
                        latitude,
                        longitude,
                    },
                    placeUrl,
                    dataId,
                }
            });
        });
    
        resolve({
            status: "success",
            message: null,
            data: rows
        })
    } catch (err) {
        resolve({
            status: "error",
            message: null,
            data: []
        })
    }
});

module.exports = {
    scrollPage,
    scrapPageData
}