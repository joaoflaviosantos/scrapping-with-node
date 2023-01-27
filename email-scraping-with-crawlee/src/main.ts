import {
  CheerioCrawler,
  KeyValueStore,
  ProxyConfiguration,
  RequestQueue,
  Dataset
} from "crawlee";
import { loadDomainUrls, loadKeywords } from "./inputLoaders.js";
import { router } from "./routes.js";

type inputSchema = {
  keywords: string[];
  domainUrls: string[];
};

const requestQueue = await RequestQueue.open();

// Is possible to adapter with db query (pending)
const { keywords = [], domainUrls = [] } = (await KeyValueStore.getInput<inputSchema>())!;

await loadKeywords(keywords);
await loadDomainUrls(domainUrls);

//const proxyConfiguration = new ProxyConfiguration();

const crawler = new CheerioCrawler({
  requestQueue,
  // proxyConfiguration,
  requestHandler: router,
});

await crawler.run();

// https://crawlee.dev/docs/examples/export-entire-dataset
// Export the entirety of the dataset to a single file in
// a key-value store named "my-data" under the key "OUTPUT"
await Dataset.exportToCSV('OUTPUT', { toKVS: 'my-data' });
