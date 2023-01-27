import { Dataset, Configuration } from 'crawlee';
import { Parser } from 'json2csv';
import { writeFileSync } from 'fs';

// ** Getting crawl results
// Crawlee automatically deletes data from its previous runs.
// We can turn this off by setting 'purgeOnStart' to false.
// If we did not do this, we would have no data to process.
// This is a temporary workaround, and we'll add a better interface soon.
Configuration.getGlobalConfig().set('purgeOnStart', false);

export default async function Export() {
  // Reading storage json files
  const { items } = await Dataset.getData();

  //items.map(i => console.log(i))


  // ** Exporting results to CSV
  const fields = ['url', 'uniqueIdentifier', 'owner', 'title', 'description', 'modifiedDate', 'runCount'] 

  // https://stackoverflow.com/a/57592820
  // https://github.com/mrodrig/json-2-csv/issues/65
  const json2csvParser = new Parser({ fields: fields, defaultValue : 'NA', includeEmptyRows : false, delimiter: '|' });

  const csv = json2csvParser.parse(items);

  writeFileSync('./storage/output/actors.csv', csv);
}