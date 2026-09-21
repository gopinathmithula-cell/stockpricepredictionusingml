import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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
  type InstrumentData,
} from "@/lib/market-data.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseForecast · ML Stock Prediction" },
      {
        name: "description",
        content:
          "Explore machine-learning stock forecasts with historical trends, engineered indicators, and model performance in one clear workspace.",
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

type Range = "1M" | "6M" | "1Y" | "2Y";
type Stock = string;
type Model = "Linear Regression" | "LSTM Network" | "Random Forest";
type Country = "India" | "USA" | "UK" | "Japan";
type WorkspaceView = "Overview" | "Market data" | "Model lab" | "Performance";

const countryStocks: Record<Country, Array<{ symbol: Stock; name: string }>> = {
  India: [
    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "INFY.NS", name: "Infosys Limited" },
  ],
  USA: [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
  ],
  UK: [
    { symbol: "SHEL.L", name: "Shell plc" },
    { symbol: "HSBA.L", name: "HSBC Holdings plc" },
  ],
  Japan: [
    { symbol: "7203.T", name: "Toyota Motor Corporation" },
    { symbol: "6758.T", name: "Sony Group Corporation" },
  ],
};

const rangeLabels: Record<Range, string> = { "1M": "1 month", "6M": "6 months", "1Y": "1 year", "2Y": "2 years" };

const modelComparison = [
  { name: "LSTM Network", accuracy: "84.6%", mae: "3.24", rmse: "5.87", status: "Active" },
  { name: "Linear Regression", accuracy: "78.2%", mae: "4.91", rmse: "8.12", status: "Baseline" },
  { name: "Random Forest", accuracy: "81.8%", mae: "3.76", rmse: "6.48", status: "Ready" },
];

const performanceHistory = [
  { month: "Jan", lstm: 79, linear: 73 },
  { month: "Feb", lstm: 81, linear: 75 },
  { month: "Mar", lstm: 80, linear: 76 },
  { month: "Apr", lstm: 83, linear: 77 },
  { month: "May", lstm: 82, linear: 78 },
  { month: "Jun", lstm: 85, linear: 78 },
];

