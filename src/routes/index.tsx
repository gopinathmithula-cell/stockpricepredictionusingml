import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  Database,
  Download,
  LineChart,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMarketWorkspaceData,
  type ForecastModel,
  type InstrumentData,
  type MarketRange,
} from "@/lib/market-data.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseForecast · ML Stock Prediction" },
      {
        name: "description",
        content:
          "Explore machine-learning stock forecasts with live market data, engineered indicators, and model performance in one clear workspace.",
      },
      { property: "og:title", content: "PulseForecast · ML Stock Prediction" },
      {
        property: "og:description",
        content: "A focused workspace for exploring historical stock patterns and next-day ML forecasts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SYMBOLS = ["TCS.NS", "AAPL", "RELIANCE.NS", "INFY.NS"] as const;
type Stock = (typeof SYMBOLS)[number];
type WorkspaceView = "Overview" | "Market data" | "Model lab" | "Performance";

const MODELS: ForecastModel[] = ["Linear Regression", "LSTM Network", "Random Forest"];
const rangeLabels: Record<MarketRange, string> = { "1M": "1 month", "6M": "6 months", "1Y": "1 year", "2Y": "2 years" };

function currencySymbol(currency: string) {
  return currency === "INR" ? "₹" : "$";
}

function formatPrice(value: number, currency: string) {
  return `${currencySymbol(currency)}${value.toLocaleString(currency === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 })}`;
}

function formatVolume(volume: number) {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return `${volume}`;
}

function formatDateTime(iso: string) {
  return `${new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })} UTC`;
}

function trendFor(change: number) {
  if (change >= 1.5) return "Strong";
  if (change > 0) return "Positive";
  if (change > -1) return "Neutral";
  return "Weak";
}

function Index() {
  const [selectedStock, setSelectedStock] = useState<Stock>("TCS.NS");
  const [range, setRange] = useState<MarketRange>("1Y");
  const [model, setModel] = useState<ForecastModel>("LSTM Network");
  const [activeView, setActiveView] = useState<WorkspaceView>("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);

  const workspace = useQuery({
    queryKey: ["market-workspace", range, model],
    queryFn: () => getMarketWorkspaceData({ data: { symbols: [...SYMBOLS], range, model } }),
    staleTime: 60_000,
  });

  const data = workspace.data;
  const instruments = data?.instruments;
  const selected = instruments?.[selectedStock];
  const viewMeta: Record<WorkspaceView, { eyebrow: string; title: string }> = {
    Overview: { eyebrow: data ? `Live data · synced ${formatDateTime(data.fetchedAt)}` : "Syncing live market data", title: "Prediction overview" },
    "Market data": { eyebrow: "Workspace / Market data", title: "Market data" },
    "Model lab": { eyebrow: "Workspace / Model lab", title: "Model lab" },
    Performance: { eyebrow: "Workspace / Performance", title: "Performance" },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-border px-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"><Activity className="size-5" /></div>
            <div><p className="font-display text-base font-bold tracking-tight">PulseForecast</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">ML research desk</p></div>
          </div>
          <div className="flex-1 px-4 py-7">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
             <nav className="mt-3 space-y-1"><NavItem icon={LineChart} label="Overview" active={activeView === "Overview"} onClick={() => setActiveView("Overview")} /><NavItem icon={BarChart3} label="Market data" active={activeView === "Market data"} onClick={() => setActiveView("Market data")} /><NavItem icon={Cpu} label="Model lab" active={activeView === "Model lab"} onClick={() => setActiveView("Model lab")} /><NavItem icon={Target} label="Performance" active={activeView === "Performance"} onClick={() => setActiveView("Performance")} /></nav>
            <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">System</p>
            <nav className="mt-3 space-y-1"><NavItem icon={Database} label="Data sources" /><NavItem icon={Settings2} label="Settings" /></nav>
          </div>
          <div className="border-t border-border p-4"><div className="rounded-xl bg-secondary p-4"><div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="size-4 text-chart-2" /> Data health</div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{workspace.isFetching ? "Fetching the latest market close from Yahoo Finance…" : "Latest market data is synced and ready for analysis."}</p><div className={cn("mt-3 flex items-center gap-2 text-[11px] font-semibold", workspace.isError ? "text-chart-5" : "text-chart-2")}><span className={cn("size-1.5 rounded-full", workspace.isError ? "bg-chart-5" : "bg-chart-2")} /> {workspace.isError ? "Sync failed — retry" : "Connected to yfinance feed"}</div></div></div>
        </aside>

        <section className="min-w-0 flex-1">
             <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur md:px-8">
             <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu /></Button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{viewMeta[activeView].eyebrow}</p><h1 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">{viewMeta[activeView].title}</h1></div></div>
            <div className="flex items-center gap-2 md:gap-3"><Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex" onClick={() => workspace.refetch()}><RefreshCw className={cn("size-3.5", workspace.isFetching && "animate-spin")} /> Refresh prices</Button><Button variant="ghost" size="icon" aria-label="Search"><Search /></Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><div className="ml-1 hidden size-9 items-center justify-center rounded-full bg-chart-4 text-sm font-bold text-chart-4-foreground sm:flex">MG</div></div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="flex items-center gap-2"><Badge variant="secondary" className="gap-1.5"><span className={cn("size-1.5 rounded-full", workspace.isError ? "bg-chart-5" : "bg-chart-2")} /> {workspace.isError ? "Feed error" : "Live market data"}</Badge><span className="text-xs text-muted-foreground">Yahoo Finance · yfinance-compatible feed</span></div><h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">See the signal before<br className="hidden md:block" /> the market opens.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">A machine-learning view of real price patterns, momentum, and the next trading day — designed to make research easier to read.</p></div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm"><StockSelect value={selectedStock} onChange={(value) => setSelectedStock(value as Stock)} /><div className="hidden h-7 w-px bg-border sm:block" /><div className="flex items-center gap-1">{(["1M", "6M", "1Y", "2Y"] as MarketRange[]).map((item) => <Button key={item} variant={range === item ? "secondary" : "ghost"} size="sm" onClick={() => setRange(item)}>{item}</Button>)}</div><div className="hidden h-7 w-px bg-border sm:block" /><label className="hidden items-center gap-2 px-2 text-xs font-semibold md:flex"><Cpu className="size-3.5 text-muted-foreground" /><select aria-label="Select model" value={model} onChange={(event) => setModel(event.target.value as ForecastModel)} className="appearance-none bg-transparent pr-2 outline-none">{MODELS.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            </div>

            {activeView === "Overview" && (selected ? <OverviewView instrument={selected} model={model} range={range} stock={selectedStock} fetchedAt={data!.fetchedAt} onRunPrediction={() => workspace.refetch()} isFetching={workspace.isFetching} /> : <StatusPanel pending={workspace.isPending} error={workspace.error} onRetry={() => workspace.refetch()} />)}
            {activeView === "Market data" && (instruments ? <MarketDataView instruments={instruments} selectedStock={selectedStock} onSelectStock={(stock) => setSelectedStock(stock)} onRefresh={() => workspace.refetch()} isFetching={workspace.isFetching} fetchedAt={data!.fetchedAt} /> : <StatusPanel pending={workspace.isPending} error={workspace.error} onRetry={() => workspace.refetch()} />)}
            {activeView === "Model lab" && <ModelLabView model={model} setModel={setModel} range={range} selectedStock={selectedStock} onRefresh={() => workspace.refetch()} isFetching={workspace.isFetching} />}
            {activeView === "Performance" && (selected ? <PerformanceView instrument={selected} model={model} fetchedAt={data!.fetchedAt} /> : <StatusPanel pending={workspace.isPending} error={workspace.error} onRetry={() => workspace.refetch()} />)}
          </div>
        </section>
      </div>
       {mobileMenu && <div className="fixed inset-0 z-50 bg-foreground/20 lg:hidden" onClick={() => setMobileMenu(false)}><aside className="h-full w-[280px] bg-sidebar p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="size-5" /></div><span className="font-display font-bold">PulseForecast</span></div><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X /></Button></div><nav className="mt-10 space-y-2"><NavItem icon={LineChart} label="Overview" active={activeView === "Overview"} onClick={() => { setActiveView("Overview"); setMobileMenu(false); }} /><NavItem icon={BarChart3} label="Market data" active={activeView === "Market data"} onClick={() => { setActiveView("Market data"); setMobileMenu(false); }} /><NavItem icon={Cpu} label="Model lab" active={activeView === "Model lab"} onClick={() => { setActiveView("Model lab"); setMobileMenu(false); }} /><NavItem icon={Target} label="Performance" active={activeView === "Performance"} onClick={() => { setActiveView("Performance"); setMobileMenu(false); }} /></nav></aside></div>}
    </main>
  );
}

function StatusPanel({ pending, error, onRetry }: { pending: boolean; error: Error | null; onRetry: () => void }) {
  if (pending) {
    return <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm"><RefreshCw className="mx-auto size-6 animate-spin text-muted-foreground" /><p className="mt-4 text-sm font-semibold">Fetching live market data…</p><p className="mt-1 text-xs text-muted-foreground">Daily closes, indicators, and model metrics are on the way.</p></div>;
  }
  return <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm"><p className="text-sm font-semibold text-chart-5">Market data sync failed</p><p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">{error?.message ?? "The Yahoo Finance feed did not respond. Check the connection and try again."}</p><Button variant="outline" size="sm" className="mt-5" onClick={onRetry}><RefreshCw className="size-3.5" /> Retry sync</Button></div>;
}

function OverviewView({ instrument, model, range, stock, fetchedAt, onRunPrediction, isFetching }: { instrument: InstrumentData; model: ForecastModel; range: MarketRange; stock: string; fetchedAt: string; onRunPrediction: () => void; isFetching: boolean }) {
  const currency = currencySymbol(instrument.currency);
  const isPositive = instrument.change >= 0;
  const forecastDelta = instrument.forecastDelta;
  const confidence = instrument.metrics.validationAccuracy;
  const ma50Delta = ((instrument.lastPrice - instrument.indicators.ma50) / Math.max(instrument.indicators.ma50, 0.01)) * 100;
  const ma200Delta = ((instrument.lastPrice - instrument.indicators.ma200) / Math.max(instrument.indicators.ma200, 0.01)) * 100;
  const chartData = instrument.series.map((point) => ({ day: point.day, actual: point.actual, predicted: point.predicted }));

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Current price" value={formatPrice(instrument.lastPrice, instrument.currency)} detail={`Last market close · ${instrument.exchange}`} icon={TrendingUp} /><MetricCard label="Daily change" value={`${isPositive ? "+" : ""}${instrument.change.toFixed(2)}%`} detail="Compared to previous close" icon={isPositive ? ArrowUpRight : ArrowDownRight} positive={isPositive} /><MetricCard label="Model confidence" value={`${confidence.toFixed(1)}%`} detail={`${model} · ${rangeLabels[range]}`} icon={Sparkles} positive /><MetricCard label="Next-day forecast" value={formatPrice(instrument.forecast, instrument.currency)} detail={`${forecastDelta >= 0 ? "+" : ""}${forecastDelta.toFixed(2)}% expected move`} positive={forecastDelta >= 0} icon={Target} /></div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold">Price prediction</h3><Badge variant="outline" className="font-normal">{stock}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Actual vs predicted close · {rangeLabels[range]}</p></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-1" /> Actual</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-3" /> Predicted</span><Button variant="ghost" size="icon" aria-label="Download chart"><Download /></Button></div></div><div className="mt-7 h-[290px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} interval="preserveStartEnd" minTickGap={40} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${currency}${(value / 1000).toFixed(1)}k`} domain={["auto", "auto"]} /><Tooltip content={<ChartTooltip currency={currency} />} /><Area type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#actualFill)" activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }} connectNulls /><Area type="monotone" dataKey="predicted" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" fill="none" activeDot={{ r: 4, fill: "var(--chart-3)", stroke: "var(--card)", strokeWidth: 2 }} connectNulls /></AreaChart></ResponsiveContainer></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Training window: last {rangeLabels[range]} of daily closes · synced {formatDateTime(fetchedAt)}</p><p className={cn("text-xs font-semibold", instrument.metrics.r2 >= 0.9 ? "text-chart-2" : "text-chart-5")}>Model fit R²: {instrument.metrics.r2.toFixed(3)} <span className={cn("ml-1 inline-block size-1.5 rounded-full", instrument.metrics.r2 >= 0.9 ? "bg-chart-2" : "bg-chart-5")} /></p></div></section>
        <section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-6"><div className="flex items-center justify-between"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Next trading day</Badge><MoreHorizontal className="size-5 opacity-60" /></div><p className="mt-8 text-sm text-primary-foreground/70">Predicted closing price</p><div className="mt-2 flex items-end gap-2"><span className="font-display text-4xl font-bold tracking-tight">{formatPrice(instrument.forecast, instrument.currency)}</span><span className={cn("mb-1 flex items-center text-sm font-semibold", forecastDelta >= 0 ? "text-chart-2" : "text-chart-5")}><ArrowUpRight className="size-4" /> {Math.abs(forecastDelta).toFixed(2)}%</span></div><div className="mt-7 border-t border-primary-foreground/15 pt-5"><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Confidence score</span><span className="font-semibold">{confidence.toFixed(1)}%</span></div><div className="mt-3 h-2 rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-chart-2" style={{ width: `${Math.min(100, confidence)}%` }} /></div><p className="mt-3 text-xs leading-relaxed text-primary-foreground/65">Directional accuracy on the validation window: {instrument.metrics.directionalAccuracy.toFixed(1)}%.</p></div><Button variant="secondary" className="mt-7 w-full" onClick={onRunPrediction}><Sparkles className="size-4" /> Run fresh prediction</Button></section></div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Feature signals</h3><p className="mt-1 text-xs text-muted-foreground">Indicators computed from live closes</p></div><Button variant="outline" size="sm"><Settings2 className="size-3.5" /> Configure</Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Signal label="MA50" value={formatPrice(instrument.indicators.ma50, instrument.currency)} change={`${ma50Delta >= 0 ? "Price above" : "Price below"} MA50 (${Math.abs(ma50Delta).toFixed(1)}%)`} tone={ma50Delta >= 0 ? "positive" : "negative"} /><Signal label="MA200" value={formatPrice(instrument.indicators.ma200, instrument.currency)} change={`${ma200Delta >= 0 ? "Price above" : "Price below"} MA200 (${Math.abs(ma200Delta).toFixed(1)}%)`} tone={ma200Delta >= 0 ? "positive" : "negative"} /><Signal label="Daily return" value={`${instrument.indicators.dailyReturn >= 0 ? "+" : ""}${instrument.indicators.dailyReturn.toFixed(2)}%`} change={instrument.indicators.dailyReturn >= 0 ? "Bullish" : "Bearish"} tone={instrument.indicators.dailyReturn >= 0 ? "positive" : "negative"} /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Model performance</h3><p className="mt-1 text-xs text-muted-foreground">Validation set · {rangeLabels[range]}</p></div><CircleHelp className="size-4 text-muted-foreground" /></div><div className="mt-5 space-y-4"><Performance label="Validation accuracy" value={`${instrument.metrics.validationAccuracy.toFixed(1)}%`} progress={Math.min(100, instrument.metrics.validationAccuracy)} color="bg-chart-2" /><Performance label="MAE" value={instrument.metrics.mae.toFixed(2)} progress={Math.max(10, 100 - instrument.metrics.mae * 4)} color="bg-chart-3" /><Performance label="RMSE" value={instrument.metrics.rmse.toFixed(2)} progress={Math.max(10, 100 - instrument.metrics.rmse * 2)} color="bg-chart-4" /></div></section></div>

      <section className="mt-8"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Pipeline status</p><h3 className="mt-2 font-display text-2xl font-bold tracking-tight">From raw data to useful signal</h3></div><Button variant="ghost" size="sm" className="hidden sm:inline-flex">View methodology <ArrowUpRight /></Button></div><div className="mt-5 grid gap-3 md:grid-cols-5">{[[Database, "Data collection", `${rangeLabels[range]} of daily closes`, "Complete"], [RefreshCw, "Preprocessing", "Clean & aligned closes", "Complete"], [Activity, "Feature engineering", "MA50 · MA200 · Returns", "Complete"], [Cpu, "Model training", model, "Complete"], [Target, "Price prediction", "Ready for next close", "Active"]].map(([Icon, title, text, state], index) => { const StepIcon = Icon as LucideIcon; return <div key={title as string} className="relative rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><StepIcon className="size-4" /></div><span className="text-[10px] font-bold text-muted-foreground">0{index + 1}</span></div><h4 className="mt-4 text-sm font-bold">{title as string}</h4><p className="mt-1 min-h-8 text-xs leading-relaxed text-muted-foreground">{text as string}</p><div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-chart-2"><span className="size-1.5 rounded-full bg-chart-2" /> {state as string}</div></div> })}</div></section>
      <p className="mt-8 border-t border-border pt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Educational dashboard · Forecasts are model estimates, not financial advice. Market prices can change quickly.</p>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick = () => undefined }: { icon: LucideIcon; label: string; active?: boolean; onClick?: () => void }) { return <Button variant={active ? "default" : "ghost"} className="w-full justify-start gap-3 px-3 py-2.5 text-left text-sm font-medium" onClick={onClick}><Icon className="size-4" />{label}</Button>; }
function StockSelect({ value, onChange }: { value: Stock; onChange: (value: string) => void }) { return <label className="flex items-center gap-2 px-2 text-sm font-semibold"><div className="flex size-7 items-center justify-center rounded-md bg-chart-4 text-[10px] font-bold text-chart-4-foreground">{value.charAt(0)}</div><select aria-label="Select stock" value={value} onChange={(event) => onChange(event.target.value)} className="max-w-[124px] appearance-none bg-transparent pr-5 text-sm font-bold outline-none">{SYMBOLS.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}</select><ChevronDown className="pointer-events-none -ml-6 size-3.5 text-muted-foreground" /></label>; }
function MetricCard({ label, value, detail, icon: Icon, positive }: { label: string; value: string; detail: string; icon: LucideIcon; positive?: boolean }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className={cn("size-4", positive === false ? "text-chart-5" : "text-chart-2")} /></div><div className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</div><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>; }
function Signal({ label, value, change, tone }: { label: string; value: string; change: string; tone: "positive" | "negative" }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-2 font-display text-xl font-bold">{value}</p><p className={cn("mt-1 text-xs font-semibold", tone === "positive" ? "text-chart-2" : "text-chart-5")}>{change}</p></div>; }
function Performance({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <div><div className="flex justify-between text-xs"><span className="font-medium text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(4, Math.min(100, progress))}%` }} /></div></div>; }
function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string; currency: string }) { if (!active || !payload?.length) return null; return <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"><p className="font-semibold">{label}</p>{payload.map((item) => <p key={item.dataKey} className="mt-1 text-muted-foreground">{item.dataKey === "actual" ? "Actual" : "Predicted"}: <strong className="text-foreground">{item.value !== undefined && item.value !== null ? `${currency}${item.value.toLocaleString()}` : "—"}</strong></p>)}</div>; }

function ViewHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>;
}

function MarketDataView({ instruments, selectedStock, onSelectStock, onRefresh, isFetching, fetchedAt }: { instruments: Record<string, InstrumentData>; selectedStock: Stock; onSelectStock: (stock: Stock) => void; onRefresh: () => void; isFetching: boolean; fetchedAt: string }) {
  const rows = SYMBOLS.map((symbol) => instruments[symbol]).filter(Boolean);
  const advancing = rows.filter((row) => row.change > 0).length;
  const breadth = rows.length ? Math.round((advancing / rows.length) * 100) : 0;
  const totalVolume = rows.reduce((total, row) => total + row.volume, 0);
  return <div><ViewHeading eyebrow="Live market snapshot" title="Track the session at a glance" description="Real closing prices pulled from the Yahoo Finance feed — press refresh for the latest session." /><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Market breadth" value={`${breadth}%`} detail={`${advancing} of ${rows.length} tracked symbols advancing`} icon={TrendingUp} positive={breadth >= 50} /><MetricCard label="Session volume" value={formatVolume(totalVolume)} detail="Across tracked instruments" icon={BarChart3} positive /><MetricCard label="Data freshness" value={formatDateTime(fetchedAt)} detail="Last successful sync" icon={RefreshCw} positive /></div><section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:p-6"><div><h3 className="font-display text-lg font-bold">Tracked instruments</h3><p className="mt-1 text-xs text-muted-foreground">NSE and NASDAQ market close data</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} /> Refresh prices</Button><Badge variant="secondary" className="gap-1.5"><span className={cn("size-1.5 rounded-full", isFetching ? "bg-chart-4" : "bg-chart-2")} /> {isFetching ? "Syncing" : "Synced"}</Badge></div></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-secondary/60 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Instrument</th><th className="px-5 py-3 font-semibold">Last price</th><th className="px-5 py-3 font-semibold">Change</th><th className="px-5 py-3 font-semibold">Volume</th><th className="px-5 py-3 font-semibold">Signal</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-border">{rows.map((row) => { const positive = row.change >= 0; const isSelected = row.symbol === selectedStock; const trend = trendFor(row.change); return <tr key={row.symbol} className={cn("transition-colors hover:bg-secondary/40", isSelected && "bg-secondary/30")}><td className="px-5 py-4"><div className="font-bold">{row.symbol}</div><div className="mt-1 text-xs text-muted-foreground">{row.name} · {row.exchange}</div></td><td className="px-5 py-4 font-display font-bold">{formatPrice(row.lastPrice, row.currency)}</td><td className={cn("px-5 py-4 font-semibold", positive ? "text-chart-2" : "text-chart-5")}>{positive ? "+" : ""}{row.change.toFixed(2)}%</td><td className="px-5 py-4 text-muted-foreground">{formatVolume(row.volume)}</td><td className="px-5 py-4"><Badge variant={trend === "Neutral" ? "outline" : "secondary"}>{trend}</Badge></td><td className="px-5 py-4 text-right"><Button variant={isSelected ? "secondary" : "outline"} size="sm" onClick={() => onSelectStock(row.symbol as Stock)}>{isSelected ? <><Check className="size-3.5" /> Selected</> : "View"}</Button></td></tr>; })}</tbody></table></div></section></div>;
}

type LabResult = { model: ForecastModel; metrics: InstrumentData["metrics"]; forecast: number };

function ModelLabView({ model, setModel, range, selectedStock, onRefresh, isFetching }: { model: ForecastModel; setModel: (model: ForecastModel) => void; range: MarketRange; selectedStock: Stock; onRefresh: () => void; isFetching: boolean }) {
  const lab = useQuery({
    queryKey: ["model-lab", selectedStock, range],
    queryFn: async (): Promise<LabResult[]> => {
      const results = await Promise.all(MODELS.map(async (name) => {
        const payload = await getMarketWorkspaceData({ data: { symbols: [selectedStock], range, model: name } });
        const instrument = payload.instruments[selectedStock];
        return { model: name, metrics: instrument.metrics, forecast: instrument.forecast };
      }));
      return results;
    },
    staleTime: 5 * 60_000,
  });
  const active = lab.data?.find((item) => item.model === model);
  return <div><ViewHeading eyebrow="Experiment workspace" title="Compare and tune prediction models" description="Validation results for every model on the selected instrument — click a row to make it the active model." /><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Model comparison</h3><p className="mt-1 text-xs text-muted-foreground">{selectedStock} · validation set · {rangeLabels[range]}</p></div><Button variant="outline" size="sm" onClick={() => lab.refetch()}><RefreshCw className={cn("size-3.5", lab.isFetching && "animate-spin")} /> Run evaluation</Button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-secondary/60 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Model</th><th className="px-5 py-3 font-semibold">Accuracy</th><th className="px-5 py-3 font-semibold">MAE</th><th className="px-5 py-3 font-semibold">RMSE</th><th className="px-5 py-3 text-right font-semibold">State</th></tr></thead><tbody className="divide-y divide-border">{(lab.data ?? MODELS.map((name) => null)).map((item, index) => { const name = item?.model ?? MODELS[index]; const isActive = name === model; return <tr key={name} className={cn("transition-colors hover:bg-secondary/40", isActive && "bg-secondary/30")}><td className="px-5 py-4"><Button variant="ghost" className="h-auto justify-start gap-2 p-0 font-bold" onClick={() => setModel(name)}><span className={cn("size-2 rounded-full", isActive ? "bg-chart-2" : "bg-muted-foreground/40")} />{name}</Button></td><td className="px-5 py-4 font-display font-bold">{item ? `${item.metrics.validationAccuracy.toFixed(1)}%` : <span className="text-muted-foreground">…</span>}</td><td className="px-5 py-4 text-muted-foreground">{item ? item.metrics.mae.toFixed(2) : "…"}</td><td className="px-5 py-4 text-muted-foreground">{item ? item.metrics.rmse.toFixed(2) : "…"}</td><td className="px-5 py-4 text-right"><Badge variant={isActive ? "secondary" : "outline"}>{isActive ? "Active" : "Ready"}</Badge></td></tr>; })}</tbody></table></div>{lab.isError && <p className="border-t border-border p-4 text-xs text-chart-5">{lab.error.message}</p>}</section><section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-6"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Active configuration</Badge><h3 className="mt-5 font-display text-2xl font-bold">{model}</h3><p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">Configured for next-day close prediction on {selectedStock} using engineered momentum features.</p><div className="mt-7 space-y-4 border-t border-primary-foreground/15 pt-5"><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Validation accuracy</span><span className="font-semibold">{active ? `${active.metrics.validationAccuracy.toFixed(1)}%` : "…"}</span></div><div className="h-2 rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-chart-2" style={{ width: `${active ? Math.min(100, active.metrics.validationAccuracy) : 0}%` }} /></div><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Directional accuracy</span><span className="font-semibold">{active ? `${active.metrics.directionalAccuracy.toFixed(1)}%` : "…"}</span></div><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Training window</span><span className="font-semibold">{rangeLabels[range]}</span></div></div><Button variant="secondary" className="mt-7 w-full" onClick={onRefresh}><Sparkles className="size-4" /> Train active model</Button></section></div><section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Feature configuration</h3><p className="mt-1 text-xs text-muted-foreground">Inputs included in the next prediction pass</p></div><Badge variant="secondary">Live closes active</Badge></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Signal label="Price history" value="Daily closes" change="Enabled" tone="positive" /><Signal label="Moving averages" value="MA5 · MA20" change="Enabled" tone="positive" /><Signal label="Trend fit" value="30-day slope" change="Enabled" tone="positive" /><Signal label="Momentum" value="5 & 20-day momentum" change="Enabled" tone="positive" /></div></section></div>;
}

function PerformanceView({ instrument, model, fetchedAt }: { instrument: InstrumentData; model: ForecastModel; fetchedAt: string }) {
  const { metrics } = instrument;
  const lossData = metrics.lossHistory.map((point) => ({ epoch: point.epoch, loss: point.loss }));
  const errorData = instrument.predictionVsActual.map((point) => ({ day: point.day, actual: point.actual, predicted: point.predicted }));
  return <div><ViewHeading eyebrow="Validation & reliability" title="Measure the signal over time" description={`How the ${model} predictions stacked up against real closes on ${instrument.symbol}.`} /><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Validation accuracy" value={`${metrics.validationAccuracy.toFixed(1)}%`} detail={`${model} · ${metrics.validationSamples} samples`} icon={Target} positive={metrics.validationAccuracy >= 70} /><MetricCard label="Mean absolute error" value={metrics.mae.toFixed(2)} detail="Average price deviation" icon={Activity} positive /><MetricCard label="Model stability" value={`R² ${metrics.r2.toFixed(3)}`} detail="Fit against actual closes" icon={ShieldCheck} positive={metrics.r2 >= 0.9} /></div><div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Prediction vs actual</h3><p className="mt-1 text-xs text-muted-foreground">Validation window · {instrument.exchange}</p></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-1" /> Actual</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-3" /> Predicted</span></div></div><div className="mt-7 h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={errorData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} interval="preserveStartEnd" minTickGap={40} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${currencySymbol(instrument.currency)}${(value / 1000).toFixed(1)}k`} domain={["auto", "auto"]} /><Tooltip content={<ChartTooltip currency={currencySymbol(instrument.currency)} />} /><Line type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="predicted" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Training loss</h3><p className="mt-1 text-xs text-muted-foreground">Rolling RMSE across training</p></div><CircleHelp className="size-4 text-muted-foreground" /></div><div className="mt-6 space-y-6"><Performance label="Training loss" value={metrics.trainingLoss.toFixed(3)} progress={Math.max(10, 100 - metrics.trainingLoss * 4)} color="bg-chart-3" /><Performance label="Validation accuracy" value={`${metrics.validationAccuracy.toFixed(1)}%`} progress={metrics.validationAccuracy} color="bg-chart-2" /><Performance label="Directional accuracy" value={`${metrics.directionalAccuracy.toFixed(1)}%`} progress={metrics.directionalAccuracy} color="bg-chart-1" /></div><div className="mt-7 h-[180px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={lossData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}><defs><linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} domain={["auto", "auto"]} tickFormatter={(value) => value.toFixed(1)} /><Tooltip formatter={(value: number) => [value.toFixed(3), "Loss"]} /><Area type="monotone" dataKey="loss" stroke="var(--chart-3)" strokeWidth={2} fill="url(#lossFill)" /></AreaChart></ResponsiveContainer></div><div className="mt-4 border-t border-border pt-4"><p className="text-xs font-semibold">Last evaluated</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(fetchedAt)}</p></div></section></div><section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Evaluation summary</h3><p className="mt-1 text-xs text-muted-foreground">Current validation run</p></div><Badge variant="secondary" className="gap-1.5"><Check className="size-3.5" /> {metrics.validationAccuracy >= 70 ? "Passed" : "Review"}</Badge></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Validation samples</p><p className="mt-1 font-display text-xl font-bold">{metrics.validationSamples}</p></div><div><p className="text-xs text-muted-foreground">RMSE</p><p className="mt-1 font-display text-xl font-bold">{metrics.rmse.toFixed(2)}</p></div><div><p className="text-xs text-muted-foreground">R² score</p><p className="mt-1 font-display text-xl font-bold">{metrics.r2.toFixed(3)}</p></div></div></section><p className="mt-8 border-t border-border pt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Educational dashboard · Forecasts are model estimates, not financial advice.</p></div>;
}
