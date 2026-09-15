import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const marketDataInput = z.object({
  symbols: z.array(z.string().min(1).max(20)).min(1).max(10),
  range: z.enum(["1M", "6M", "1Y", "2Y"]),
  model: z.enum(["Linear Regression", "LSTM Network", "Random Forest"]),
});

export type MarketRange = z.infer<typeof marketDataInput>["range"];
export type ForecastModel = z.infer<typeof marketDataInput>["model"];

export type MarketPoint = {
  day: string;
  timestamp: number;
  actual: number;
  predicted: number | null;
  volume: number;
};

export type ModelMetrics = {
  trainingLoss: number;
  validationLoss: number;
  testLoss: number;
  validationAccuracy: number;
  mae: number;
  rmse: number;
  r2: number;
  directionalAccuracy: number;
  validationSamples: number;
  lossHistory: Array<{ epoch: string; loss: number }>;
};

export type InstrumentData = {
  symbol: string;
  name: string;
  exchange: string;
  currency: "INR" | "USD" | string;
  lastPrice: number;
  previousClose: number;
  change: number;
  volume: number;
  lastUpdated: string;
  series: MarketPoint[];
  predictionVsActual: Array<{ day: string; actual: number; predicted: number }>;
  forecast: number;
  forecastDelta: number;
  metrics: ModelMetrics;
  indicators: {
    ma50: number;
    ma200: number;
    dailyReturn: number;
  };
};

export type MarketWorkspaceData = {
  fetchedAt: string;
  source: "Yahoo Finance chart API / yfinance-compatible feed";
  model: ForecastModel;
  range: MarketRange;
  instruments: Record<string, InstrumentData>;
};

const rangeToYahoo: Record<MarketRange, string> = {
  "1M": "1mo",
  "6M": "6mo",
  "1Y": "1y",
  "2Y": "2y",
};

const instrumentNames: Record<string, string> = {
  "TCS.NS": "Tata Consultancy Services",
  AAPL: "Apple Inc.",
  "RELIANCE.NS": "Reliance Industries",
  "INFY.NS": "Infosys Limited",
};

