// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration, KeyValueStore, Dataset, log } from 'crawlee'
import { router } from './routes.js'
import { BASE_URL, labels } from './constants.js'

type inputSchema = {
  keyword: string
}

// Grab our keyword from the input
const { keyword = null } = (await KeyValueStore.getInput<inputSchema>()) ?? {}

if (keyword === null) {
  log.info(`Please insert search keyword on ./starage/key_value_stores/default/INPUT.json`)
  process.exit(7)
}

log.info(`Seaching products with '${keyword}' keyword..`)

// Creating a new Cheerio crawler instance
const crawler = new CheerioCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
})

await crawler.addRequests([
  {
    // Use BASE_URL here instead
    url: `${BASE_URL}/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
    label: labels.START,
    userData: {
      keyword,
    },
  },
])

log.info('Starting the crawl.')
await crawler.run()
log.info('Crawl finished.')
