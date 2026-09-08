import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
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
type Stock = "TCS.NS" | "AAPL" | "RELIANCE.NS";
type Model = "Linear Regression" | "LSTM Network";

const stockInfo: Record<Stock, { name: string; exchange: string; price: number; change: number; forecast: number }> = {
  "TCS.NS": { name: "Tata Consultancy Services", exchange: "NSE · INR", price: 3_842.2, change: 2.84, forecast: 3_958.6 },
  AAPL: { name: "Apple Inc.", exchange: "NASDAQ · USD", price: 227.16, change: 1.21, forecast: 231.84 },
  "RELIANCE.NS": { name: "Reliance Industries", exchange: "NSE · INR", price: 2_914.7, change: -0.42, forecast: 2_889.2 },
};

const history = [
  { day: "Jan 08", actual: 3238, predicted: 3214 },
  { day: "Jan 22", actual: 3364, predicted: 3340 },
  { day: "Feb 05", actual: 3298, predicted: 3312 },
  { day: "Feb 19", actual: 3454, predicted: 3427 },
  { day: "Mar 04", actual: 3522, predicted: 3554 },
  { day: "Mar 18", actual: 3478, predicted: 3490 },
  { day: "Apr 01", actual: 3629, predicted: 3598 },
  { day: "Apr 15", actual: 3584, predicted: 3616 },
  { day: "Apr 29", actual: 3748, predicted: 3712 },
  { day: "May 13", actual: 3689, predicted: 3710 },
  { day: "May 27", actual: 3822, predicted: 3792 },
  { day: "Jun 10", actual: 3784, predicted: 3811 },
  { day: "Jun 24", actual: 3842, predicted: 3828 },
];

const rangeLabels: Record<Range, string> = { "1M": "1 month", "6M": "6 months", "1Y": "1 year", "2Y": "2 years" };

