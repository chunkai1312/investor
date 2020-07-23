import yahooFinance from 'yahoo-finance';
import Table from 'cli-table3';
import numeral from 'numeral';
import ora from 'ora';
import chalk from 'chalk';
import Configstore from 'configstore';

interface WatchlistCommandOptions {
  create: string[];
  delete: string[];
  add: string[];
  remove: string[];
  rename: string;
}

export default class WatchlistCommand {
  private config = new Configstore(require('../../package.json').name, { watchlists: [] }); // eslint-disable-line
  private spinner = ora();
  private data;

  constructor(private lists: string[], private options: WatchlistCommandOptions) {}

  public async execute(): Promise<void> {
    if (this.options.create) return this.createLists();
    if (this.options.delete) return this.deleteLists();
    if (this.options.add) return this.addSymbols();
    if (this.options.remove) return this.removeSymbols();
    if (this.options.rename) return this.renameList();

    await this.fetch();
    await this.print();
  }

  private async showLists() {
    const lists = this.config.get('watchlists');

    const table = new Table({ head: ['Watchlist Name', 'Ticker Symbols'] });

    lists.forEach(list => {
      table.push([chalk.bold.white(list.name), list.symbols.toString()]);
    });

    console.log(table.toString());
  }

  private async createLists() {
    this.lists = Array.from(new Set(this.lists));

    const watchlists = this.config.get('watchlists')
      .concat(this.lists.map(list => ({ name: list, symbols: [] })));

    this.config.set('watchlists', watchlists);

    this.showLists();
  }

  private async deleteLists() {
    this.lists = Array.from(new Set(this.lists));

    const watchlists = this.config.get('watchlists')
      .filter(watchlist => !this.lists.includes(watchlist.name));

    this.config.set('watchlists', watchlists);

    this.showLists();
  }

  private async addSymbols() {
    this.options.add = Array.from(new Set(this.options.add));

    const watchlists = this.config.get('watchlists')
      .map(watchlist => {
        return this.lists.includes(watchlist.name)
          ? { ...watchlist, symbols: Array.from(new Set(watchlist.symbols.concat(this.options.add))) }
          : watchlist;
      });

    this.config.set('watchlists', watchlists);

    this.showLists();
  }

  private async removeSymbols() {
    this.options.remove = Array.from(new Set(this.options.remove));

    const watchlists = this.config.get('watchlists')
      .map(watchlist => {
        return this.lists.includes(watchlist.name)
          ? { ...watchlist, symbols: Array.from(new Set(watchlist.symbols.filter(symbol => !this.options.remove.includes(symbol)))) }
          : watchlist;
      });

    this.config.set('watchlists', watchlists);

    this.showLists();
  }

  private async fetch() {
    const symbols = this.config.get('watchlists')
      .filter(watchlist => this.lists.length ? this.lists.includes(watchlist.name) : watchlist)
      .map(watchlist => watchlist.symbols)
      .flat();

    if (!symbols.length) return;

    this.spinner.start();

    this.data = await yahooFinance.quote({
      symbols,
      modules: ['price', 'summaryDetail'],
    });

    this.spinner.stop();
  }

  private async renameList() {
    this.lists = Array.from(new Set(this.lists));

    const watchlists = this.config.get('watchlists')
      .map(watchlist => {
        return this.lists.includes(watchlist.name)
          ? { ...watchlist, name: this.options.rename }
          : watchlist;
      });

    this.config.set('watchlists', watchlists);

    this.showLists();
  }

  private async print() {
    const watchlists = this.config.get('watchlists')
      .filter(watchlist => this.lists.length ? this.lists.includes(watchlist.name) : watchlist);

      watchlists.forEach(watchlist => {
        console.log();
        console.log(chalk.bold.white(watchlist.name));
        const table = new Table({ head: ['Symbol', 'Name', 'Last', 'Change', 'Change %'] });

        watchlist.symbols.forEach(symbol => {
          const color = this.data[symbol].price.regularMarketChange >= 0 ? chalk.bold.green : chalk.bold.red;

          table.push([
            chalk.bold.white(this.data[symbol].price.symbol),
            this.data[symbol].price.shortName,
            { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketPrice).format('0.00')) },
            { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketChange).format('+0.00')) },
            { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketChangePercent).format('+0.00%')) },
          ]);
        })

        console.log(table.toString());
        console.log();
      });
  }
}
