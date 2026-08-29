/**
 * PredictiveEngine.js - Advanced Time-Series Forecasting & Analytics Engine
 * 
 * Provides mathematical forecasting models: Exponential Smoothing (Holt-Winters double & triple),
 * ARIMA approximation, Linear & Polynomial Regression, Moving Averages (SMA, EMA, WMA),
 * Seasonal Decomposition, domain predictors (population 60-ticks out, cash flow, energy, traffic, healthcare, pollution),
 * auto model selection (cross-validation), what-if scenario simulations, and forecast risk alerts.
 */

import { EventEmitter, clamp } from '@citymind/utilities';

/**
 * Time-Series Data Buffer with Statistical Analysis & Filtering
 */
export class TimeSeriesBuffer {
  /**
   * @param {number} capacity - Maximum sliding window history capacity
   */
  constructor(capacity = 500) {
    this.capacity = capacity;
    this.timestamps = [];
    this.values = [];
  }

  /**
   * Append data point to buffer.
   * @param {number} val 
   * @param {number} [timestamp] 
   */
  push(val, timestamp = Date.now()) {
    if (typeof val !== 'number' || isNaN(val)) return;

    this.values.push(val);
    this.timestamps.push(timestamp);

    if (this.values.length > this.capacity) {
      this.values.shift();
      this.timestamps.shift();
    }
  }

  /**
   * Clear buffer.
   */
  clear() {
    this.values = [];
    this.timestamps = [];
  }

  /**
   * Get size.
   * @returns {number}
   */
  get size() {
    return this.values.length;
  }

  /**
   * Retrieve raw values array.
   * @returns {Array<number>}
   */
  getValues() {
    return [...this.values];
  }

  /**
   * Calculate arithmetic mean.
   * @returns {number}
   */
  getMean() {
    if (this.values.length === 0) return 0;
    const sum = this.values.reduce((acc, v) => acc + v, 0);
    return sum / this.values.length;
  }

  /**
   * Calculate variance and standard deviation.
   * @returns {{variance: number, stdDev: number}}
   */
  getVarianceAndStdDev() {
    if (this.values.length <= 1) return { variance: 0, stdDev: 0 };
    const mean = this.getMean();
    const sumSq = this.values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const variance = sumSq / (this.values.length - 1);
    return { variance, stdDev: Math.sqrt(variance) };
  }

  /**
   * Calculate min, max, median, and percentiles.
   * @returns {Object}
   */
  getSummaryStats() {
    if (this.values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0, q1: 0, q3: 0, iqr: 0 };
    }

    const sorted = [...this.values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = this.getMean();
    const { stdDev } = this.getVarianceAndStdDev();

    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    return { min, max, mean, median, stdDev, q1, q3, iqr };
  }

  /**
   * Remove statistical outliers using Z-score threshold.
   * @param {number} [threshold=3.0] 
   * @returns {Array<number>} Cleaned array
   */
  filterOutliersZScore(threshold = 3.0) {
    if (this.values.length < 5) return [...this.values];

    const mean = this.getMean();
    const { stdDev } = this.getVarianceAndStdDev();
    if (stdDev === 0) return [...this.values];

    return this.values.filter(v => Math.abs((v - mean) / stdDev) <= threshold);
  }

  /**
   * Apply Savitzky-Golay 5-point quadratic smoothing filter.
   * @returns {Array<number>} Smoothed values array
   */
  applySavitzkyGolay5() {
    const n = this.values.length;
    if (n < 5) return [...this.values];

    const res = new Array(n);
    // Boundary points copy
    res[0] = this.values[0];
    res[1] = this.values[1];
    res[n - 2] = this.values[n - 2];
    res[n - 1] = this.values[n - 1];

    // Coefficients for 5-point quadratic filter: [-3, 12, 17, 12, -3] / 35
    for (let i = 2; i < n - 2; i++) {
      res[i] = (-3 * this.values[i - 2] + 12 * this.values[i - 1] + 17 * this.values[i] + 12 * this.values[i + 1] - 3 * this.values[i + 2]) / 35;
    }

    return res;
  }
}

/**
 * Mathematical Forecast Algorithms
 */