function Index() {
  const [selectedStock, setSelectedStock] = useState<Stock>("TCS.NS");
  const [range, setRange] = useState<Range>("1Y");
  const [model, setModel] = useState<Model>("LSTM Network");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const selected = stockInfo[selectedStock];
  const isPositive = selected.change >= 0;
  const confidence = model === "LSTM Network" ? 84.6 : 78.2;
  const forecastDelta = ((selected.forecast - selected.price) / selected.price) * 100;

  const chartData = useMemo(() => {
    const scale = selected.price / 3842;
    return history.map((point) => ({ ...point, actual: Math.round(point.actual * scale), predicted: Math.round(point.predicted * scale) }));
  }, [selected.price]);

  const refreshData = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
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
            <nav className="mt-3 space-y-1"><NavItem icon={LineChart} label="Overview" active /><NavItem icon={BarChart3} label="Market data" /><NavItem icon={Cpu} label="Model lab" /><NavItem icon={Target} label="Performance" /></nav>
            <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">System</p>
            <nav className="mt-3 space-y-1"><NavItem icon={Database} label="Data sources" /><NavItem icon={Settings2} label="Settings" /></nav>
          </div>
          <div className="border-t border-border p-4"><div className="rounded-xl bg-secondary p-4"><div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="size-4 text-chart-2" /> Data health</div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Latest market data is synced and ready for analysis.</p><div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-chart-2"><span className="size-1.5 rounded-full bg-chart-2" /> Connected to yfinance</div></div></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu /></Button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tuesday, June 24, 2025</p><h1 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">Prediction overview</h1></div></div>
            <div className="flex items-center gap-2 md:gap-3"><Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex" onClick={refreshData}><RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} /> Sync data</Button><Button variant="ghost" size="icon" aria-label="Search"><Search /></Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><div className="ml-1 hidden size-9 items-center justify-center rounded-full bg-chart-4 text-sm font-bold text-chart-4-foreground sm:flex">MG</div></div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="flex items-center gap-2"><Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-chart-2" /> Live analysis</Badge><span className="text-xs text-muted-foreground">Based on historical market data</span></div><h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">See the signal before<br className="hidden md:block" /> the market opens.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">A machine-learning view of price patterns, momentum, and the next trading day — designed to make research easier to read.</p></div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm"><StockSelect value={selectedStock} onChange={(value) => setSelectedStock(value as Stock)} /><div className="hidden h-7 w-px bg-border sm:block" /><div className="flex items-center gap-1">{(["1M", "6M", "1Y", "2Y"] as Range[]).map((item) => <Button key={item} variant={range === item ? "secondary" : "ghost"} size="sm" onClick={() => setRange(item)}>{item}</Button>)}</div><div className="hidden h-7 w-px bg-border sm:block" /><label className="hidden items-center gap-2 px-2 text-xs font-semibold md:flex"><Cpu className="size-3.5 text-muted-foreground" /><select aria-label="Select model" value={model} onChange={(event) => setModel(event.target.value as Model)} className="appearance-none bg-transparent pr-2 outline-none"><option>Linear Regression</option><option>LSTM Network</option></select></label></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Current price" value={`${selected.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} suffix={selected.exchange.includes("INR") ? "₹" : "$"} detail="Last market close" icon={TrendingUp} /><MetricCard label="Daily change" value={`${isPositive ? "+" : ""}${selected.change.toFixed(2)}%`} detail="Compared to previous close" icon={isPositive ? ArrowUpRight : ArrowDownRight} positive={isPositive} /><MetricCard label="Model confidence" value={`${confidence}%`} detail={`${model} · ${rangeLabels[range]}`} icon={Sparkles} positive /><MetricCard label="Next-day forecast" value={`${selected.forecast.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} suffix={selected.exchange.includes("INR") ? "₹" : "$"} detail={`${forecastDelta >= 0 ? "+" : ""}${forecastDelta.toFixed(2)}% expected move`} positive={forecastDelta >= 0} icon={Target} /></div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold">Price prediction</h3><Badge variant="outline" className="font-normal">{selectedStock}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Actual vs predicted close · {rangeLabels[range]}</p></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-1" /> Actual</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-chart-3" /> Predicted</span><Button variant="ghost" size="icon" aria-label="Download chart"><Download /></Button></div></div><div className="mt-7 h-[290px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `${selected.exchange.includes("INR") ? "₹" : "$"}${(value / 1000).toFixed(1)}k`} domain={["dataMin - 120", "dataMax + 100"]} /><Tooltip content={<ChartTooltip currency={selected.exchange.includes("INR") ? "₹" : "$"} />} /><Area type="monotone" dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#actualFill)" activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }} /><Area type="monotone" dataKey="predicted" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" fill="none" activeDot={{ r: 4, fill: "var(--chart-3)", stroke: "var(--card)", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Training window: Jan 2023 — Jun 2025</p><p className="text-xs font-semibold text-chart-2">Model fit: strong <span className="ml-1 inline-block size-1.5 rounded-full bg-chart-2 align-middle" /></p></div></section>
              <section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-sm md:p-6"><div className="flex items-center justify-between"><Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Next trading day</Badge><MoreHorizontal className="size-5 opacity-60" /></div><p className="mt-8 text-sm text-primary-foreground/70">Predicted closing price</p><div className="mt-2 flex items-end gap-2"><span className="font-display text-4xl font-bold tracking-tight">{selected.exchange.includes("INR") ? "₹" : "$"}{selected.forecast.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span><span className={cn("mb-1 flex items-center text-sm font-semibold", forecastDelta >= 0 ? "text-chart-2" : "text-chart-5")}><ArrowUpRight className="size-4" /> {Math.abs(forecastDelta).toFixed(2)}%</span></div><div className="mt-7 border-t border-primary-foreground/15 pt-5"><div className="flex justify-between text-xs"><span className="text-primary-foreground/70">Confidence score</span><span className="font-semibold">{confidence}%</span></div><div className="mt-3 h-2 rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-chart-2" style={{ width: `${confidence}%` }} /></div><p className="mt-3 text-xs leading-relaxed text-primary-foreground/65">The model sees positive momentum across the latest moving-average and return features.</p></div><Button variant="secondary" className="mt-7 w-full" onClick={refreshData}><Sparkles className="size-4" /> Run fresh prediction</Button></section></div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Feature signals</h3><p className="mt-1 text-xs text-muted-foreground">Indicators generated during preprocessing</p></div><Button variant="outline" size="sm"><Settings2 className="size-3.5" /> Configure</Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Signal label="MA50" value="3,790.4" change="+1.36%" tone="positive" /><Signal label="MA200" value="3,524.8" change="+9.01%" tone="positive" /><Signal label="Daily return" value="+2.84%" change="Bullish" tone="positive" /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-bold">Model performance</h3><p className="mt-1 text-xs text-muted-foreground">Validation set · {rangeLabels[range]}</p></div><CircleHelp className="size-4 text-muted-foreground" /></div><div className="mt-5 space-y-4"><Performance label="Accuracy" value="84.6%" progress={84.6} color="bg-chart-2" /><Performance label="MAE" value="3.24" progress={76} color="bg-chart-3" /><Performance label="RMSE" value="5.87" progress={68} color="bg-chart-4" /></div></section></div>

            <section className="mt-8"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Pipeline status</p><h3 className="mt-2 font-display text-2xl font-bold tracking-tight">From raw data to useful signal</h3></div><Button variant="ghost" size="sm" className="hidden sm:inline-flex">View methodology <ArrowUpRight /></Button></div><div className="mt-5 grid gap-3 md:grid-cols-5">{[[Database, "Data collection", "2 years synced", "Complete"], [RefreshCw, "Preprocessing", "Clean & aligned", "Complete"], [Activity, "Feature engineering", "MA50 · MA200 · Returns", "Complete"], [Cpu, "Model training", model, "Complete"], [Target, "Price prediction", "Ready for next close", "Active"]].map(([Icon, title, text, state], index) => { const StepIcon = Icon as LucideIcon; return <div key={title as string} className="relative rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><StepIcon className="size-4" /></div><span className="text-[10px] font-bold text-muted-foreground">0{index + 1}</span></div><h4 className="mt-4 text-sm font-bold">{title as string}</h4><p className="mt-1 min-h-8 text-xs leading-relaxed text-muted-foreground">{text as string}</p><div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-chart-2"><span className="size-1.5 rounded-full bg-chart-2" /> {state as string}</div></div> })}</div></section>
            <p className="mt-8 border-t border-border pt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Educational dashboard · Forecasts are model estimates, not financial advice. Market prices can change quickly.</p>
          </div>
        </section>
      </div>
      {mobileMenu && <div className="fixed inset-0 z-50 bg-foreground/20 lg:hidden" onClick={() => setMobileMenu(false)}><aside className="h-full w-[280px] bg-sidebar p-5 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="size-5" /></div><span className="font-display font-bold">PulseForecast</span></div><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X /></Button></div><nav className="mt-10 space-y-2"><NavItem icon={LineChart} label="Overview" active /><NavItem icon={BarChart3} label="Market data" /><NavItem icon={Cpu} label="Model lab" /><NavItem icon={Target} label="Performance" /></nav></aside></div>}
    </main>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: LucideIcon; label: string; active?: boolean }) { return <button className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}><Icon className="size-4" />{label}</button>; }
