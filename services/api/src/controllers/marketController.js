/**
 * MARKET CONTROLLER & ORDER BOOK ENGINE FOR CITYMIND INTER-CITY TRADING
 */

// COMMODITY CONFIGURATION DATABASE
export const COMMODITIES = {
  ELECTRICITY: { id: 'ELECTRICITY', name: 'Electrical Power', unit: 'MW/h', basePrice: 45.0, volatility: 0.12, maxSupply: 50000 },
  WATER: { id: 'WATER', name: 'Clean Fresh Water', unit: 'm3/s', basePrice: 20.0, volatility: 0.08, maxSupply: 100000 },
  STEEL: { id: 'STEEL', name: 'Structural Steel', unit: 'tons', basePrice: 150.0, volatility: 0.18, maxSupply: 25000 },
  ELECTRONICS: { id: 'ELECTRONICS', name: 'Microchip Components', unit: 'units', basePrice: 350.0, volatility: 0.25, maxSupply: 10000 },
  CONSUMER_GOODS: { id: 'CONSUMER_GOODS', name: 'Consumer Goods', unit: 'units', basePrice: 85.0, volatility: 0.10, maxSupply: 40000 },
  FOOD: { id: 'FOOD', name: 'Agricultural Food', unit: 'tons', basePrice: 60.0, volatility: 0.15, maxSupply: 60000 },
  RENEWABLE_CREDITS: { id: 'RENEWABLE_CREDITS', name: 'Green Energy Credits', unit: 'MWh', basePrice: 30.0, volatility: 0.20, maxSupply: 30000 }
};

// IN-MEMORY STATE FOR MARKET & ORDER BOOK
const marketState = {
  inflationIndex: 1.02,
  tariffRatePercent: 5.0,
  tradingVolume24h: 1450000,
  spotPrices: {
    ELECTRICITY: 48.50,
    WATER: 19.80,
    STEEL: 162.00,
    ELECTRONICS: 380.50,
    CONSUMER_GOODS: 88.00,
    FOOD: 62.40,
    RENEWABLE_CREDITS: 32.10
  },
  priceHistory: {
    ELECTRICITY: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 42 + Math.sin(i * 0.5) * 5, volume: 1200 })),
    WATER: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 18 + Math.cos(i * 0.4) * 2, volume: 3400 })),
    STEEL: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 145 + Math.sin(i * 0.3) * 15, volume: 450 })),
    ELECTRONICS: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 340 + Math.cos(i * 0.2) * 35, volume: 210 })),
    CONSUMER_GOODS: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 82 + Math.sin(i * 0.4) * 6, volume: 1800 })),
    FOOD: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 58 + Math.cos(i * 0.5) * 4, volume: 2200 })),
    RENEWABLE_CREDITS: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 28 + Math.sin(i * 0.6) * 4, volume: 890 }))
  }
};

// ORDER BOOK REGISTRY (BUY & SELL ORDERS)
const orderBook = {
  buyOrders: [
    { id: 'ord_b1', cityId: 'city_01', cityName: 'Metropolis', commodity: 'ELECTRICITY', type: 'LIMIT_BUY', price: 47.0, quantity: 200, filled: 0, createdAt: new Date().toISOString() },
    { id: 'ord_b2', cityId: 'city_02', cityName: 'Sun Valley', commodity: 'WATER', type: 'LIMIT_BUY', price: 19.0, quantity: 500, filled: 100, createdAt: new Date().toISOString() }
  ],
  sellOrders: [
    { id: 'ord_s1', cityId: 'city_03', cityName: 'Oldport Basin', commodity: 'STEEL', type: 'LIMIT_SELL', price: 160.0, quantity: 150, filled: 0, createdAt: new Date().toISOString() },
    { id: 'ord_s2', cityId: 'city_01', cityName: 'Metropolis', commodity: 'ELECTRICITY', type: 'LIMIT_SELL', price: 50.0, quantity: 300, filled: 0, createdAt: new Date().toISOString() }
  ]
};

// ACTIVE LONG-TERM RECURRING CONTRACTS
const activeContracts = [
  {
    id: 'cnt_101',
    sellerCityId: 'city_02',
    sellerCityName: 'Sun Valley Oasis',
    buyerCityId: 'city_01',
    buyerCityName: 'Metropolis Megacity',
    commodity: 'ELECTRICITY',
    quantityPerMonth: 100,
    unitPrice: 44.0,
    monthlyBilling: 4400,
    startDate: '2026-08-01',
    durationMonths: 12,
    status: 'ACTIVE'
  }
];