// 1. Moving Averages
export class MovingAverageModel {
  /**
   * Simple Moving Average (SMA)
   * @param {Array<number>} data 
   * @param {number} windowSize 
   * @param {number} horizonTicks 
   * @returns {Array<number>} Forecast array
   */
  static forecastSMA(data, windowSize = 10, horizonTicks = 60) {
    if (!data || data.length === 0) return new Array(horizonTicks).fill(0);
    const effectiveWindow = Math.min(windowSize, data.length);
    const slice = data.slice(-effectiveWindow);
    const avg = slice.reduce((a, b) => a + b, 0) / effectiveWindow;
    return new Array(horizonTicks).fill(avg);
  }

  /**
   * Exponential Moving Average (EMA)
   * @param {Array<number>} data 
   * @param {number} [alpha=0.2] 
   * @param {number} horizonTicks 
   * @returns {Array<number>} Forecast array
   */
  static forecastEMA(data, alpha = 0.2, horizonTicks = 60) {
    if (!data || data.length === 0) return new Array(horizonTicks).fill(0);

    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = alpha * data[i] + (1 - alpha) * ema;
    }

    return new Array(horizonTicks).fill(ema);
  }

  /**
   * Weighted Moving Average (WMA)
   * @param {Array<number>} data 
   * @param {number} windowSize 
   * @param {number} horizonTicks 
   * @returns {Array<number>}
   */
  static forecastWMA(data, windowSize = 10, horizonTicks = 60) {
    if (!data || data.length === 0) return new Array(horizonTicks).fill(0);
    const k = Math.min(windowSize, data.length);
    const slice = data.slice(-k);

    let weightSum = 0;
    let valueSum = 0;

    for (let i = 0; i < k; i++) {
      const weight = i + 1;
      weightSum += weight;
      valueSum += slice[i] * weight;
    }

    const wma = valueSum / weightSum;
    return new Array(horizonTicks).fill(wma);
  }
}

// 2. Linear Regression (Least Squares)
export class LinearRegressionModel {
  /**
   * Fit OLS Linear Model y = slope * x + intercept
   * @param {Array<number>} data 
   */
  static fit(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0, rSquared: 0, stdErr: 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = data[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      return { slope: 0, intercept: sumY / n, rSquared: 0, stdErr: 0 };
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R2 score computation
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;

    for (let i = 0; i < n; i++) {
      const y = data[i];
      const pred = slope * i + intercept;
      ssTot += Math.pow(y - meanY, 2);
      ssRes += Math.pow(y - pred, 2);
    }

    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
    const stdErr = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

    return { slope, intercept, rSquared, stdErr };
  }

  /**
   * Forecast h ticks ahead.
   * @param {Array<number>} data 
   * @param {number} horizonTicks 
   * @returns {Array<number>}
   */
  static forecast(data, horizonTicks = 60) {
    const { slope, intercept } = this.fit(data);
    const n = data.length;
    const forecastArr = [];

    for (let h = 1; h <= horizonTicks; h++) {
      const futureX = n - 1 + h;
      forecastArr.push(slope * futureX + intercept);
    }

    return forecastArr;
  }
}

// 3. Polynomial Regression (Degree 2, 3, 4 via Gaussian Elimination)
export class PolynomialRegressionModel {
  /**
   * Solves linear system A * x = B using Gaussian Elimination.
   * @param {Array<Array<number>>} A 
   * @param {Array<number>} B 
   * @returns {Array<number>} Coefficients
   */
  static solveGaussian(A, B) {
    const n = B.length;

    for (let i = 0; i < n; i++) {
      // Pivot selection
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }

      // Swap rows
      for (let k = i; k < n; k++) {
        const tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      const tmpB = B[maxRow];
      B[maxRow] = B[i];
      B[i] = tmpB;

      // Pivot check
      if (Math.abs(A[i][i]) < 1e-12) continue;

      // Eliminate
      for (let k = i + 1; k < n; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) {
            A[k][j] = 0;
          } else {
            A[k][j] += c * A[i][j];
          }
        }
        B[k] += c * B[i];
      }
    }