function Index() {
  const [selectedStock, setSelectedStock] = useState<Stock>("TCS.NS");
  const [country, setCountry] = useState<Country>("India");
  const [range, setRange] = useState<Range>("1Y");
  const [model, setModel] = useState<Model>("LSTM Network");
  const [activeView, setActiveView] = useState<WorkspaceView>("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const fetchMarketData = useServerFn(getMarketWorkspaceData);
  const symbols = useMemo(() => countryStocks[country].map((stock) => stock.symbol), [country]);
  const marketQuery = useQuery({
    queryKey: ["market-workspace", country, symbols, range, model],
    queryFn: () => fetchMarketData({ data: { symbols, range, model } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const selected = marketQuery.data?.instruments[selectedStock];
  const isRefreshing = marketQuery.isFetching;
  const selectedPrice = selected?.lastPrice ?? 0;
  const selectedChange = selected?.change ?? 0;
  const selectedForecast = selected?.forecast ?? 0;
  const isPositive = selected.change >= 0;
  const confidence = selected?.metrics.validationAccuracy ?? 0;
  const forecastDelta = selected?.forecastDelta ?? 0;
  const viewMeta: Record<WorkspaceView, { eyebrow: string; title: string }> = {
    Overview: { eyebrow: "Tuesday, June 24, 2025", title: "Prediction overview" },
    "Market data": { eyebrow: "Workspace / Market data", title: "Market data" },
    "Model lab": { eyebrow: "Workspace / Model lab", title: "Model lab" },
    Performance: { eyebrow: "Workspace / Performance", title: "Performance" },
  };

  const chartData = selected?.series ?? [];

  const refreshData = () => {
    void marketQuery.refetch();
  };

  const changeCountry = (nextCountry: Country) => {
    setCountry(nextCountry);
    setSelectedStock(countryStocks[nextCountry][0].symbol);
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
          <div className="border-t border-border p-4"><div className="rounded-xl bg-secondary p-4"><div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="size-4 text-chart-2" /> Data health</div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Latest market data is synced and ready for analysis.</p><div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-chart-2"><span className="size-1.5 rounded-full bg-chart-2" /> Connected to yfinance</div></div></div>
        </aside>

        <section className="min-w-0 flex-1">
             <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur md:px-8">
             <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu /></Button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{viewMeta[activeView].eyebrow}</p><h1 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">{viewMeta[activeView].title}</h1></div></div>
            <div className="flex items-center gap-2 md:gap-3"><Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex" onClick={refreshData}><RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} /> Sync data</Button><Button variant="ghost" size="icon" aria-label="Search"><Search /></Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><div className="ml-1 hidden size-9 items-center justify-center rounded-full bg-chart-4 text-sm font-bold text-chart-4-foreground sm:flex">MG</div></div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="flex items-center gap-2"><Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-chart-2" /> Live analysis</Badge><span className="text-xs text-muted-foreground">Based on historical market data</span></div><h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">See the signal before<br className="hidden md:block" /> the market opens.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">A machine-learning view of price patterns, momentum, and the next trading day — designed to make research easier to read.</p></div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm"><CountrySelect value={country} onChange={changeCountry} /><div className="hidden h-7 w-px bg-border sm:block" /><StockSelect value={selectedStock} stocks={countryStocks[country]} onChange={setSelectedStock} /><div className="hidden h-7 w-px bg-border sm:block" /><div className="flex items-center gap-1">{(["1M", "6M", "1Y", "2Y"] as Range[]).map((item) => <Button key={item} variant={range === item ? "secondary" : "ghost"} size="sm" onClick={() => setRange(item)}>{item}</Button>)}</div><div className="hidden h-7 w-px bg-border sm:block" /><label className="hidden items-center gap-2 px-2 text-xs font-semibold md:flex"><Cpu className="size-3.5 text-muted-foreground" /><select aria-label="Select model" value={model} onChange={(event) => setModel(event.target.value as Model)} className="appearance-none bg-transparent pr-2 outline-none"><option>Linear Regression</option><option>LSTM Network</option><option>Random Forest</option></select></label></div>
            </div>

             <div className={cn(activeView !== "Overview" && "hidden")}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Current price" value={`${selectedPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} suffix={currencySymbol(selected?.currency)} detail={marketQuery.isLoading ? "Loading live market data…" : "Latest available market price"} icon={TrendingUp} /><MetricCard label="Daily change" value={`${isPositive ? "+" : ""}${selectedChange.toFixed(2)}%`} detail="Compared to previous close" icon={isPositive ? ArrowUpRight : ArrowDownRight} positive={isPositive} /><MetricCard label="Model confidence" value={`${confidence}%`} detail={`${model} · ${rangeLabels[range]}`} icon={Sparkles} positive /><MetricCard label="Next-day forecast" value={`${selectedForecast.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} suffix={currencySymbol(selected?.currency)} detail={`${forecastDelta >= 0 ? "+" : ""}${forecastDelta.toFixed(2)}% expected move`} positive={forecastDelta >= 0} icon={Target} /></div>

             <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><LivePriceChart instrument={selected} data={chartData} range={range} isLoading={marketQuery.isLoading} error={marketQuery.error instanceof Error ? marketQuery.error.message : undefined} />
               <section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-6"><div className="flex items-center justify-between"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Next trading day</Badge><MoreHorizontal className="size-5 opacity-60" /></div><p className="mt-8 text-sm text-primary-foreground/70">Predicted closing price</p><div className="mt-2 flex items-end gap-2"><span className="font-display text-4xl font-bold tracking-tight">{currencySymbol(selected?.currency)}{selectedForecast.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span><span className={cn("mb-1 flex items-center text-sm font-semibold", forecastDelta >= 0 ? "text-chart-2" : "text-chart-5")}><ArrowUpRight className="size-4" /> {Math.abs(forecastDelta).toFixed(2)}%</span></div><div className="mt-7 border-t border-primary-foreground/15 pt-5"><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Confidence score</span><span className="font-semibold">{confidence}%</span></div><div className="mt-3 h-2 rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-chart-2" style={{ width: `${confidence}%` }} /></div><p className="mt-3 text-xs leading-relaxed text-primary-foreground/65">The model uses the latest available price history and momentum signals.</p></div><Button variant="secondary" className="mt-7 w-full" onClick={refreshData} disabled={isRefreshing}><Sparkles className="size-4" /> Run fresh prediction</Button></section></div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Feature signals</h3><p className="mt-1 text-xs text-muted-foreground">Indicators generated during preprocessing</p></div><Button variant="outline" size="sm"><Settings2 className="size-3.5" /> Configure</Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Signal label="MA50" value="3,790.4" change="+1.36%" tone="positive" /><Signal label="MA200" value="3,524.8" change="+9.01%" tone="positive" /><Signal label="Daily return" value="+2.84%" change="Bullish" tone="positive" /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Model performance</h3><p className="mt-1 text-xs text-muted-foreground">Validation set · {rangeLabels[range]}</p></div><CircleHelp className="size-4 text-muted-foreground" /></div><div className="mt-5 space-y-4"><Performance label="Accuracy" value="84.6%" progress={84.6} color="bg-chart-2" /><Performance label="MAE" value="3.24" progress={76} color="bg-chart-3" /><Performance label="RMSE" value="5.87" progress={68} color="bg-chart-4" /></div></section></div>

            <section className="mt-8"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Pipeline status</p><h3 className="mt-2 font-display text-2xl font-bold tracking-tight">From raw data to useful signal</h3></div><Button variant="ghost" size="sm" className="hidden sm:inline-flex">View methodology <ArrowUpRight /></Button></div><div className="mt-5 grid gap-3 md:grid-cols-5">{[[Database, "Data collection", "2 years synced", "Complete"], [RefreshCw, "Preprocessing", "Clean & aligned", "Complete"], [Activity, "Feature engineering", "MA50 · MA200 · Returns", "Complete"], [Cpu, "Model training", model, "Complete"], [Target, "Price prediction", "Ready for next close", "Active"]].map(([Icon, title, text, state], index) => { const StepIcon = Icon as LucideIcon; return <div key={title as string} className="relative rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><StepIcon className="size-4" /></div><span className="text-[10px] font-bold text-muted-foreground">0{index + 1}</span></div><h4 className="mt-4 text-sm font-bold">{title as string}</h4><p className="mt-1 min-h-8 text-xs leading-relaxed text-muted-foreground">{text as string}</p><div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-chart-2"><span className="size-1.5 rounded-full bg-chart-2" /> {state as string}</div></div> })}</div></section>
             <p className="mt-8 border-t border-border pt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Educational dashboard · Forecasts are model estimates, not financial advice. Market prices can change quickly.</p></div>
              {activeView === "Market data" && <MarketDataView country={country} selectedStock={selectedStock} instruments={marketQuery.data?.instruments ?? {}} selected={selected} range={range} isRefreshing={isRefreshing} fetchedAt={marketQuery.data?.fetchedAt} onCountryChange={changeCountry} onSelectStock={setSelectedStock} onRefresh={refreshData} />}
             {activeView === "Model lab" && <ModelLabView model={model} setModel={setModel} confidence={confidence} onRefresh={refreshData} isRefreshing={isRefreshing} />}
              {activeView === "Performance" && <PerformanceView instrument={selected} model={model} />}
          </div>
        </section>
      </div>
       {mobileMenu && <div className="fixed inset-0 z-50 bg-foreground/20 lg:hidden" onClick={() => setMobileMenu(false)}><aside className="h-full w-[280px] bg-sidebar p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="size-5" /></div><span className="font-display font-bold">PulseForecast</span></div><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X /></Button></div><nav className="mt-10 space-y-2"><NavItem icon={LineChart} label="Overview" active={activeView === "Overview"} onClick={() => { setActiveView("Overview"); setMobileMenu(false); }} /><NavItem icon={BarChart3} label="Market data" active={activeView === "Market data"} onClick={() => { setActiveView("Market data"); setMobileMenu(false); }} /><NavItem icon={Cpu} label="Model lab" active={activeView === "Model lab"} onClick={() => { setActiveView("Model lab"); setMobileMenu(false); }} /><NavItem icon={Target} label="Performance" active={activeView === "Performance"} onClick={() => { setActiveView("Performance"); setMobileMenu(false); }} /></nav></aside></div>}
    </main>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick = () => undefined }: { icon: LucideIcon; label: string; active?: boolean; onClick?: () => void }) { return <Button variant={active ? "default" : "ghost"} className="w-full justify-start gap-3 px-3 py-2.5 text-left text-sm font-medium" onClick={onClick}><Icon className="size-4" />{label}</Button>; }
function CountrySelect({ value, onChange }: { value: Country; onChange: (value: Country) => void }) { return <label className="flex items-center gap-2 px-2 text-sm font-semibold"><span aria-hidden>{value === "India" ? "🇮🇳" : value === "USA" ? "🇺🇸" : value === "UK" ? "🇬🇧" : "🇯🇵"}</span><select aria-label="Select country" value={value} onChange={(event) => onChange(event.target.value as Country)} className="appearance-none bg-transparent pr-5 text-sm font-bold outline-none">{(["India", "USA", "UK", "Japan"] as Country[]).map((country) => <option key={country}>{country}</option>)}</select><ChevronDown className="pointer-events-none -ml-6 size-3.5 text-muted-foreground" /></label>; }
function StockSelect({ value, stocks, onChange }: { value: Stock; stocks: Array<{ symbol: Stock; name: string }>; onChange: (value: Stock) => void }) { return <label className="flex items-center gap-2 px-2 text-sm font-semibold"><div className="flex size-7 items-center justify-center rounded-md bg-chart-4 text-[10px] font-bold text-chart-4-foreground">{value.charAt(0)}</div><select aria-label="Select stock" value={value} onChange={(event) => onChange(event.target.value)} className="max-w-[126px] appearance-none bg-transparent pr-5 text-sm font-bold outline-none">{stocks.map((stock) => <option key={stock.symbol} value={stock.symbol}>{stock.symbol}</option>)}</select><ChevronDown className="pointer-events-none -ml-6 size-3.5 text-muted-foreground" /></label>; }
function MetricCard({ label, value, suffix, detail, icon: Icon, positive }: { label: string; value: string; suffix?: string; detail: string; icon: LucideIcon; positive?: boolean }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className={cn("size-4", positive === false ? "text-chart-5" : "text-chart-2")} /></div><div className="mt-3 flex items-baseline gap-1"><span className="font-display text-2xl font-bold tracking-tight">{suffix === "₹" || suffix === "$" ? suffix : ""}{value}</span>{suffix && suffix !== "₹" && suffix !== "$" && <span className="text-xs text-muted-foreground">{suffix}</span>}</div><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>; }
function Signal({ label, value, change, tone }: { label: string; value: string; change: string; tone: "positive" | "negative" }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-2 font-display text-xl font-bold">{value}</p><p className={cn("mt-1 text-xs font-semibold", tone === "positive" ? "text-chart-2" : "text-chart-5")}>{change}</p></div>; }
function Performance({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <div><div className="flex justify-between text-xs"><span className="font-medium text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", color)} style={{ width: `${progress}%` }} /></div></div>; }
function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string; currency: string }) { if (!active || !payload?.length) return null; return <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"><p className="font-semibold">{label}</p>{payload.map((item) => <p key={item.dataKey} className="mt-1 text-muted-foreground">{item.dataKey === "actual" ? "Actual" : "Predicted"}: <strong className="text-foreground">{currency}{item.value?.toLocaleString()}</strong></p>)}</div>; }

function currencySymbol(currency?: string) { if (currency === "INR") return "₹"; if (currency === "GBP") return "£"; if (currency === "JPY") return "¥"; return "$"; }

function LivePriceChart({ instrument, data, range, isLoading, error }: { instrument?: InstrumentData; data: InstrumentData["series"]; range: Range; isLoading: boolean; error?: string }) {
  const symbol = currencySymbol(instrument?.currency);
  return <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold">Real-time price monitoring</h3><Badge variant="outline" className="font-normal">{instrument?.symbol ?? "Loading"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Latest available market prices · auto-refreshes every 60 seconds · {rangeLabels[range]}</p></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-1" /> Actual</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-3" /> Predicted</span><Button variant="ghost" size="icon" aria-label="Download chart"><Download /></Button></div></div><div className="mt-7 h-[290px] min-h-[290px] min-w-0 w-full">{isLoading ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><RefreshCw className="mr-2 size-4 animate-spin" /> Loading live prices…</div> : error ? <div className="flex h-full items-center justify-center text-sm text-destructive">Live prices are temporarily unavailable. Please refresh.</div> : <ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} minTickGap={28} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${symbol}${Number(value).toLocaleString(undefined, { notation: "compact" })}`} domain={["auto", "auto"]} /><Tooltip content={<ChartTooltip currency={symbol} />} /><Area type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#actualFill)" activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }} /><Area type="monotone" dataKey="predicted" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" fill="none" activeDot={{ r: 4, fill: "var(--chart-3)", stroke: "var(--card)", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer>}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> {instrument?.exchange ?? "Market"} · {instrument?.currency ?? "Currency"}</p><p className="text-xs font-semibold text-chart-2"><span className="mr-1 inline-block size-1.5 rounded-full bg-chart-2 align-middle" /> Live feed connected</p></div></section>;
}

function ViewHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>;
}

function MarketDataView({ country, selectedStock, instruments, selected, range, isRefreshing, fetchedAt, onCountryChange, onSelectStock, onRefresh }: { country: Country; selectedStock: Stock; instruments: Record<string, InstrumentData>; selected?: InstrumentData; range: Range; isRefreshing: boolean; fetchedAt?: string; onCountryChange: (country: Country) => void; onSelectStock: (stock: Stock) => void; onRefresh: () => void }) {
  const rows = countryStocks[country].map((stock) => instruments[stock.symbol]).filter((item): item is InstrumentData => Boolean(item));
  const advancing = rows.length ? Math.round((rows.filter((row) => row.change >= 0).length / rows.length) * 100) : 0;
  const volume = rows.reduce((total, row) => total + row.volume, 0);
  return <div><div className="flex flex-wrap items-start justify-between gap-4"><ViewHeading eyebrow="Live market snapshot" title={`${country} stock monitor`} description="Compare live market prices by country and select an instrument to update the monitoring graph." /><div className="flex items-center gap-2"><CountrySelect value={country} onChange={onCountryChange} /><Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}><RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} /> Refresh prices</Button></div></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Market breadth" value={`${advancing}%`} detail="Advancing tracked symbols" icon={TrendingUp} positive /><MetricCard label="Session volume" value={volume.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })} detail={`Across ${country} instruments`} icon={BarChart3} positive /><MetricCard label="Last synced" value={fetchedAt ? new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} detail="Automatically refreshes every minute" icon={RefreshCw} positive /></div><div className="mt-4"><LivePriceChart instrument={selected} data={selected?.series ?? []} range={range} isLoading={isRefreshing && !selected} /></div><section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:p-6"><div><h3 className="font-display text-lg font-bold">{country} instruments</h3><p className="mt-1 text-xs text-muted-foreground">Latest available exchange prices</p></div><Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-chart-2" /> Live feed</Badge></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-secondary/60 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Instrument</th><th className="px-5 py-3 font-semibold">Last price</th><th className="px-5 py-3 font-semibold">Change</th><th className="px-5 py-3 font-semibold">Volume</th><th className="px-5 py-3 font-semibold">Exchange</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-border">{rows.map((row) => { const positive = row.change >= 0; const isSelected = row.symbol === selectedStock; return <tr key={row.symbol} className={cn("transition-colors hover:bg-secondary/40", isSelected && "bg-secondary/30")}><td className="px-5 py-4"><div className="font-bold">{row.symbol}</div><div className="mt-1 text-xs text-muted-foreground">{row.name}</div></td><td className="px-5 py-4 font-display font-bold">{currencySymbol(row.currency)}{row.lastPrice.toLocaleString()}</td><td className={cn("px-5 py-4 font-semibold", positive ? "text-chart-2" : "text-chart-5")}>{positive ? "+" : ""}{row.change.toFixed(2)}%</td><td className="px-5 py-4 text-muted-foreground">{row.volume.toLocaleString(undefined, { notation: "compact" })}</td><td className="px-5 py-4"><Badge variant="outline">{row.exchange}</Badge></td><td className="px-5 py-4 text-right"><Button variant={isSelected ? "secondary" : "outline"} size="sm" onClick={() => onSelectStock(row.symbol)}>{isSelected ? <><Check className="size-3.5" /> Selected</> : "View"}</Button></td></tr>; })}</tbody></table></div></section></div>;
}

