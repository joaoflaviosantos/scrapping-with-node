import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request, enqueueLinks }) => {
        console.log(`Processing: ${request.url}`)
        if (request.label === 'DETAIL') {
            // We're not doing anything with the details yet.
        } else {
            // This means we're either on the start page, with no label,
            // or on a list page, with LIST label.

            await page.waitForSelector('.ActorStorePagination-buttons a');
            await enqueueLinks({
                selector: '.ActorStorePagination-buttons > a',
                label: 'LIST',
            })

            // In addition to adding the listing URLs, we now also
            // add the detail URLs from all the listing pages.
            await page.waitForSelector('div.ActorStore-main');
            await enqueueLinks({
                selector: '.ActorStore-main > div.sc-8a5d6149-0.bfuKWo > div',
                label: 'DETAIL', // <= note the different label
            })
        }
    },
});

await crawler.run(['https://apify.com/store']);