    // Back-substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = B[i];
      for (let j = i + 1; j < n; j++) {
        sum -= A[i][j] * x[j];
      }
      x[i] = A[i][i] !== 0 ? sum / A[i][i] : 0;
    }

    return x;
  }

  /**
   * Fit polynomial model of specified degree (2, 3, or 4).
   * @param {Array<number>} data 
   * @param {number} [degree=2] 
   * @returns {Array<number>} Coefficients [c0, c1, c2, ...]
   */
  static fit(data, degree = 2) {
    const deg = Math.min(4, Math.max(1, degree));
    const n = data.length;
    if (n <= deg) return new Array(deg + 1).fill(0);

    const m = deg + 1;
    const A = Array.from({ length: m }, () => new Array(m).fill(0));
    const B = new Array(m).fill(0);

    // Precalculate sums of powers of X and X^k * Y
    const xPowers = new Array(2 * deg + 1).fill(0);
    for (let i = 0; i < n; i++) {
      for (let p = 0; p <= 2 * deg; p++) {
        xPowers[p] += Math.pow(i, p);
      }
      for (let p = 0; p <= deg; p++) {
        B[p] += Math.pow(i, p) * data[i];
      }
    }

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) {
        A[r][c] = xPowers[r + c];
      }
    }

    return this.solveGaussian(A, B);
  }

  /**
   * Forecast polynomial ahead.
   * @param {Array<number>} data 
   * @param {number} degree 
   * @param {number} horizonTicks 
   * @returns {Array<number>}
   */
  static forecast(data, degree = 2, horizonTicks = 60) {
    const coeffs = this.fit(data, degree);
    const n = data.length;
    const res = [];

    for (let h = 1; h <= horizonTicks; h++) {
      const x = n - 1 + h;
      let y = 0;
      for (let p = 0; p < coeffs.length; p++) {
        y += coeffs[p] * Math.pow(x, p);
      }
      res.push(y);
    }

    return res;
  }
}