function ModelLabView({ model, setModel, confidence, onRefresh, isRefreshing }: { model: Model; setModel: (model: Model) => void; confidence: number; onRefresh: () => void; isRefreshing: boolean }) {
  return <div><ViewHeading eyebrow="Experiment workspace" title="Compare and tune prediction models" description="Review validation results, choose the active model, and run a fresh training pass against the current feature set." /><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Model comparison</h3><p className="mt-1 text-xs text-muted-foreground">Validation set · June 2025</p></div><Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} /> Run evaluation</Button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-secondary/60 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Model</th><th className="px-5 py-3 font-semibold">Accuracy</th><th className="px-5 py-3 font-semibold">MAE</th><th className="px-5 py-3 font-semibold">RMSE</th><th className="px-5 py-3 text-right font-semibold">State</th></tr></thead><tbody className="divide-y divide-border">{modelComparison.map((item) => { const active = item.name === model; return <tr key={item.name} className={cn("transition-colors hover:bg-secondary/40", active && "bg-secondary/30")}><td className="px-5 py-4"><Button variant="ghost" className="h-auto justify-start gap-2 p-0 font-bold" onClick={() => { if (item.name === "LSTM Network" || item.name === "Linear Regression") setModel(item.name); }}><span className={cn("size-2 rounded-full", active ? "bg-chart-2" : "bg-muted-foreground/40")} />{item.name}</Button></td><td className="px-5 py-4 font-display font-bold">{item.accuracy}</td><td className="px-5 py-4 text-muted-foreground">{item.mae}</td><td className="px-5 py-4 text-muted-foreground">{item.rmse}</td><td className="px-5 py-4 text-right"><Badge variant={active ? "secondary" : "outline"}>{item.status}</Badge></td></tr>; })}</tbody></table></div></section><section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-6"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Active configuration</Badge><h3 className="mt-5 font-display text-2xl font-bold">{model}</h3><p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">Configured for next-day close prediction using engineered momentum features.</p><div className="mt-7 space-y-4 border-t border-primary-foreground/15 pt-5"><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Validation accuracy</span><span className="font-semibold">{confidence}%</span></div><div className="h-2 rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-chart-2" style={{ width: `${confidence}%` }} /></div><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Features enabled</span><span className="font-semibold">12</span></div><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Training window</span><span className="font-semibold">2 years</span></div></div><Button variant="secondary" className="mt-7 w-full" onClick={onRefresh}><Sparkles className="size-4" /> Train active model</Button></section></div><section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Feature configuration</h3><p className="mt-1 text-xs text-muted-foreground">Inputs included in the next training pass</p></div><Badge variant="secondary">12 features active</Badge></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Signal label="Price history" value="OHLCV" change="Enabled" tone="positive" /><Signal label="Moving averages" value="MA50 · MA200" change="Enabled" tone="positive" /><Signal label="Returns" value="1D · 5D · 20D" change="Enabled" tone="positive" /><Signal label="Momentum" value="RSI · MACD" change="Enabled" tone="positive" /></div></section></div>;
}