function StockSelect({ value, onChange }: { value: Stock; onChange: (value: string) => void }) { return <label className="flex items-center gap-2 px-2 text-sm font-semibold"><div className="flex size-7 items-center justify-center rounded-md bg-chart-4 text-[10px] font-bold text-chart-4-foreground">{value === "AAPL" ? "A" : "T"}</div><select aria-label="Select stock" value={value} onChange={(event) => onChange(event.target.value)} className="max-w-[112px] appearance-none bg-transparent pr-5 text-sm font-bold outline-none"><option value="TCS.NS">TCS.NS</option><option value="AAPL">AAPL</option><option value="RELIANCE.NS">RELIANCE.NS</option></select><ChevronDown className="pointer-events-none -ml-6 size-3.5 text-muted-foreground" /></label>; }
function MetricCard({ label, value, suffix, detail, icon: Icon, positive }: { label: string; value: string; suffix?: string; detail: string; icon: LucideIcon; positive?: boolean }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className={cn("size-4", positive === false ? "text-chart-5" : "text-chart-2")} /></div><div className="mt-3 flex items-baseline gap-1"><span className="font-display text-2xl font-bold tracking-tight">{suffix === "₹" || suffix === "$" ? suffix : ""}{value}</span>{suffix && suffix !== "₹" && suffix !== "$" && <span className="text-xs text-muted-foreground">{suffix}</span>}</div><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>; }
function Signal({ label, value, change, tone }: { label: string; value: string; change: string; tone: "positive" | "negative" }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-2 font-display text-xl font-bold">{value}</p><p className={cn("mt-1 text-xs font-semibold", tone === "positive" ? "text-chart-2" : "text-chart-5")}>{change}</p></div>; }
function Performance({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <div><div className="flex justify-between text-xs"><span className="font-medium text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", color)} style={{ width: `${progress}%` }} /></div></div>; }
function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string; currency: string }) { if (!active || !payload?.length) return null; return <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"><p className="font-semibold">{label}</p>{payload.map((item) => <p key={item.dataKey} className="mt-1 text-muted-foreground">{item.dataKey === "actual" ? "Actual" : "Predicted"}: <strong className="text-foreground">{currency}{item.value?.toLocaleString()}</strong></p>)}</div>; }
