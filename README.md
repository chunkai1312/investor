# investor

> A investor's CLI tool written in NodeJS

All stock data come from [Yahoo Finance](http://finance.yahoo.com/) powered by [node-yahoo-finance](https://github.com/pilwon/node-yahoo-finance).

## Install

```
$ npm install -g investor
```

## Usage

`investor` currently provides two commands:
  - [`quote` or `q`](#quote)
  - [`watchlist` or `w`](#watchlist)

### Quote

```
Usage: investor quote|q [options] <symbols...>

Fetches current or historical quotes for the symbol(s).

Options:
  -H, --historical    Fetches historical quotes. (default: false)
  --from [date]       The start date when fetching historical data.
  --to [date]         The end date when fetching historical data.
  --period [d|w|m|v]  The frequency of returned data. (default: "d")
  -i, --interactive   Enable interactive mode for fetching historical quotes. (default: false)
  -h, --help          display help for command
```

### Watchlist

```
Usage: investor watchlist|w [options] [lists...]

Fetches and display current quotes for the symbols in the watchlist(s).

Options:
  -c, --create               Create new watchlist(s)
  -d, --delete               Delete the watchlist(s)
  -a, --add <symbols...>     Add ticker symbol(s) to the watchlist.
  -r, --remove <symbols...>  Remove ticker symbol(s) from the watchlist.
  --rename <name>            Rename the watchlist name.
  -h, --help                 display help for command
```

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)
