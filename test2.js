require('dotenv').config()

const Alpaca = require('@alpacahq/alpaca-trade-api')
const { ema } = require('moving-averages')

console.log("running with", process.env.ALPACA_KEY, process.env.ALPACA_SECRET, process.env.ALPACA_PAPER)

const paca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: process.env.ALPACA_PAPER,
});

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const socket = paca.websocket;  // TODO(psq): unused?  just for now?

const Universe = ["AAPL", "GE", "ON", "IBM", "INTC"]
const SUBSET = .6
// S&P500?
// const Universe = ['MMM', 'ABT', 'ABBV', 'ACN', 'ATVI', 'AYI', 'ADBE', 'AMD', 'AAP', 'AES', 'AET', 'AMG', 'AFL', 'A', 'APD', 'AKAM', 'ALK', 'ALB', 'ARE', 'ALXN', 'ALGN', 'ALLE', 'AGN', 'ADS', 'LNT', 'ALL', 'GOOGL', 'GOOG', 'MO', 'AMZN', 'AEE', 'AAL', 'AEP', 'AXP', 'AIG', 'AMT', 'AWK', 'AMP', 'ABC', 'AME', 'AMGN', 'APH', 'APC', 'ADI', 'ANDV', 'ANSS', 'ANTM', 'AON', 'AOS', 'APA', 'AIV', 'AAPL', 'AMAT', 'APTV', 'ADM', 'ARNC', 'AJG', 'AIZ', 'T', 'ADSK', 'ADP', 'AZO', 'AVB', 'AVY', 'BHGE', 'BLL', 'BAC', 'BK', 'BAX', 'BBT', 'BDX', 'BRK.B', 'BBY', 'BIIB', 'BLK', 'HRB', 'BA', 'BKNG', 'BWA', 'BXP', 'BSX', 'BHF', 'BMY', 'AVGO', 'BF.B', 'CHRW', 'CA', 'COG', 'CDNS', 'CPB', 'COF', 'CAH', 'KMX', 'CCL', 'CAT', 'CBOE', 'CBRE', 'CBS', 'CELG', 'CNC', 'CNP', 'CTL', 'CERN', 'CF', 'SCHW', 'CHTR', 'CVX', 'CMG', 'CB', 'CHD', 'CI', 'XEC', 'CINF', 'CTAS', 'CSCO', 'C', 'CFG', 'CTXS', 'CLX', 'CME', 'CMS', 'KO', 'CTSH', 'CL', 'CMCSA', 'CMA', 'CAG', 'CXO', 'COP', 'ED', 'STZ', 'COO', 'GLW', 'COST', 'COTY', 'CCI', 'CSX', 'CMI', 'CVS', 'DHI', 'DHR', 'DRI', 'DVA', 'DE', 'DAL', 'XRAY', 'DVN', 'DLR', 'DFS', 'DISCA', 'DISCK', 'DISH', 'DG', 'DLTR', 'D', 'DOV', 'DWDP', 'DPS', 'DTE', 'DRE', 'DUK', 'DXC', 'ETFC', 'EMN', 'ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'EMR', 'ETR', 'EVHC', 'EOG', 'EQT', 'EFX', 'EQIX', 'EQR', 'ESS', 'EL', 'ES', 'RE', 'EXC', 'EXPE', 'EXPD', 'ESRX', 'EXR', 'XOM', 'FFIV', 'FB', 'FAST', 'FRT', 'FDX', 'FIS', 'FITB', 'FE', 'FISV', 'FLIR', 'FLS', 'FLR', 'FMC', 'FL', 'F', 'FTV', 'FBHS', 'BEN', 'FCX', 'GPS', 'GRMN', 'IT', 'GD', 'GE', 'GGP', 'GIS', 'GM', 'GPC', 'GILD', 'GPN', 'GS', 'GT', 'GWW', 'HAL', 'HBI', 'HOG', 'HRS', 'HIG', 'HAS', 'HCA', 'HCP', 'HP', 'HSIC', 'HSY', 'HES', 'HPE', 'HLT', 'HOLX', 'HD', 'HON', 'HRL', 'HST', 'HPQ', 'HUM', 'HBAN', 'HII', 'IDXX', 'INFO', 'ITW', 'ILMN', 'IR', 'INTC', 'ICE', 'IBM', 'INCY', 'IP', 'IPG', 'IFF', 'INTU', 'ISRG', 'IVZ', 'IPGP', 'IQV', 'IRM', 'JEC', 'JBHT', 'SJM', 'JNJ', 'JCI', 'JPM', 'JNPR', 'KSU', 'K', 'KEY', 'KMB', 'KIM', 'KMI', 'KLAC', 'KSS', 'KHC', 'KR', 'LB', 'LLL', 'LH', 'LRCX', 'LEG', 'LEN', 'LUK', 'LLY', 'LNC', 'LKQ', 'LMT', 'L', 'LOW', 'LYB', 'MTB', 'MAC', 'M', 'MRO', 'MPC', 'MAR', 'MMC', 'MLM', 'MAS', 'MA', 'MAT', 'MKC', 'MCD', 'MCK', 'MDT', 'MRK', 'MET', 'MTD', 'MGM', 'KORS', 'MCHP', 'MU', 'MSFT', 'MAA', 'MHK', 'TAP', 'MDLZ', 'MON', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MSCI', 'MYL', 'NDAQ', 'NOV', 'NAVI', 'NKTR', 'NTAP', 'NFLX', 'NWL', 'NFX', 'NEM', 'NWSA', 'NWS', 'NEE', 'NLSN', 'NKE', 'NI', 'NBL', 'JWN', 'NSC', 'NTRS', 'NOC', 'NCLH', 'NRG', 'NUE', 'NVDA', 'ORLY', 'OXY', 'OMC', 'OKE', 'ORCL', 'PCAR', 'PKG', 'PH', 'PAYX', 'PYPL', 'PNR', 'PBCT', 'PEP', 'PKI', 'PRGO', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PXD', 'PNC', 'RL', 'PPG', 'PPL', 'PX', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PSA', 'PHM', 'PVH', 'QRVO', 'PWR', 'QCOM', 'DGX', 'RRC', 'RJF', 'RTN', 'O', 'RHT', 'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RHI', 'ROK', 'COL', 'ROP', 'ROST', 'RCL', 'CRM', 'SBAC', 'SCG', 'SLB', 'STX', 'SEE', 'SRE', 'SHW', 'SPG', 'SWKS', 'SLG', 'SNA', 'SO', 'LUV', 'SPGI', 'SWK', 'SBUX', 'STT', 'SRCL', 'SYK', 'STI', 'SIVB', 'SYMC', 'SYF', 'SNPS', 'SYY', 'TROW', 'TTWO', 'TPR', 'TGT', 'TEL', 'FTI', 'TXN', 'TXT', 'TMO', 'TIF', 'TWX', 'TJX', 'TMK', 'TSS', 'TSCO', 'TDG', 'TRV', 'TRIP', 'FOXA', 'FOX', 'TSN', 'UDR', 'ULTA', 'USB', 'UAA', 'UA', 'UNP', 'UAL', 'UNH', 'UPS', 'URI', 'UTX', 'UHS', 'UNM', 'VFC', 'VLO', 'VAR', 'VTR', 'VRSN', 'VRSK', 'VZ', 'VRTX', 'VIAB', 'V', 'VNO', 'VMC', 'WMT', 'WBA', 'DIS', 'WM', 'WAT', 'WEC', 'WFC', 'WELL', 'WDC', 'WU', 'WRK', 'WY', 'WHR', 'WMB', 'WLTW', 'WYN', 'WYNN', 'XEL', 'XRX', 'XLNX', 'XL', 'XYL', 'YUM', 'ZBH', 'ZION', 'ZTS']
// const SUBSET = 1 / 20