// 4. Holt-Winters Exponential Smoothing (Double & Triple)
export class ExponentialSmoothingModel {
  /**
   * Holt's Double Exponential Smoothing (Level + Trend)
   * @param {Array<number>} data 
   * @param {number} [alpha=0.3] - Level smoothing parameter (0-1)
   * @param {number} [beta=0.1] - Trend smoothing parameter (0-1)
   * @param {number} horizonTicks 
   * @returns {{forecast: Array<number>, level: number, trend: number}}
   */
  static forecastHoltDouble(data, alpha = 0.3, beta = 0.1, horizonTicks = 60) {
    if (!data || data.length === 0) {
      return { forecast: new Array(horizonTicks).fill(0), level: 0, trend: 0 };
    }

    if (data.length === 1) {
      return { forecast: new Array(horizonTicks).fill(data[0]), level: data[0], trend: 0 };
    }

    // Initial state
    let level = data[0];
    let trend = data[1] - data[0];

    for (let i = 1; i < data.length; i++) {
      const val = data[i];
      const lastLevel = level;
      level = alpha * val + (1 - alpha) * (lastLevel + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
    }

    const forecast = [];
    for (let h = 1; h <= horizonTicks; h++) {
      forecast.push(level + h * trend);
    }

    return { forecast, level, trend };
  }

  /**
   * Holt-Winters Triple Exponential Smoothing (Additive Seasonality)
   * @param {Array<number>} data 
   * @param {number} seasonLength - Period length L (e.g. 24 ticks per daily cycle)
   * @param {number} [alpha=0.2]
   * @param {number} [beta=0.1]
   * @param {number} [gamma=0.2]
   * @param {number} horizonTicks 
   * @returns {{forecast: Array<number>, seasonalIndices: Array<number>}}
   */
  static forecastHoltWintersAdditive(data, seasonLength = 24, alpha = 0.2, beta = 0.1, gamma = 0.2, horizonTicks = 60) {
    const L = seasonLength;
    const n = data.length;

    if (n < 2 * L) {
      // Fallback to Double Exponential Smoothing if insufficient seasonal cycles
      const dResult = this.forecastHoltDouble(data, alpha, beta, horizonTicks);
      return { forecast: dResult.forecast, seasonalIndices: new Array(L).fill(0) };
    }

    // Initial level L0 & trend T0
    let level = 0;
    for (let i = 0; i < L; i++) level += data[i];
    level /= L;

    let trend = 0;
    for (let i = 0; i < L; i++) {
      trend += (data[L + i] - data[i]) / L;
    }
    trend /= L;

    // Initial seasonal indices
    const seasonal = new Array(L).fill(0);
    for (let i = 0; i < L; i++) {
      seasonal[i] = data[i] - level;
    }

    // Updating equations
    const seasonHist = [...seasonal];

    for (let i = L; i < n; i++) {
      const val = data[i];
      const seasonIndex = i % L;
      const lastLevel = level;
      const lastSeason = seasonHist[seasonIndex];

      level = alpha * (val - lastSeason) + (1 - alpha) * (lastLevel + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
      seasonHist[seasonIndex] = gamma * (val - level) + (1 - gamma) * lastSeason;
    }

    // Generate forecast
    const forecast = [];
    for (let h = 1; h <= horizonTicks; h++) {
      const idx = (n - 1 + h) % L;
      forecast.push(level + h * trend + seasonHist[idx]);
    }

    return { forecast, seasonalIndices: seasonHist };
  }
}

// 5. ARIMA Model Approximation (AR(p), I(d), MA(q))
export class ARIMAApproximationModel {
  /**
   * Perform first-order differencing: diff[t] = Y[t] - Y[t-1]
   * @param {Array<number>} data 
   * @returns {Array<number>}
   */
  static difference(data) {
    const diff = [];
    for (let i = 1; i < data.length; i++) {
      diff.push(data[i] - data[i - 1]);
    }
    return diff;
  }

  /**
   * Integrate differenced forecast back to original scale.
   * @param {Array<number>} diffForecast 
   * @param {number} lastOriginalValue 
   * @returns {Array<number>}
   */
  static integrate(diffForecast, lastOriginalValue) {
    const res = [];
    let curr = lastOriginalValue;
    for (const d of diffForecast) {
      curr += d;
      res.push(curr);
    }
    return res;
  }

  /**
   * Compute AutoCorrelation Function (ACF) up to maxLag.
   * @param {Array<number>} data 
   * @param {number} maxLag 
   * @returns {Array<number>}
   */
  static computeACF(data, maxLag = 10) {
    const n = data.length;
    if (n === 0) return new Array(maxLag + 1).fill(0);

    const mean = data.reduce((a, b) => a + b, 0) / n;
    let variance = 0;
    for (let i = 0; i < n; i++) {
      variance += Math.pow(data[i] - mean, 2);
    }

    const acf = [1.0];
    for (let k = 1; k <= maxLag; k++) {
      let cov = 0;
      for (let i = 0; i < n - k; i++) {
        cov += (data[i] - mean) * (data[i + k] - mean);
      }
      acf.push(variance !== 0 ? cov / variance : 0);
    }

    return acf;
  }

  /**
   * Fit ARIMA(1,1,1) approximation model.
   * @param {Array<number>} data 
   * @param {number} horizonTicks 
   * @returns {Array<number>} Forecast array
   */
  static forecastARIMA111(data, horizonTicks = 60) {
    if (!data || data.length < 5) {
      return MovingAverageModel.forecastSMA(data, 5, horizonTicks);
    }

    // Difference data (I=1)
    const diffData = this.difference(data);
    const nDiff = diffData.length;

    // Estimate AR(1) coefficient phi via lag-1 correlation
    const acf = this.computeACF(diffData, 2);
    const phi = clamp(acf[1] || 0.5, -0.95, 0.95);

    // Compute residuals for MA(1) estimate theta
    const residuals = [diffData[0]];
    for (let i = 1; i < nDiff; i++) {
      const pred = phi * diffData[i - 1];
      residuals.push(diffData[i] - pred);
    }

    const theta = clamp(this.computeACF(residuals, 2)[1] || 0.1, -0.95, 0.95);
    const lastResidual = residuals[residuals.length - 1];

    // Forecast differenced series
    const diffForecast = [];
    let lastDiff = diffData[nDiff - 1];

    for (let h = 1; h <= horizonTicks; h++) {
      let nextDiff = phi * lastDiff;
      if (h === 1) {
        nextDiff += theta * lastResidual;
      }
      diffForecast.push(nextDiff);
      lastDiff = nextDiff;
    }

    // Integrate back to original scale
    const lastVal = data[data.length - 1];
    return this.integrate(diffForecast, lastVal);
  }
}

/**
 * AutoForecaster: Evaluates model performance via cross-validation and selects optimal model
 */
export class AutoForecaster {
  /**
   * Calculate Mean Absolute Percentage Error (MAPE)
   * @param {Array<number>} actual 
   * @param {Array<number>} predicted 
   * @returns {number}
   */
  static calculateMAPE(actual, predicted) {
    let sumErr = 0;
    let count = 0;

    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== 0) {
        sumErr += Math.abs((actual[i] - predicted[i]) / actual[i]);
        count++;
      }
    }

    return count > 0 ? (sumErr / count) * 100 : 0;
  }

