import { createCheerioRouter, KeyValueStore, Dataset } from 'crawlee'
import { BASE_URL, labels } from './constants.js'

export const router = createCheerioRouter()

// Saving not matched url's to a key-value-store
router.addDefaultHandler(async ({ request, log }) => {
  log.info(`URL can't be processed, discarding.`, { URL: request.url })
  const timestamp = Date.now().toString()
  const discardedUrlsStorage = await KeyValueStore.open('discarded-urls')
  await discardedUrlsStorage.setValue(timestamp, {
    discardedUrl: request.url,
  })
})

// Add a handler to our router to handle requests with the 'START' label
router.addHandler(labels.START, async ({ $, crawler, request, log }) => {
  log.info(`Crawling START page.`, { URL: request.url })
  const { keyword } = request.userData

  const products = $('div > div[data-asin]:not([data-asin=""])')

  // loop through the resulting products
  for (const product of products) {
    const element = $(product)
    const titleElement = $(element.find('.a-text-normal[href]'))

    // creating a constant for each detail product page
    const url = `${BASE_URL}${titleElement.attr('href')}`

    // scrape some data from each and to a request to the crawler for its page
    await crawler.addRequests([
      {
        url,
        label: labels.PRODUCT,
        userData: {
          // Pass the scraped data about the product to the next request so that it can be used there
          data: {
            title: titleElement.first().text().trim(),
            asin: element.attr('data-asin'),
            itemUrl: url,
            keyword,
          },
        },
      },
    ])
  }
})

// Add a handler to our router to handle requests with the 'PRODUCT' label
router.addHandler(labels.PRODUCT, async ({ $, crawler, request, log }) => {
  log.info(`Crawling PRODUCT page.`, { URL: request.url })
  const { data } = request.userData

  const element = $('div#productDescription')

  // add to the request queue
  await crawler.addRequests([
    {
      url: `${BASE_URL}/gp/aod/ajax/ref=auto_load_aod?asin=${data.asin}&pc=dp`,
      label: labels.OFFERS,
      userData: {
        data: {
          ...data,
          description: element.text().trim(),
        },
      },
    },
  ])
})

// Add a handler to our router to handle requests with the 'OFFERS' label
router.addHandler(labels.OFFERS, async ({ $, request, log }) => {
  log.info(`Crawling OFFERS page.`, { URL: request.url })
  const { data } = request.userData

  const image = $('#aod-asin-image-id').attr('src')

  for (const offer of $('#aod-offer')) {
    const element = $(offer)

    await Dataset.pushData({
      ...data,
      sellerName: element.find('div[id*="soldBy"] a[aria-label]').text().trim(),
      offer: element.find('.a-price .a-offscreen').text().trim(),
      aodImage: image,
    })
  }
})