console.log("Universe.length", Universe.length)


// This will give you the symbols OHLCV information for the current trading day or, if the market is closed,
// the last day the market was open.
// There are some checks to adjust what to specify for end_dt parameter since we want to make sure this function
// always returns the prices up to yesterday, even if you call it during market hours. If you call this like prices(['AAPL']),
// you will get a DataFrame object containing Apple’s price data.
// obviously, a DataFrame object means nothing in the JS world, so we'll adjust as needed

// clock
// { timestamp: '2019-01-27T03:54:32.373486028-05:00',
//   is_open: false,
//   next_open: '2019-01-28T09:30:00-05:00',
//   next_close: '2019-01-28T16:00:00-05:00' }


function SMA(bars, n, type) {
  let result = 0
  for (let i = bars.length - n; i < bars.length; i++) {
    // console.log(i, bars[i][type])
    if (bars[i]) {
      result += bars[i][type]
    } else {
      console.log("no bar data", bars)
      return -1000000
    }
  }
  return result / n
}

function EMA(bars, n, type) {
  // console.log("ema.input", bars.slice(Math.max(bars.length - n, 1)).map(a => a[type]))
  const results = ema(bars.slice(Math.max(bars.length - n, 1)).map(a => a[type]), n)
  // console.log("ema.results", results)
  return results[results.length - 1]
}