/**
 * HELPER: ORDER BOOK MATCHING ENGINE
 */
const runOrderMatchingEngine = (commodity) => {
  const buys = orderBook.buyOrders
    .filter(o => o.commodity === commodity && o.quantity > o.filled)
    .sort((a, b) => b.price - a.price); // Highest buy price first

  const sells = orderBook.sellOrders
    .filter(o => o.commodity === commodity && o.quantity > o.filled)
    .sort((a, b) => a.price - b.price); // Lowest sell price first

  const executedTrades = [];

  let buyIdx = 0;
  let sellIdx = 0;

  while (buyIdx < buys.length && sellIdx < sells.length) {
    const buy = buys[buyIdx];
    const sell = sells[sellIdx];

    // Check if buy price meets sell price requirement
    if (buy.price >= sell.price) {
      const matchPrice = (buy.price + sell.price) / 2;
      const tradeQty = Math.min(buy.quantity - buy.filled, sell.quantity - sell.filled);

      buy.filled += tradeQty;
      sell.filled += tradeQty;

      // Update spot price
      marketState.spotPrices[commodity] = matchPrice;
      marketState.tradingVolume24h += tradeQty * matchPrice;

      executedTrades.push({
        id: `trd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        commodity,
        quantity: tradeQty,
        executionPrice: matchPrice,
        buyerCityId: buy.cityId,
        sellerCityId: sell.cityId,
        totalAmount: tradeQty * matchPrice,
        executedAt: new Date().toISOString()
      });

      if (buy.filled >= buy.quantity) buyIdx++;
      if (sell.filled >= sell.quantity) sellIdx++;
    } else {
      break; // No match possible
    }
  }

  return executedTrades;
};

/**
 * 1. GET MARKET TICKER (Spot Prices & 24h Performance)
 */
export const getMarketTicker = async (req, res) => {
  try {
    const ticker = Object.keys(COMMODITIES).map(key => {
      const comm = COMMODITIES[key];
      const spot = marketState.spotPrices[key] || comm.basePrice;
      const history = marketState.priceHistory[key] || [];
      const prevPrice = history.length > 1 ? history[history.length - 2].price : comm.basePrice;
      const changePercent = (((spot - prevPrice) / prevPrice) * 100).toFixed(2);

      return {
        id: comm.id,
        name: comm.name,
        unit: comm.unit,
        spotPrice: spot,
        basePrice: comm.basePrice,
        change24hPercent: Number(changePercent),
        high24h: Math.max(...history.map(h => h.price), spot),
        low24h: Math.min(...history.map(h => h.price), spot),
        volatility: comm.volatility
      };
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      inflationIndex: marketState.inflationIndex,
      tariffRatePercent: marketState.tariffRatePercent,
      tradingVolume24h: marketState.tradingVolume24h,
      ticker
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. GET COMMODITY HISTORICAL DATA (For Canvas/SVG Charts)
 */
export const getCommodityHistory = async (req, res) => {
  try {
    const { commodity } = req.params;
    if (!commodity || !COMMODITIES[commodity]) {
      return res.status(400).json({ success: false, error: 'Invalid commodity identifier' });
    }

    const history = marketState.priceHistory[commodity] || [];
    return res.status(200).json({
      success: true,
      commodity,
      unit: COMMODITIES[commodity].unit,
      dataPoints: history
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. GET ORDER BOOK DEPTH
 */
export const getOrderBook = async (req, res) => {
  try {
    const { commodity } = req.query;

    let buys = orderBook.buyOrders;
    let sells = orderBook.sellOrders;

    if (commodity && COMMODITIES[commodity]) {
      buys = buys.filter(o => o.commodity === commodity);
      sells = sells.filter(o => o.commodity === commodity);
    }

    return res.status(200).json({
      success: true,
      buyOrders: buys,
      sellOrders: sells,
      totalOpenBuys: buys.length,
      totalOpenSells: sells.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. PLACE NEW TRADE ORDER (Limit or Market Buy/Sell)
 */
export const placeTradeOrder = async (req, res) => {
  try {
    const { cityId, cityName, commodity, type, price, quantity } = req.body;

    if (!cityId || !commodity || !type || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Missing required order parameters (cityId, commodity, type, quantity)' });
    }

    if (!COMMODITIES[commodity]) {
      return res.status(400).json({ success: false, error: 'Unsupported commodity type' });
    }

    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cityId,
      cityName: cityName || 'Mayor City',
      commodity,
      type, // 'LIMIT_BUY' | 'LIMIT_SELL' | 'MARKET_BUY' | 'MARKET_SELL'
      price: Number(price) || marketState.spotPrices[commodity],
      quantity: Number(quantity),
      filled: 0,
      createdAt: new Date().toISOString()
    };

    if (type.includes('BUY')) {
      orderBook.buyOrders.push(newOrder);
    } else {
      orderBook.sellOrders.push(newOrder);
    }

    // Run Order Matching Engine
    const tradesExecuted = runOrderMatchingEngine(commodity);

    return res.status(201).json({
      success: true,
      message: 'Trade order submitted successfully',
      order: newOrder,
      tradesExecuted
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 5. CANCEL TRADE ORDER
 */
export const cancelTradeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    let foundIndex = orderBook.buyOrders.findIndex(o => o.id === orderId);
    if (foundIndex !== -1) {
      const removed = orderBook.buyOrders.splice(foundIndex, 1)[0];
      return res.status(200).json({ success: true, message: 'Buy order cancelled', order: removed });
    }

    foundIndex = orderBook.sellOrders.findIndex(o => o.id === orderId);
    if (foundIndex !== -1) {
      const removed = orderBook.sellOrders.splice(foundIndex, 1)[0];
      return res.status(200).json({ success: true, message: 'Sell order cancelled', order: removed });
    }

    return res.status(404).json({ success: false, error: 'Order not found' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 6. CREATE LONG-TERM RECURRING SUPPLY CONTRACT
 */
export const createTradeContract = async (req, res) => {
  try {
    const { sellerCityId, sellerCityName, buyerCityId, buyerCityName, commodity, quantityPerMonth, unitPrice, durationMonths } = req.body;

    if (!sellerCityId || !buyerCityId || !commodity || !quantityPerMonth || !unitPrice) {
      return res.status(400).json({ success: false, error: 'Missing contract requirements' });
    }

    const newContract = {
      id: `cnt_${Date.now()}`,
      sellerCityId,
      sellerCityName: sellerCityName || 'Seller City',
      buyerCityId,
      buyerCityName: buyerCityName || 'Buyer City',
      commodity,
      quantityPerMonth: Number(quantityPerMonth),
      unitPrice: Number(unitPrice),
      monthlyBilling: Number(quantityPerMonth) * Number(unitPrice),
      startDate: new Date().toISOString().split('T')[0],
      durationMonths: Number(durationMonths) || 12,
      status: 'ACTIVE'
    };

    activeContracts.push(newContract);

    return res.status(201).json({
      success: true,
      message: 'Trade contract created successfully',
      contract: newContract
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 7. GET CITY CONTRACTS
 */
export const getCityContracts = async (req, res) => {
  try {
    const { cityId } = req.params;
    const cityContracts = activeContracts.filter(c => c.sellerCityId === cityId || c.buyerCityId === cityId);
    return res.status(200).json({ success: true, count: cityContracts.length, contracts: cityContracts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 8. ADVANCE MARKET SIMULATION TICK (Admin / Engine Trigger)
 */
export const advanceMarketTick = async (req, res) => {
  try {
    // Randomize prices slightly based on volatility
    Object.keys(COMMODITIES).forEach(key => {
      const comm = COMMODITIES[key];
      const current = marketState.spotPrices[key];
      const change = (Math.random() - 0.48) * comm.volatility * current;
      const newPrice = Math.max(1.0, Number((current + change).toFixed(2)));
      
      marketState.spotPrices[key] = newPrice;

      // Append to history
      if (!marketState.priceHistory[key]) marketState.priceHistory[key] = [];
      const history = marketState.priceHistory[key];
      if (history.length >= 48) history.shift();
      history.push({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: newPrice,
        volume: Math.floor(Math.random() * 2000 + 500)
      });

      // Match orders
      runOrderMatchingEngine(key);
    });

    return res.status(200).json({
      success: true,
      message: 'Market simulation tick executed',
      spotPrices: marketState.spotPrices
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
