import { CheerioCrawler } from 'crawlee';

const crawler = new CheerioCrawler({
    async requestHandler({ $, request }) {
        const title = $('title').text();
        console.log(`\nThe title of "${request.url}" is: ${title}.\n`);
    }
})

await crawler.run(['https://crawlee.dev']);