  /**
   * Calculate Root Mean Squared Error (RMSE)
   * @param {Array<number>} actual 
   * @param {Array<number>} predicted 
   * @returns {number}
   */
  static calculateRMSE(actual, predicted) {
    let sumSq = 0;
    for (let i = 0; i < actual.length; i++) {
      sumSq += Math.pow(actual[i] - predicted[i], 2);
    }
    return Math.sqrt(sumSq / actual.length);
  }

  /**
   * Run cross-validation over history buffer and pick lowest RMSE algorithm.
   * @param {Array<number>} data 
   * @param {number} horizonTicks 
   * @returns {{algorithm: string, forecast: Array<number>, rmse: number, mape: number}}
   */
  static selectBestForecast(data, horizonTicks = 60) {
    if (!data || data.length < 10) {
      const fc = MovingAverageModel.forecastSMA(data, 5, horizonTicks);
      return { algorithm: 'SMA', forecast: fc, rmse: 0, mape: 0 };
    }

    // Train/Test Split (80% train, 20% test)
    const splitIndex = Math.floor(data.length * 0.8);
    const trainData = data.slice(0, splitIndex);
    const testData = data.slice(splitIndex);
    const testLen = testData.length;

    // Evaluate candidates
    const candidates = [
      { name: 'Linear', fc: LinearRegressionModel.forecast(trainData, testLen) },
      { name: 'Polynomial_2', fc: PolynomialRegressionModel.forecast(trainData, 2, testLen) },
      { name: 'Holt_Double', fc: ExponentialSmoothingModel.forecastHoltDouble(trainData, 0.3, 0.1, testLen).forecast },
      { name: 'Holt_Winters', fc: ExponentialSmoothingModel.forecastHoltWintersAdditive(trainData, 24, 0.2, 0.1, 0.2, testLen).forecast },
      { name: 'ARIMA_111', fc: ARIMAApproximationModel.forecastARIMA111(trainData, testLen) },
      { name: 'EMA', fc: MovingAverageModel.forecastEMA(trainData, 0.2, testLen) }
    ];

    let bestModel = candidates[0];
    let minRMSE = Infinity;

    for (const c of candidates) {
      const rmse = this.calculateRMSE(testData, c.fc);
      if (rmse < minRMSE) {
        minRMSE = rmse;
        bestModel = c;
      }
    }

    // Generate full forecast using best algorithm on entire dataset
    let fullForecast = [];
    switch (bestModel.name) {
      case 'Linear':
        fullForecast = LinearRegressionModel.forecast(data, horizonTicks);
        break;
      case 'Polynomial_2':
        fullForecast = PolynomialRegressionModel.forecast(data, 2, horizonTicks);
        break;
      case 'Holt_Double':
        fullForecast = ExponentialSmoothingModel.forecastHoltDouble(data, 0.3, 0.1, horizonTicks).forecast;
        break;
      case 'Holt_Winters':
        fullForecast = ExponentialSmoothingModel.forecastHoltWintersAdditive(data, 24, 0.2, 0.1, 0.2, horizonTicks).forecast;
        break;
      case 'ARIMA_111':
        fullForecast = ARIMAApproximationModel.forecastARIMA111(data, horizonTicks);
        break;
      default:
        fullForecast = MovingAverageModel.forecastEMA(data, 0.2, horizonTicks);
        break;
    }

    const fullMape = this.calculateMAPE(data.slice(-testLen), fullForecast.slice(0, testLen));

    return {
      algorithm: bestModel.name,
      forecast: fullForecast,
      rmse: minRMSE,
      mape: fullMape
    };
  }
}

