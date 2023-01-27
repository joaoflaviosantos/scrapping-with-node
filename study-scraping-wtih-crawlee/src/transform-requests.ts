import { CheerioCrawler } from 'crawlee';
import { URL } from 'node:url';


// ** With enqueueLinks
const crawlerWithEnqueueLinks = new CheerioCrawler({
    maxRequestsPerCrawl: 20,
    async requestHandler({ $, request, enqueueLinks }) {
        const title = $('title').text();
        console.log(`\nThe title of "${request.url}" is: ${title}.\n`);
        // Standard params
        await enqueueLinks({
            globs: ['http?(s)://crawlee.dev/*/*'],
            transformRequestFunction(req) {
                // ignore all links ending with `.pdf`
                if (req.url.endsWith('.pdf')) return false;
                return req;
            },
        });
    },
});

await crawlerWithEnqueueLinks.run(['https://crawlee.dev']);