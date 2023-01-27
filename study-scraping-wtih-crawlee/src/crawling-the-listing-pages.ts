import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request, enqueueLinks }) => {
        console.log(`Processing: ${request.url}`)
        // Wait for the actor cards to render,
        // otherwise enqueueLinks wouldn't enqueue anything.
        await page.waitForSelector('.ActorStorePagination-buttons a');

        // Add links to the queue, but only from
        // elements matching the provided selector.
        await enqueueLinks({
            selector: '.ActorStorePagination-buttons > a',
            label: 'LIST',
        })
    },
});

await crawler.run(['https://apify.com/store']);