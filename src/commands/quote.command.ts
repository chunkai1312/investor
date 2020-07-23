import yahooFinance from 'yahoo-finance';
import Table from 'cli-table3';
import moment from 'moment';
import numeral from 'numeral';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt')); // eslint-disable-line

interface QuoteCommandOptions {
  historical: boolean;
  from: string;
  to: string;
  period: string;
  interactive: boolean;
}

export default class QuoteCommand {
  private spinner = ora();
  private data;

  constructor(private symbols: string[], private options: QuoteCommandOptions) {}

  public async execute(): Promise<void> {
    if (this.options.interactive && this.options.historical) {
      await this.runInteractive();
    }
    await this.fetch();
    await this.print();
  }

  private async runInteractive() {
    if (!this.options.historical) return;

    const questios = [{
      type: 'datetime',
      name: 'from',
      message: 'From:',
      format: ['yyyy', '-', 'mm', '-', 'dd'],
      initial: moment(this.options.from).toDate(),
    }, {
      type: 'datetime',
      name: 'to',
      message: 'To:',
      format: ['yyyy', '-', 'mm', '-', 'dd'],
      initial: moment(this.options.to).toDate(),
    }, {
      type: 'list',
      name: 'period',
      message: 'Period:',
      choices: [
        { name: 'Daily', value: 'd' },
        { name: 'Weekly', value: 'w' },
        { name: 'Monthly', value: 'm' },
        { name: 'Dividends Only', value: 'v' },
      ],
    }];

    const answer = await inquirer.prompt(questios);
    this.options = { ...this.options, ...answer };
  }

  private async fetch() {
    this.spinner.start();

    if (this.options.historical) {
      this.data = await yahooFinance.historical({
        symbols: this.symbols,
        from: this.options.from,
        to: this.options.to,
        period: this.options.period, // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
      });
    } else {
      this.data = await yahooFinance.quote({
        symbols: this.symbols,
        modules: ['price', 'summaryDetail'],
      });
    }

    this.spinner.stop();
  }

  private async print() {
    if (this.options.historical) {
      Object.keys(this.data).forEach((symbol) => {
        console.log();
        console.log(chalk.bold.white(symbol));

        const table = (this.options.period === 'v')
          ? new Table({ head: ['Date', 'Dividends'] })
          : new Table({ head: ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'] });

        if (this.options.period === 'v') {
          this.data[symbol].forEach(row => table.push([
            moment(row.date).format('YYYY-MM-DD'),
            numeral(row.dividends).format('0,0.00'),
          ]));
        } else {
          this.data[symbol].forEach(row => table.push([
            moment(row.date).format('YYYY-MM-DD'),
            numeral(row.open).format('0,0.00'),
            numeral(row.high).format('0,0.00'),
            numeral(row.low).format('0,0.00'),
            numeral(row.close).format('0,0.00'),
            numeral(row.volume).format('0,0'),
            numeral(row.adjClose).format('0,0.00'),
          ]));
        }

        console.log(table.toString());
        console.log();
      });
    } else {
      const table = new Table({ head: ['Symbol', 'Name', 'Last', 'Change', 'Change %'] });

      Object.keys(this.data).forEach((symbol) => {
        const color = this.data[symbol].price.regularMarketChange >= 0 ? chalk.bold.green : chalk.bold.red;

        table.push([
          chalk.bold.white(this.data[symbol].price.symbol),
          this.data[symbol].price.shortName,
          { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketPrice).format('0.00')) },
          { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketChange).format('+0.00')) },
          { hAlign:'right', content: color(numeral(this.data[symbol].price.regularMarketChangePercent).format('+0.00%')) },
        ]);
      });

      console.log(table.toString());
      console.log();
    }
  }
}