/**
 * Domain-Specific Predictive Engine
 */
export class PredictiveEngine extends EventEmitter {
  /**
   * @param {Object} [simulationEngine] - Reference to root SimulationEngine
   * @param {Object} [options] 
   */
  constructor(simulationEngine = null, options = {}) {
    super();
    this.sim = simulationEngine;
    this.historyCapacity = options.capacity || 400;

    // Time-Series Data Buffers per Domain Metric
    this.buffers = {
      population: new TimeSeriesBuffer(this.historyCapacity),
      treasury: new TimeSeriesBuffer(this.historyCapacity),
      energyDemand: new TimeSeriesBuffer(this.historyCapacity),
      trafficCongestion: new TimeSeriesBuffer(this.historyCapacity),
      hospitalBedLoad: new TimeSeriesBuffer(this.historyCapacity),
      pollutionAQI: new TimeSeriesBuffer(this.historyCapacity),
      housingPriceIndex: new TimeSeriesBuffer(this.historyCapacity),
      unemploymentRate: new TimeSeriesBuffer(this.historyCapacity)
    };

    // Cache of latest forecasts
    this.latestForecasts = {};
    this.activeAlerts = [];
  }

  /**
   * Connect simulation container.
   * @param {Object} simulationEngine 
   */
  connectSimulation(simulationEngine) {
    this.sim = simulationEngine;
  }

  /**
   * Record a snapshot tick of city metrics.
   * @param {Object} [metrics] - Optional explicit metrics override
   */
  recordTick(metrics = null) {
    const snap = metrics || this._sampleCurrentMetrics();

    if (snap.population !== undefined) this.buffers.population.push(snap.population);
    if (snap.treasury !== undefined) this.buffers.treasury.push(snap.treasury);
    if (snap.energyDemand !== undefined) this.buffers.energyDemand.push(snap.energyDemand);
    if (snap.trafficCongestion !== undefined) this.buffers.trafficCongestion.push(snap.trafficCongestion);
    if (snap.hospitalBedLoad !== undefined) this.buffers.hospitalBedLoad.push(snap.hospitalBedLoad);
    if (snap.pollutionAQI !== undefined) this.buffers.pollutionAQI.push(snap.pollutionAQI);
    if (snap.housingPriceIndex !== undefined) this.buffers.housingPriceIndex.push(snap.housingPriceIndex);
    if (snap.unemploymentRate !== undefined) this.buffers.unemploymentRate.push(snap.unemploymentRate);
  }

  /**
   * Sample metrics from simulation engine instance.
   * @private
   * @returns {Object}
   */
  _sampleCurrentMetrics() {
    if (!this.sim) return {};

    return {
      population: this.sim.citizens ? this.sim.citizens.populationCount : 0,
      treasury: this.sim.economy ? this.sim.economy.treasury : 0,
      energyDemand: this.sim.infrastructure && this.sim.infrastructure.powerGrid ? this.sim.infrastructure.powerGrid.totalLoadMW : 0,
      trafficCongestion: this.sim.transportation ? this.sim.transportation.congestionLevel * 100 : 0,
      hospitalBedLoad: this.sim.services && this.sim.services.healthcare ? this.sim.services.healthcare.occupiedBedCount : 0,
      pollutionAQI: this.sim.environment ? this.sim.environment.airQualityIndex : 0,
      housingPriceIndex: this.sim.economy ? this.sim.economy.housingPriceIndex : 100,
      unemploymentRate: this.sim.economy ? this.sim.economy.unemploymentRate * 100 : 5
    };
  }