function PerformanceView({ instrument, model }: { instrument?: InstrumentData; model: Model }) {
  return <div><ViewHeading eyebrow="Validation & reliability" title="Measure the signal over time" description="See how the active model has performed against the baseline across recent validation windows." /><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Validation accuracy" value="84.6%" detail="LSTM Network · 6 month window" icon={Target} positive /><MetricCard label="Mean absolute error" value="3.24" detail="Average price deviation" icon={Activity} positive /><MetricCard label="Model stability" value="92/100" detail="Low variance across folds" icon={ShieldCheck} positive /></div><div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Accuracy trend</h3><p className="mt-1 text-xs text-muted-foreground">Monthly validation accuracy · 2025</p></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-1" /> LSTM</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-3" /> Baseline</span></div></div><div className="mt-7 h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={performanceHistory} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} /><YAxis domain={[65, 90]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value: number) => [`${value}%`, "Accuracy"]} /><Area type="monotone" dataKey="lstm" stroke="var(--chart-1)" strokeWidth={2.5} fill="none" /><Area type="monotone" dataKey="linear" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" fill="none" /></AreaChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Error metrics</h3><p className="mt-1 text-xs text-muted-foreground">Lower is better</p></div><CircleHelp className="size-4 text-muted-foreground" /></div><div className="mt-6 space-y-6"><Performance label="Accuracy" value="84.6%" progress={84.6} color="bg-chart-2" /><Performance label="MAE" value="3.24" progress={76} color="bg-chart-3" /><Performance label="RMSE" value="5.87" progress={68} color="bg-chart-4" /><Performance label="Directional accuracy" value="81.2%" progress={81.2} color="bg-chart-1" /></div><div className="mt-7 border-t border-border pt-5"><p className="text-xs font-semibold">Last evaluated</p><p className="mt-1 text-xs text-muted-foreground">June 24, 2025 · 09:42 UTC</p></div></section></div><section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Evaluation summary</h3><p className="mt-1 text-xs text-muted-foreground">Current validation run</p></div><Badge variant="secondary" className="gap-1.5"><Check className="size-3.5" /> Passed</Badge></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Validation samples</p><p className="mt-1 font-display text-xl font-bold">428</p></div><div><p className="text-xs text-muted-foreground">Best fold</p><p className="mt-1 font-display text-xl font-bold">87.1%</p></div><div><p className="text-xs text-muted-foreground">Confidence interval</p><p className="mt-1 font-display text-xl font-bold">±2.8%</p></div></div></section></div>;
}
