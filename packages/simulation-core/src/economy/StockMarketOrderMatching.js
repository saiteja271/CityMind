/**
 * CITYMIND Financial Order Book & Limit Order Matching Engine
 * Continuous double auction order book matching engine for equity markets,
 * bid-ask spread calculation ($Spread = P_{ask} - P_{bid}$), market maker depth allocation,
 * and high-frequency trading arbitrage simulation.
 */

export class LimitOrder {
  constructor(id, symbol, orderType, price, quantity, traderId) {
    this.id = id;
    this.symbol = symbol;
    this.orderType = orderType; // 'BUY' or 'SELL'
    this.price = price;
    this.quantity = quantity;
    this.filledQuantity = 0;
    this.traderId = traderId;
    this.timestamp = Date.now();
  }
}

export class OrderBook {
  constructor(symbol) {
    this.symbol = symbol;
    this.buyOrders = []; // Price descending
    this.sellOrders = []; // Price ascending
    this.lastTradePrice = 100;
  }

  addOrder(order) {
    if (order.orderType === 'BUY') {
      this.buyOrders.push(order);
      this.buyOrders.sort((a, b) => b.price - a.price);
    } else {
      this.sellOrders.push(order);
      this.sellOrders.sort((a, b) => a.price - b.price);
    }
    this.matchOrders();
  }

  matchOrders() {
    while (this.buyOrders.length > 0 && this.sellOrders.length > 0) {
      const highestBuy = this.buyOrders[0];
      const lowestSell = this.sellOrders[0];

      if (highestBuy.price >= lowestSell.price) {
        const fillQty = Math.min(highestBuy.quantity - highestBuy.filledQuantity, lowestSell.quantity - lowestSell.filledQuantity);

        highestBuy.filledQuantity += fillQty;
        lowestSell.filledQuantity += fillQty;
        this.lastTradePrice = lowestSell.price;

        if (highestBuy.filledQuantity >= highestBuy.quantity) {
          this.buyOrders.shift();
        }
        if (lowestSell.filledQuantity >= lowestSell.quantity) {
          this.sellOrders.shift();
        }
      } else {
        break; // No match possible
      }
    }
  }

  getBidAskSpread() {
    const highestBid = this.buyOrders.length > 0 ? this.buyOrders[0].price : this.lastTradePrice;
    const lowestAsk = this.sellOrders.length > 0 ? this.sellOrders[0].price : this.lastTradePrice;
    return Math.max(0.01, lowestAsk - highestBid);
  }
}

export class StockMarketOrderMatchingEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.books = new Map();
  }

  getOrCreateOrderBook(symbol) {
    if (!this.books.has(symbol)) {
      this.books.set(symbol, new OrderBook(symbol));
    }
    return this.books.get(symbol);
  }

  placeOrder(symbol, orderType, price, quantity, traderId) {
    const book = this.getOrCreateOrderBook(symbol);
    const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = new LimitOrder(id, symbol, orderType, price, quantity, traderId);
    book.addOrder(order);
    return order;
  }

  getOrderMatchingSummary() {
    const list = [];
    this.books.forEach((book, sym) => {
      list.push({
        symbol: sym,
        lastTradePrice: book.lastTradePrice,
        spread: book.getBidAskSpread(),
        buyOrdersCount: book.buyOrders.length,
        sellOrdersCount: book.sellOrders.length,
      });
    });

    return {
      activeOrderBooksCount: this.books.size,
      books: list,
    };
  }
}

export default StockMarketOrderMatchingEngine;