  /**
   * Generate 60-tick predictive forecast for target metric.
   * @param {string} metricName - 'population', 'treasury', 'energyDemand', 'trafficCongestion', etc.
   * @param {number} [horizonTicks=60] 
   * @param {string} [algorithm='auto'] 
   * @returns {Object} Forecast result container with predictions and confidence bounds
   */
  generateForecast(metricName, horizonTicks = 60, algorithm = 'auto') {
    const buffer = this.buffers[metricName];
    if (!buffer || buffer.size < 3) {
      return {
        metric: metricName,
        algorithm: 'none',
        forecast: new Array(horizonTicks).fill(0),
        upperBound95: new Array(horizonTicks).fill(0),
        lowerBound95: new Array(horizonTicks).fill(0),
        rmse: 0
      };
    }

    const data = buffer.getValues();
    let forecastArr = [];
    let algoUsed = algorithm;
    let rmse = 0;

    if (algorithm === 'auto') {
      const best = AutoForecaster.selectBestForecast(data, horizonTicks);
      forecastArr = best.forecast;
      algoUsed = best.algorithm;
      rmse = best.rmse;
    } else {
      switch (algorithm) {
        case 'linear':
          forecastArr = LinearRegressionModel.forecast(data, horizonTicks);
          break;
        case 'polynomial':
          forecastArr = PolynomialRegressionModel.forecast(data, 2, horizonTicks);
          break;
        case 'holt_double':
          forecastArr = ExponentialSmoothingModel.forecastHoltDouble(data, 0.3, 0.1, horizonTicks).forecast;
          break;
        case 'holt_winters':
          forecastArr = ExponentialSmoothingModel.forecastHoltWintersAdditive(data, 24, 0.2, 0.1, 0.2, horizonTicks).forecast;
          break;
        case 'arima':
          forecastArr = ARIMAApproximationModel.forecastARIMA111(data, horizonTicks);
          break;
        default:
          forecastArr = MovingAverageModel.forecastEMA(data, 0.2, horizonTicks);
          break;
      }
      rmse = AutoForecaster.calculateRMSE(data.slice(-Math.min(10, data.length)), forecastArr.slice(0, Math.min(10, horizonTicks)));
    }

    // 95% Confidence Interval Bounds (z = 1.96)
    const stdDev = buffer.getVarianceAndStdDev().stdDev || 1;
    const upperBound95 = [];
    const lowerBound95 = [];

    for (let h = 1; h <= horizonTicks; h++) {
      const errorMargin = 1.96 * stdDev * Math.sqrt(1 + h / 30);
      upperBound95.push(forecastArr[h - 1] + errorMargin);
      lowerBound95.push(forecastArr[h - 1] - errorMargin);
    }

    const result = {
      metric: metricName,
      algorithm: algoUsed,
      horizonTicks,
      forecast: forecastArr,
      upperBound95,
      lowerBound95,
      rmse,
      generatedAt: Date.now()
    };

    this.latestForecasts[metricName] = result;
    return result;
  }

  /**
   * Run forecast generation for all tracked city metrics.
   * @param {number} [horizonTicks=60] 
   * @returns {Object} Map of metric forecasts
   */
  generateAllForecasts(horizonTicks = 60) {
    const results = {};
    for (const metric of Object.keys(this.buffers)) {
      results[metric] = this.generateForecast(metric, horizonTicks, 'auto');
    }
    this._evaluateForecastAlerts(results);
    return results;
  }

