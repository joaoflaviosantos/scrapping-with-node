import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request, enqueueLinks }) => {
        console.log(`Processing (${request.label}): ${request.url}`)
        if (request.label === 'DETAIL') {
            const urlParts = request.url.split('/').slice(-2);
            const modifiedTimestamp = await page.locator('time[datetime]').getAttribute('datetime');
            const runsRow = page.locator('ul.ActorHeader-stats > li').filter({ hasText: 'Runs' });
            const runCountString = await runsRow.locator('span').last().textContent();
            const results = {
                url: request.url,
                uniqueIdentifier: urlParts.join('/'),
                owner: urlParts[0],
                title: await page.locator('h1').first().textContent(),
                description: await page.locator('span.actor-description').textContent(),
                modifiedDate: new Date(Number(modifiedTimestamp)),
                runCount: Number(runCountString.replaceAll(',', '')),
            }
            console.log(results)
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
                selector: '.ActorStore-main > div.sc-8a5d6149-0.bfuKWo > div > a',
                label: 'DETAIL', // <= note the different label
            })
        }
    },
});

await crawler.run(['https://apify.com/store']);