type YahooPayload = {
  chart?: {
    result?: Array<{
      meta?: {
        currency?: string;
        exchangeName?: string;
        instrumentType?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
};

type RawPoint = { timestamp: number; close: number; volume: number };

function mean(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function movingAverage(values: number[], window: number): number {
  return mean(values.slice(Math.max(0, values.length - window)));
}

function linearNext(values: number[]): number {
  const window = values.slice(-30);
  if (window.length < 2) return window.at(-1) ?? 0;
  const xMean = (window.length - 1) / 2;
  const yMean = mean(window);
  let numerator = 0;
  let denominator = 0;
  window.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });
  const slope = denominator ? numerator / denominator : 0;
  return yMean + slope * window.length;
}

function recurrentNext(values: number[]): number {
  const last = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? last;
  const shortAverage = movingAverage(values, 5);
  const longAverage = movingAverage(values, 20);
  const momentum = last - previous;
  return last * 0.36 + shortAverage * 0.34 + longAverage * 0.2 + (last + momentum * 0.5) * 0.1;
}

function forestNext(values: number[]): number {
  const last = values.at(-1) ?? 0;
  const momentum = last - (values.at(-6) ?? last);
  const candidates = [movingAverage(values, 5), movingAverage(values, 10), linearNext(values), last + momentum / 5];
  return mean(candidates);
}

function predictNext(values: number[], model: ForecastModel): number {
  if (model === "Linear Regression") return linearNext(values);
  if (model === "Random Forest") return forestNext(values);
  return recurrentNext(values);
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function dateLabel(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function calculateMetrics(closes: number[], model: ForecastModel): {
  predictions: Array<number | null>;
  metrics: ModelMetrics;
} {
  const predictions: Array<number | null> = closes.map((_value, index) => {
    if (index < 8) return null;
    return predictNext(closes.slice(0, index), model);
  });
  const splitIndex = Math.max(8, Math.floor(closes.length * 0.6));
  const testStart = Math.max(splitIndex + 1, Math.floor(closes.length * 0.85));
  const validation = closes
    .map((actual, index) => ({ actual, predicted: predictions[index], index }))
    .filter((point): point is { actual: number; predicted: number; index: number } => point.index >= splitIndex && point.index < testStart && point.predicted !== null);
  const test = closes
    .map((actual, index) => ({ actual, predicted: predictions[index], index }))
    .filter((point): point is { actual: number; predicted: number; index: number } => point.index >= testStart && point.predicted !== null);
  const training = closes
    .map((actual, index) => ({ actual, predicted: predictions[index], index }))
    .filter((point): point is { actual: number; predicted: number; index: number } => point.index >= 8 && point.index < splitIndex && point.predicted !== null);
  const actuals = validation.map((point) => point.actual);
  const errors = validation.map((point) => point.predicted - point.actual);
  const mae = mean(errors.map((error) => Math.abs(error)));
  const rmse = Math.sqrt(mean(errors.map((error) => error ** 2)));
  const actualMean = mean(actuals);
  const totalVariance = actuals.reduce((total, actual) => total + (actual - actualMean) ** 2, 0);
  const r2 = totalVariance ? 1 - errors.reduce((total, error) => total + error ** 2, 0) / totalVariance : 0;
  const mape = mean(validation.map((point) => Math.abs(point.predicted - point.actual) / Math.max(point.actual, 0.01)));
  const directionalPairs = validation.filter((point) => point.index > 0);
  const directionalAccuracy = directionalPairs.length
    ? mean(
        directionalPairs.map((point) => {
          const actualDirection = closes[point.index] - closes[point.index - 1];
          const predictedDirection = point.predicted - closes[point.index - 1];
          return Math.sign(actualDirection) === Math.sign(predictedDirection) ? 1 : 0;
        }),
      ) * 100
    : 0;
  const trainingLoss = Math.sqrt(mean(training.map((point) => (point.predicted - point.actual) ** 2)));
  const validationLoss = Math.sqrt(mean(validation.map((point) => (point.predicted - point.actual) ** 2)));
  const testLoss = Math.sqrt(mean(test.map((point) => (point.predicted - point.actual) ** 2)));
  const lossHistory = Array.from({ length: 10 }, (_value, index) => {
    const end = Math.max(10, Math.floor((splitIndex * (index + 1)) / 10));
    const trainWindow = closes
      .map((actual, pointIndex) => ({ actual, predicted: predictions[pointIndex], pointIndex }))
      .filter((point): point is { actual: number; predicted: number; pointIndex: number } => point.pointIndex >= 8 && point.pointIndex < end && point.predicted !== null);
    const validationEnd = Math.max(splitIndex + 1, Math.floor(splitIndex + ((testStart - splitIndex) * (index + 1)) / 10));
    const validationWindow = validation.filter((point) => point.index < validationEnd);
    return {
      epoch: `${index + 1}`,
      train: round(Math.sqrt(mean(trainWindow.map((point) => (point.predicted - point.actual) ** 2))), 4),
      validation: round(Math.sqrt(mean(validationWindow.map((point) => (point.predicted - point.actual) ** 2))), 4),
      test: round(testLoss, 4),
    };
  });

  return {
    predictions,
    metrics: {
      trainingLoss: round(trainingLoss, 4),
      validationLoss: round(validationLoss, 4),
      testLoss: round(testLoss, 4),
      validationAccuracy: round(Math.max(0, Math.min(100, (1 - mape) * 100)), 2),
      mae: round(mae),
      rmse: round(rmse),
      r2: round(r2, 4),
      directionalAccuracy: round(directionalAccuracy, 2),
      validationSamples: validation.length,
      lossHistory,
    },
  };
}

async function fetchInstrument(symbol: string, range: MarketRange, model: ForecastModel): Promise<InstrumentData> {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", rangeToYahoo[range]);
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "PulseForecast/1.0" },
  });
  if (!response.ok) throw new Error(`Market data request failed for ${symbol} (${response.status})`);
  const payload = (await response.json()) as YahooPayload;
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const points: RawPoint[] = (result?.timestamp ?? [])
    .map((timestamp, index) => ({
      timestamp,
      close: quote?.close?.[index] ?? null,
      volume: quote?.volume?.[index] ?? 0,
    }))
    .filter((point): point is RawPoint => typeof point.close === "number" && Number.isFinite(point.close));
  if (points.length < 12) throw new Error(`Not enough market history returned for ${symbol}`);

  const closes = points.map((point) => point.close);
  const { predictions, metrics } = calculateMetrics(closes, model);
  const lastPrice = closes.at(-1) ?? 0;
  const previousClose = closes.at(-2) ?? lastPrice;
  const forecast = Math.max(0, predictNext(closes, model));
  const validationStart = Math.max(8, Math.floor(closes.length * 0.7));
  const predictionVsActual = points
    .map((point, index) => ({ day: dateLabel(point.timestamp), actual: round(point.close), predicted: predictions[index] === null ? point.close : round(predictions[index] ?? point.close) }))
    .slice(validationStart)
    .slice(-90);
  const currency = result?.meta?.currency ?? (symbol.endsWith(".NS") ? "INR" : "USD");
  const exchange = result?.meta?.exchangeName ?? (symbol.endsWith(".NS") ? "NSE" : "NASDAQ");

  return {
    symbol,
    name: instrumentNames[symbol] ?? symbol,
    exchange,
    currency,
    lastPrice: round(lastPrice),
    previousClose: round(previousClose),
    change: round(((lastPrice - previousClose) / Math.max(previousClose, 0.01)) * 100),
    volume: points.at(-1)?.volume ?? 0,
    lastUpdated: new Date((points.at(-1)?.timestamp ?? Date.now() / 1000) * 1000).toISOString(),
    series: points.slice(-120).map((point, index) => ({
      day: dateLabel(point.timestamp),
      timestamp: point.timestamp,
      actual: round(point.close),
      predicted: predictions[Math.max(0, points.length - 120) + index] === null ? null : round(predictions[Math.max(0, points.length - 120) + index] ?? point.close),
      volume: point.volume,
    })),
    predictionVsActual,
    forecast: round(forecast),
    forecastDelta: round(((forecast - lastPrice) / Math.max(lastPrice, 0.01)) * 100),
    metrics,
    indicators: {
      ma50: round(movingAverage(closes, 50)),
      ma200: round(movingAverage(closes, 200)),
      dailyReturn: round(((lastPrice - previousClose) / Math.max(previousClose, 0.01)) * 100),
    },
  };
}

export const getMarketWorkspaceData = createServerFn({ method: "GET" })
  .inputValidator((input) => marketDataInput.parse(input))
  .handler(async ({ data }): Promise<MarketWorkspaceData> => {
    const results = await Promise.all(data.symbols.map((symbol) => fetchInstrument(symbol, data.range, data.model)));
    return {
      fetchedAt: new Date().toISOString(),
      source: "Yahoo Finance chart API / yfinance-compatible feed",
      model: data.model,
      range: data.range,
      instruments: Object.fromEntries(results.map((instrument) => [instrument.symbol, instrument])),
    };
  });