async function get_bar_sets(now, symbols) {
  // TODO(psq): may need to adjust to yesterday's date if after market open in new york (9:30am)?

  let result = {}
  const start_date = new Date(now.getTime())
  start_date.setDate(now.getDate() - 50) // 50 days prior
  console.log("start_date", start_date.toLocaleDateString("en-US"))
  console.log("now", now.toLocaleDateString("en-US"))

  // split universe into chunks of 100!!! or less as the this a limit of the api
  for (i=0; i < symbols.length; i += 100) {
    const subset = symbols.slice(i, i + 100);
    const bar_sets = await paca.getBars('day', subset, {
      limit: 50,
      start: start_date,
      end: now
    })
    Object.keys(bar_sets).forEach((k => {
      result[k] = bar_sets[k]
    }))
  }
  // console.log(result)
  return result;
}

// calculate oversold ranking based on EMA(close, 10)
async function calc_scores(bar_sets, dayindex = -1) {
  const type = 'c'
  const raw_scores = Object.keys(bar_sets).map(symbol => {
    if (bar_sets[symbol].length === 0) {
      return null
    }
    const ema = EMA(bar_sets[symbol], 10, type)
    const last = bar_sets[symbol][bar_sets[symbol].length - 1][type]
    const score = (last - ema) / last
    // console.log("ema", symbol, ema, last, score)
    return {
      symbol,
      ema,
      last,
      score,
    }
  }).filter(a => a !== null)
  return raw_scores.sort((a, b) => (a.score - b.score))
}

async function get_orders(bar_sets, position_size = 100, max_positions = 5) {
  console.log("get_orders-----------------------------------------")
  const orders = []
  const ranked = await calc_scores(bar_sets)
  console.log(ranked)

  const account = await paca.getAccount()
  console.log("account", account)

  const to_sell = []

  // take the top one twentieth out of ranking,
  // excluding stocks too expensive to buy a share
  const to_buy = ranked.filter(s => (s.last < account.cash)).slice(0, ranked.length * SUBSET).map(s => s.symbol)

  // retrieve current positions
  const positions = await paca.getPositions()
  console.log("current positions")

  const holdings = positions.map(s => s.symbol)

  const actual_sell = holdings.filter(s => !to_buy.includes(s))
  const actual_buy = to_buy.filter(s => !holdings.includes(s))

  // if a stock is in the portfolio, and not in the desired portfolio, sell it
  actual_sell.forEach(s => {
    orders.push({
      'symbol': s,
      'qty': positions.filter(pos => pos.symbol === s)[0].qty,
      'side': 'sell',
    })
  })

  // likewise, if the portfolio is missing stocks from the
  // desired portfolio, buy them. We sent a limit for the total
  // position size so that we don't end up holding too many positions.
  const max_to_buy = max_positions - positions.length - to_sell.length
  console.log("max_to_buy", max_to_buy, positions.length, to_sell.length)

  actual_buy.slice(0, max_to_buy).forEach(s => {
    orders.push({
      'symbol': s,
      'qty': position_size,  // TODO(psq): this should buy equal amount (in USD, not in shares)
      'side': 'buy',
    })

  })

  return orders
}