  /**
   * Evaluate predictive alerts based on forecast threshold breaches.
   * @private
   * @param {Object} forecasts 
   */
  _evaluateForecastAlerts(forecasts) {
    const alerts = [];

    // 1. Treasury Bankruptcy Alert
    if (forecasts.treasury) {
      const minTreasury = Math.min(...forecasts.treasury.forecast);
      if (minTreasury < 0) {
        const breachTick = forecasts.treasury.forecast.findIndex(v => v < 0) + 1;
        alerts.push({
          id: 'alert_bankruptcy_risk',
          severity: breachTick <= 15 ? 'critical' : 'warning',
          metric: 'treasury',
          message: `Bankruptcy Risk: Treasury expected to go negative in ~${breachTick} ticks.`,
          breachTick
        });
      }
    }

    // 2. Energy Grid Overload Alert
    if (forecasts.energyDemand && this.sim && this.sim.infrastructure && this.sim.infrastructure.powerGrid) {
      const maxCapMW = this.sim.infrastructure.powerGrid.maxCapacityMW || 1000;
      const maxDemand = Math.max(...forecasts.energyDemand.forecast);
      if (maxDemand > maxCapMW) {
        const breachTick = forecasts.energyDemand.forecast.findIndex(v => v > maxCapMW) + 1;
        alerts.push({
          id: 'alert_energy_blackout_risk',
          severity: 'critical',
          metric: 'energyDemand',
          message: `Grid Overload Risk: Power demand will exceed max capacity (${maxCapMW} MW) in ~${breachTick} ticks.`,
          breachTick
        });
      }
    }

    // 3. Hospital Bed Exhaustion Alert
    if (forecasts.hospitalBedLoad && this.sim && this.sim.services && this.sim.services.healthcare) {
      const maxBeds = this.sim.services.healthcare.totalBedCapacity || 500;
      const maxLoad = Math.max(...forecasts.hospitalBedLoad.forecast);
      if (maxLoad > maxBeds) {
        const breachTick = forecasts.hospitalBedLoad.forecast.findIndex(v => v > maxBeds) + 1;
        alerts.push({
          id: 'alert_hospital_overflow',
          severity: 'warning',
          metric: 'hospitalBedLoad',
          message: `Healthcare Strain: Hospital beds projected to overflow in ~${breachTick} ticks.`,
          breachTick
        });
      }
    }

    this.activeAlerts = alerts;
    if (alerts.length > 0) {
      this.emit('forecast_alerts_updated', alerts);
    }
  }

  /**
   * Run "What-If" Scenario Simulation Projection
   * Models metric trajectory shift when policy parameter is altered.
   * 
   * @param {Object} policyModifiers - e.g. { taxRateDelta: +0.02, renewableSubsidy: true, policeFundingDelta: +50000 }
   * @param {number} [horizonTicks=60] 
   * @returns {Object} Baseline vs Modified projection curves
   */
  runWhatIfScenario(policyModifiers = {}, horizonTicks = 60) {
    const baselineTreasury = this.generateForecast('treasury', horizonTicks, 'auto');
    const baselinePopulation = this.generateForecast('population', horizonTicks, 'auto');

    const modTreasuryForecast = [...baselineTreasury.forecast];
    const modPopForecast = [...baselinePopulation.forecast];

    // Apply tax change delta
    if (policyModifiers.taxRateDelta !== undefined) {
      const delta = policyModifiers.taxRateDelta;
      for (let h = 0; h < horizonTicks; h++) {
        // Higher taxes increase revenue but lower population growth rate
        modTreasuryForecast[h] += (h + 1) * delta * 5000;
        modPopForecast[h] -= (h + 1) * delta * 20;
      }
    }

    // Apply transit investment modifier
    if (policyModifiers.transitInvestment) {
      const inv = policyModifiers.transitInvestment;
      for (let h = 0; h < horizonTicks; h++) {
        modTreasuryForecast[h] -= inv / horizonTicks;
        modPopForecast[h] += (h + 1) * 15;
      }
    }

    return {
      horizonTicks,
      modifiers: policyModifiers,
      baseline: {
        treasury: baselineTreasury.forecast,
        population: baselinePopulation.forecast
      },
      modified: {
        treasury: modTreasuryForecast,
        population: modPopForecast
      }
    };
  }

  /**
   * Export predictive engine state for save file.
   * @returns {Object}
   */
  exportState() {
    const buffersState = {};
    for (const [key, buf] of Object.entries(this.buffers)) {
      buffersState[key] = buf.getValues();
    }
    return {
      buffers: buffersState,
      activeAlerts: this.activeAlerts
    };
  }

  /**
   * Restore predictive engine state.
   * @param {Object} stateData 
   */
  importState(stateData) {
    if (!stateData || !stateData.buffers) return;

    for (const [key, vals] of Object.entries(stateData.buffers)) {
      if (this.buffers[key] && Array.isArray(vals)) {
        this.buffers[key].clear();
        for (const v of vals) {
          this.buffers[key].push(v);
        }
      }
    }
    this.activeAlerts = stateData.activeAlerts || [];
  }
}
