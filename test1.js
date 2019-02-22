require('dotenv').config()

const Alpaca = require('@alpacahq/alpaca-trade-api')

console.log("running with", process.env.ALPACA_KEY, process.env.ALPACA_SECRET, process.env.ALPACA_PAPER)

const paca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: process.env.ALPACA_PAPER,
});

const socket = paca.websocket;

(async function () {
  console.log(await paca.getAccount())
  console.log(await paca.getClock())
  console.log(await paca.getCalendar({ start: '2019-01-21', end: new Date() }))

  socket.onConnect((...args) => {
    console.log('CONNECTED', ...args)
    socket.subscribe(['T.AAPL', 'T.TWTR', 'Q.*'])
  })

  socket.onStockTrades((subject, data) => {
    console.log('STOCK TRADES', data.sym)
  })

  socket.onOrderUpdate((...args) => {
    console.log('ORDER UPDATE', ...args)
  })

  socket.onStateChange((...args) => {
    console.log('STATE CHANGE', ...args)
  })

  socket.connect()

  const order = await paca.createOrder({
    symbol: 'TWTR',
    qty: 2,
    side: 'buy',
    type: 'stop_limit',
    time_in_force: 'gtc',
    limit_price: 20.52,
    stop_price: 20.12,
    client_order_id: `test_${Math.random()}`
  })
  await paca.cancelOrder(order.id)
  console.log(await paca.getOrderByClientId(order.client_order_id))
  console.log(await paca.getOrders({ status: 'canceled', limit: 2 }))

  const positions = await paca.getPositions()
  console.log("getPositions", positions)
  // console.log(await paca.getPosition(positions[0].symbol))

  console.log("getAsset('AAPL')", await paca.getAsset('AAPL'))
  await paca.getAssets({ status: 'inactive', asset_class: 'us_equity' })

  console.log(await paca.getBars('15Min', ['MSFT', 'AAPL'], {
    limit: 4,
    start: new Date('December 1 2018'),
    end: new Date()
  }))

  console.log("exchanges", await paca.getExchanges())
  console.log("getSymbolTypeMap", await paca.getSymbolTypeMap())
  console.log("getHistoricTrades", await paca.getHistoricTrades('AAPL', new Date(), { limit: 2, offset: 2 }))
  console.log("getHistoricQuotes", await paca.getHistoricQuotes('AAPL', new Date(), { limit: 2, offset: 2 }))
  console.log("getHistoricAggregates", await paca.getHistoricAggregates('minute', 'AAPL', {
    from: new Date('December 1 2018'),
    to: new Date(),
    limit: 2,
    unadjusted: false,
  }))
  console.log("getLastTrade", await paca.getLastTrade('AAPL'))
  console.log("getLastQuote", await paca.getLastQuote('AAPL'))
  console.log("getConditionMap", await paca.getConditionMap())
  console.log("getCompany", await paca.getCompany('AAPL'))
  console.log("getAnalysts", await paca.getAnalysts('AAPL'))
  console.log("getDividends", await paca.getDividends('AAPL'))
  console.log("getSplits", await paca.getSplits('AAPL'))
  console.log("getFinancials", await paca.getFinancials('AAPL'))
  console.log("getEarnings", await paca.getEarnings('AAPL'))
  console.log("getNews", await paca.getNews('AAPL'))

  await socket.disconnect()

  console.log('\n✓ done')
})()
