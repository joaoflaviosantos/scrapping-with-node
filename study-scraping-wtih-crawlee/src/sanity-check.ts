// Instead of CheerioCrawler let's use Playwright
// to be able to render JavaScript.
import { PlaywrightCrawler } from 'crawlee';

// ** Without Cheerio
/*
const crawlerWithoutCheerio = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
        // Wait for the actor cards to render.
        await page.waitForSelector('.ActorStoreItem');
        // Execute a function in the browser which targets
        // the actor card elements and allows their manipulation.
        const actorTexts = await page.$$eval('.ActorStoreItem', (els) => {
            // Extract text content from the actor cards
            return els.map((el) => el.textContent);
        });
        actorTexts.forEach((text, i) => {
            console.log(`ACTOR_${i + 1}: ${text}\n`);
        });
    },
});

await crawlerWithoutCheerio.run(['https://apify.com/store']);

*/


// ** With Cheerio
const crawler = new PlaywrightCrawler({
    requestHandler: async ({ request, page, parseWithCheerio, log }) => {
        log.info(`\n\nProcessing ${request.url}...\n`);
        // Wait for the actor cards to render.
        await page.waitForSelector('div.ActorStore-main');
        // Extract the page's HTML from browser
        // and parse it with Cheerio.
        const $ = await parseWithCheerio();
        // Use familiar Cheerio syntax to
        // select all the actor cards.
        $('[data-test="actorCard"]').each((i, el) => {
            const text = $(el).text();
            console.log(`ACTOR_${i + 1}: ${text}\n`);
        });
    },
});

await crawler.run(['https://apify.com/store']);