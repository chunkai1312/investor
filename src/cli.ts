import program from 'commander';
import moment from 'moment';
import QuoteCommand from './commands/quote.command';
import WatchlistCommand from './commands/watchlist.command';

const pkg = require('../package.json'); // eslint-disable-line

program
  .name(pkg.name)
  .version(pkg.version);

program
  .command('quote <symbols...>')
  .description('Fetches current or historical quotes for the symbol(s).')
  .alias('q')
  .option('-H, --historical', 'Fetches historical quotes.', false)
  .option('--from [date]', 'The start date when fetching historical data.', moment().format('YYYY-MM-DD'))
  .option('--to [date]', 'The end date when fetching historical data.', moment().format('YYYY-MM-DD'))
  .option('--period [d|w|m|v]', 'The frequency of returned data.', 'd')
  .option('-i, --interactive', 'Enable interactive mode for fetching historical quotes.', false)
  .action((symbols, options) => new QuoteCommand(symbols, options).execute().catch(console.error));

program
  .command('watchlist [lists...]')
  .description('Fetches and display current quotes for the symbols in the watchlist(s).')
  .alias('w')
  .option('-c, --create', 'Create new watchlist(s)')
  .option('-d, --delete', 'Delete the watchlist(s)')
  .option('-a, --add <symbols...>', 'Add ticker symbol(s) to the watchlist.')
  .option('-r, --remove <symbols...>', 'Remove ticker symbol(s) from the watchlist.')
  .option('--rename <name>', 'Rename the watchlist name.')
  .action((lists, options) => new WatchlistCommand(lists, options).execute().catch(console.error));

program.parse(process.argv);