async function trade(orders, wait = 30) {
  console.log("trade", orders)

  // cancel all previously open orders, probably stale for this algo

  const existing = await paca.getOrders({status: 'open'})
  for await (const o of existing) {
    console.log("cancelOrder", o)
    try {
      await paca.cancelOrder(o.id)
    } catch(e) {
      console.log("cancelOrder failure", e)
    }
  }

  // This is where we actually submit the orders and wait for them to fill.
  // Waiting is an important step since the orders aren't filled automatically,
  // which means if your buys happen to come before your sells have filled,
  // the buy orders will be bounced. In order to make the transition smooth,
  // we sell first and wait for all the sell orders to fill before submitting
  // our buy orders.

  // process the sell orders first
  const sells = orders.filter(o => o.side === 'sell')
  console.log("sell orders", sells)

  sells.forEach(async o => {
    console.log("create order", o)
    const order = await paca.createOrder({
      symbol: o.symbol,
      qty: o.qty,
      side: 'sell',
      type: 'market',
      time_in_force: 'gtc',
      // limit_price: 20.52,
      // stop_price: 20.12,
      client_order_id: `test_${Math.random()}`
    })
    console.log("sell order", order)
  })

  let count = wait
  while (count > 0) {
    const pending = await paca.getOrders({status: 'open'})
    console.log("getOrder.pending", pending)
    if (pending.length === 0) {
      console.log('all sell orders done')
      break
    }
    console.log("Still waiting for", pending.length, "sells")
    await sleep(5000) // wait 5s
    count -= 1
  }
  if (count === 0) {
    console.log("gave up on waiting for sell orders========================")
  }

  // process the buy orders next
  const buys = orders.filter(o => o.side === 'buy')
  console.log("buy orders", sells)

  buys.forEach(async o => {
    const order = await paca.createOrder({
      symbol: o.symbol,
      qty: o.qty,
      side: 'buy',
      type: 'market',
      time_in_force: 'gtc',
      // limit_price: 20.52,
      // stop_price: 20.12,
      client_order_id: `test_${Math.random()}`
    })
    console.log("buy order", order)
  })

  count = wait
  while (count > 0) {
    const pending = await paca.getOrders({status: 'open'})
    console.log("getOrder.pending", pending)
    if (pending.length === 0) {
      console.log('all buy orders done')
      break
    }
    console.log("Still waiting for", pending.length, "buys")
    await sleep(5000) // wait 5s
    count -= 1
  }

  if (count === 0) {
    console.log("gave up on waiting for buy orders========================")
  }
}


(async function () {
  console.log("start")
  let done = ''
  while (true) {

// { timestamp: '2019-01-26T05:15:39.170145814-05:00',
//   is_open: false,
//   next_open: '2019-01-28T09:30:00-05:00',
//   next_close: '2019-01-28T16:00:00-05:00' }

    const clock = await paca.getClock()
    const now = new Date(clock.timestamp)
    if (clock.is_open && done != now.toLocaleDateString("en-US")) {
      const bar_sets = await get_bar_sets(now, Universe)
      const orders = await get_orders(bar_sets)
      trade(orders)

      done = now.toLocaleDateString("en-US")
    } else {
      console.log("not open till", clock.next_open, clock.timestamp, now.toLocaleDateString("en-US"))
    }


    await sleep(5 * 60 * 1000)  // 5 minutes
  }
  console.log("done")
})()


