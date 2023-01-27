// ** src/router.ts
import { createPlaywrightRouter, Dataset } from 'crawlee';

// createPlaywrightRouter() is only a helper to get better
// intellisense and typings. You can use Router.create() too.
export const router = createPlaywrightRouter();

// This is a fallback route which will handle the start URL
// as well as the LIST labelled URLs.
router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    log.debug(`Enqueueing pagination: ${request.url}`)
    await page.waitForSelector('.ActorStorePagination-buttons a');
    await enqueueLinks({
        selector: '.ActorStorePagination-buttons > a',
        label: 'LIST',
    })
    log.debug(`Enqueueing actor details: ${request.url}`)
    await page.waitForSelector('div.ActorStore-main');
    await enqueueLinks({
        selector: '.ActorStore-main > div.sc-8a5d6149-0.bfuKWo > div > a',
        label: 'DETAIL', // <= note the different label
    })
});

// This replaces the request.label === DETAIL branch of the if clause.
router.addHandler('DETAIL', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`)
    const urlParts = request.url.split('/').slice(-2);
    const modifiedTimestamp = await page.locator('time[datetime]').getAttribute('datetime');
    const runsRow = page.locator('ul.ActorHeader-stats > li').filter({ hasText: 'Runs' });
    const runCountString = await runsRow.locator('span').last().textContent();
    const countString = runCountString == null ? 0 : runCountString.replace(',', '')

    const results = {
        url: request.url,
        uniqueIdentifier: urlParts.join('/'),
        owner: urlParts[0],
        title: await page.locator('h1').first().textContent(),
        description: await page.locator('span.actor-description').textContent(),
        modifiedDate: new Date(Number(modifiedTimestamp)),
        runCount: Number(countString),
    }

    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(results);
});


// ** src/main.ts
import { PlaywrightCrawler, log } from 'crawlee';
import Export from './dataset-to-csv.js';
// import { router } from './routes.js';

// This is better set with CRAWLEE_LOG_LEVEL env var
// or a configuration option. This is just for show 😈
log.setLevel(log.LEVELS.DEBUG);

log.debug('Setting up crawler.');
const crawler = new PlaywrightCrawler({
    // Let's limit our crawls to make our tests shorter and safer.
    //maxRequestsPerCrawl: 10,
    // Instead of the long requestHandler with
    // if clauses we provide a router instance.
    requestHandler: router,
});

log.debug('Adding requests to the queue.');
await crawler.addRequests(['https://apify.com/store']);

// crawler.run has its own logs 🙂
await crawler.run()

await Export()