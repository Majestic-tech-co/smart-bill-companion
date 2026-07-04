import { useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Wallet, Target, TrendingUp, Calendar as CalIcon, Sparkles, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  type Bill,
  type BillFrequency,
  type BillStatus,
  type Subscription,
  type VariableExpense,
  billStatusFromDueDay,
  currency,
  currencyPrecise,
  monthlyCost,
  nextOccurrence,
  occurrencesInMonth,
  uid,
} from "@/lib/finance-types";
import { cn } from "@/lib/utils";

const defaultBills: Bill[] = [
  { id: uid(), name: "Rent", amount: 1450, dueDay: 1, status: "paid" },
  { id: uid(), name: "Electric", amount: 92, dueDay: 12, status: "pending" },
  { id: uid(), name: "Internet", amount: 65, dueDay: 18, status: "pending" },
];
const defaultSubs: Subscription[] = [
  { id: uid(), name: "Streaming Plus", amount: 15.99, analyze: false },
  { id: uid(), name: "Cloud Storage", amount: 9.99, analyze: false },
  { id: uid(), name: "Gym", amount: 39, analyze: false },
];

export function Dashboard() {
  const [bills, setBills] = useLocalStorage<Bill[]>("sbs.bills", defaultBills);
  const [income, setIncome] = useLocalStorage<number>("sbs.income", 4200);
  const [variables, setVariables] = useLocalStorage<VariableExpense[]>("sbs.variables", [
    { id: uid(), name: "Groceries", amount: 420 },
    { id: uid(), name: "Dining", amount: 180 },
    { id: uid(), name: "Transport", amount: 140 },
  ]);
  const [subs, setSubs] = useLocalStorage<Subscription[]>("sbs.subs", defaultSubs);
  const [savingsRatePref, setSavingsRatePref] = useLocalStorage<number>("sbs.rate", 20);

  const totalBills = useMemo(() => bills.reduce((s, b) => s + b.amount, 0), [bills]);
  const totalVariable = useMemo(() => variables.reduce((s, v) => s + v.amount, 0), [variables]);
  const totalSubs = useMemo(() => subs.reduce((s, b) => s + b.amount, 0), [subs]);
  const potentialSavings = useMemo(
    () => subs.filter((s) => s.analyze).reduce((s, x) => s + x.amount, 0),
    [subs],
  );

  const paidTotal = useMemo(
    () => bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0),
    [bills],
  );
  const paidPct = totalBills > 0 ? (paidTotal / totalBills) * 100 : 0;

  const disposable = income - totalBills - totalVariable - totalSubs;
  const savingsTarget = Math.max(0, (income * savingsRatePref) / 100);
  const remaining = disposable - savingsTarget;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-40 bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Smart Bill<span className="text-gradient"> & Savings</span></h1>
              <p className="text-xs text-muted-foreground truncate">Private. Local-first. Yours.</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            icon={<Wallet className="h-5 w-5" />}
            label="Total Monthly Bills"
            value={currency(totalBills)}
            sub={`${bills.length} recurring · ${currency(paidTotal)} paid`}
            accent="primary"
          />
          <SummaryCard
            icon={<Target className="h-5 w-5" />}
            label="Savings Target"
            value={currency(savingsTarget)}
            sub={`${savingsRatePref}% of income`}
            accent="accent"
          />
          <SummaryCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Remaining Disposable"
            value={currency(remaining)}
            sub={remaining >= 0 ? "On track" : "Over budget"}
            accent={remaining >= 0 ? "success" : "destructive"}
          />
        </section>

        <section className="card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Monthly fixed expenses</p>
              <p className="text-xs text-muted-foreground">{currency(paidTotal)} paid of {currency(totalBills)}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{paidPct.toFixed(0)}%</span>
          </div>
          <Progress value={paidPct} className="h-3 bg-secondary" />
        </section>

        <Tabs defaultValue="bills" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary/60 p-1">
            <TabsTrigger value="bills" className="flex-1 min-w-[7rem]">Bills</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1 min-w-[7rem]">Schedule</TabsTrigger>
            <TabsTrigger value="savings" className="flex-1 min-w-[7rem]">Savings</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 min-w-[7rem]">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="mt-4">
            <BillManager bills={bills} setBills={setBills} />
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <Scheduler bills={bills} />
          </TabsContent>
          <TabsContent value="savings" className="mt-4">
            <SavingsOptimizer
              income={income}
              setIncome={setIncome}
              variables={variables}
              setVariables={setVariables}
              totalBills={totalBills}
              totalSubs={totalSubs}
              rate={savingsRatePref}
              setRate={setSavingsRatePref}
              potentialSavings={potentialSavings}
            />
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <Insights subs={subs} setSubs={setSubs} />
          </TabsContent>
        </Tabs>

        <footer className="text-center text-xs text-muted-foreground py-8">
          All data stays in your browser via local storage. No sign-in required.
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "primary" | "accent" | "success" | "destructive";
}) {
  const ring: Record<string, string> = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
    destructive: "text-destructive",
  };
  return (
    <div className="card-surface p-5 relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20" style={{ background: "var(--gradient-primary)" }} />
      <div className="flex items-start justify-between gap-3 relative">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 font-display">{value}</p>
          <p className={cn("text-xs mt-1", ring[accent])}>{sub}</p>
        </div>
        <div className={cn("h-10 w-10 rounded-lg grid place-items-center bg-secondary shrink-0", ring[accent])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Bill Manager -------------------- */
function BillManager({ bills, setBills }: { bills: Bill[]; setBills: (b: Bill[]) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");

  const add = () => {
    const amt = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (!name.trim() || !Number.isFinite(amt) || amt <= 0 || !Number.isFinite(day) || day < 1 || day > 31) return;
    const bill: Bill = { id: uid(), name: name.trim(), amount: amt, dueDay: day, status: billStatusFromDueDay(day, "pending") };
    setBills([...bills, bill]);
    setName("");
    setAmount("");
    setDueDay("");
  };

  const cycleStatus = (id: string) => {
    setBills(
      bills.map((b) => {
        if (b.id !== id) return b;
        const order: BillStatus[] = ["pending", "paid", "overdue"];
        const idx = order.indexOf(b.status);
        return { ...b, status: order[(idx + 1) % order.length] };
      }),
    );
  };
  const remove = (id: string) => setBills(bills.filter((b) => b.id !== id));

  const sorted = [...bills].sort((a, b) => a.dueDay - b.dueDay);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div className="card-surface p-4 sm:p-5">
        <h2 className="font-semibold mb-4">Recurring bills</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No bills yet. Add one on the right.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {sorted.map((b) => (
              <li key={b.id} className="py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary grid place-items-center text-xs font-mono text-muted-foreground">
                    {b.dueDay.toString().padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground">Due day {b.dueDay} · {currencyPrecise(b.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={b.status} onClick={() => cycleStatus(b.id)} />
                  <button
                    aria-label="Delete"
                    onClick={() => remove(b.id)}
                    className="h-8 w-8 rounded-md grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-surface p-4 sm:p-5 h-fit">
        <h2 className="font-semibold mb-1">Add a bill</h2>
        <p className="text-xs text-muted-foreground mb-3">Bills repeat automatically on the same day every month.</p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bn" className="text-xs">Name</Label>
            <Input id="bn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Electric" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="ba" className="text-xs">Amount</Label>
              <Input id="ba" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="bd" className="text-xs">Day of month</Label>
              <Input id="bd" type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="15" />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 border border-border/60 px-3 py-2">
            <CalIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              {dueDay && Number(dueDay) >= 1 && Number(dueDay) <= 31
                ? <>Recurs on day <span className="text-foreground font-medium">{Number(dueDay)}</span> of every month.</>
                : "Pick a day (1–31) to repeat monthly."}
            </p>
          </div>
          <Button onClick={add} className="w-full font-semibold" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
            <Plus className="h-4 w-4 mr-1" /> Add recurring bill
          </Button>
          <p className="text-xs text-muted-foreground">Tap the status pill to cycle Pending → Paid → Overdue.</p>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, onClick }: { status: BillStatus; onClick: () => void }) {
  const cfg: Record<BillStatus, { label: string; className: string; icon: React.ReactNode }> = {
    paid: { label: "Paid", className: "bg-success/15 text-success border-success/30", icon: <CheckCircle2 className="h-3 w-3" /> },
    pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30", icon: <Clock className="h-3 w-3" /> },
    overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/30", icon: <AlertTriangle className="h-3 w-3" /> },
  };
  const c = cfg[status];
  return (
    <button
      onClick={onClick}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:opacity-80", c.className)}
    >
      {c.icon} {c.label}
    </button>
  );
}

/* -------------------- Scheduler / Calendar -------------------- */
function Scheduler({ bills }: { bills: Bill[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = first.getDay();

  const byDay = new Map<number, Bill[]>();
  bills.forEach((b) => {
    const arr = byDay.get(b.dueDay) ?? [];
    arr.push(b);
    byDay.set(b.dueDay, arr);
  });

  // Payment assistant: order upcoming unpaid by due day
  const dom = today.getDate();
  const upcoming = [...bills]
    .filter((b) => b.status !== "paid")
    .sort((a, b) => {
      const da = a.dueDay < dom ? a.dueDay + 31 : a.dueDay;
      const db = b.dueDay < dom ? b.dueDay + 31 : b.dueDay;
      return da - db;
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
      <div className="card-surface p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><CalIcon className="h-4 w-4 text-primary" /> {first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <span className="text-xs text-muted-foreground">Today · {dom}</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`b-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const items = byDay.get(day) ?? [];
            const isToday = day === dom;
            const total = items.reduce((s, x) => s + x.amount, 0);
            const hasOverdue = items.some((x) => x.status === "overdue");
            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-lg border p-1 flex flex-col text-left overflow-hidden text-[10px]",
                  isToday ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30",
                  items.length > 0 && "ring-1 ring-accent/40",
                  hasOverdue && "ring-1 ring-destructive/50 bg-destructive/5",
                )}
              >
                <span className={cn("font-mono", isToday ? "text-primary font-bold" : "text-muted-foreground")}>{day}</span>
                {items.length > 0 && (
                  <div className="mt-auto">
                    <div className="text-[9px] font-semibold truncate">{currency(total)}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{items.length} bill{items.length > 1 ? "s" : ""}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-surface p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Payment Assistant</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Suggested order to pay unpaid bills, prioritized by proximity to due date.</p>
        {upcoming.length === 0 ? (
          <p className="text-sm text-success flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Everything is paid.</p>
        ) : (
          <ol className="space-y-2">
            {upcoming.map((b, i) => {
              const daysAway = b.dueDay - dom;
              const urgency = b.status === "overdue" ? "Overdue" : daysAway <= 0 ? "Due today" : `In ${daysAway}d`;
              return (
                <li key={b.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                  <span className="h-7 w-7 shrink-0 rounded-full grid place-items-center text-xs font-bold" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{urgency} · {currencyPrecise(b.amount)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

/* -------------------- Savings Optimizer -------------------- */
function SavingsOptimizer({
  income,
  setIncome,
  variables,
  setVariables,
  totalBills,
  totalSubs,
  rate,
  setRate,
  potentialSavings,
}: {
  income: number;
  setIncome: (n: number) => void;
  variables: VariableExpense[];
  setVariables: (v: VariableExpense[]) => void;
  totalBills: number;
  totalSubs: number;
  rate: number;
  setRate: (n: number) => void;
  potentialSavings: number;
}) {
  const [vname, setVname] = useState("");
  const [vamt, setVamt] = useState("");
  const totalVar = variables.reduce((s, v) => s + v.amount, 0);
  const leftover = income - totalBills - totalVar - totalSubs;
  const suggestedRate = income > 0 ? Math.max(0, Math.min(50, Math.round((leftover / income) * 100))) : 0;

  const add = () => {
    const a = parseFloat(vamt);
    if (!vname.trim() || !Number.isFinite(a) || a <= 0) return;
    setVariables([...variables, { id: uid(), name: vname.trim(), amount: a }]);
    setVname("");
    setVamt("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card-surface p-5 space-y-4">
        <h2 className="font-semibold">Monthly income & variables</h2>
        <div>
          <Label className="text-xs">Monthly income (after tax)</Label>
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
            className="text-lg font-display"
          />
        </div>

        <div>
          <Label className="text-xs mb-2 block">Variable expenses</Label>
          <ul className="space-y-2 mb-3 max-h-64 overflow-auto pr-1">
            {variables.map((v) => (
              <li key={v.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center rounded-lg bg-secondary/60 px-3 py-2">
                <span className="truncate text-sm">{v.name}</span>
                <span className="text-sm font-mono text-muted-foreground">{currencyPrecise(v.amount)}</span>
                <button onClick={() => setVariables(variables.filter((x) => x.id !== v.id))} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-[1fr_100px_auto] gap-2">
            <Input value={vname} onChange={(e) => setVname(e.target.value)} placeholder="Groceries" />
            <Input type="number" value={vamt} onChange={(e) => setVamt(e.target.value)} placeholder="0" />
            <Button onClick={add} size="icon" variant="secondary"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="card-surface p-5 space-y-5">
        <div>
          <h2 className="font-semibold">Suggested savings rate</h2>
          <p className="text-xs text-muted-foreground mt-1">Based on what's left after bills, variables and subscriptions.</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--gradient-primary)" }}>
          <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Suggested rate</p>
          <p className="text-5xl font-bold font-display text-primary-foreground mt-1">{suggestedRate}<span className="text-2xl">%</span></p>
          <p className="text-xs text-primary-foreground/80 mt-1">≈ {currency((income * suggestedRate) / 100)} / month</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Your target rate</Label>
            <span className="text-sm font-mono">{rate}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={rate}
            onChange={(e) => setRate(parseInt(e.target.value, 10))}
            className="w-full accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Bills" value={currency(totalBills)} />
          <Stat label="Variables" value={currency(totalVar)} />
          <Stat label="Subscriptions" value={currency(totalSubs)} />
          <Stat label="Leftover" value={currency(leftover)} tone={leftover >= 0 ? "success" : "destructive"} />
        </div>

        {potentialSavings > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <p className="text-sm">
              Cancelling flagged subscriptions frees up <span className="font-bold text-primary">{currencyPrecise(potentialSavings)}</span> / month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-mono font-semibold", tone === "success" && "text-success", tone === "destructive" && "text-destructive")}>{value}</p>
    </div>
  );
}

/* -------------------- Insights -------------------- */
function Insights({ subs, setSubs }: { subs: Subscription[]; setSubs: (s: Subscription[]) => void }) {
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const total = subs.reduce((s, x) => s + x.amount, 0);
  const flagged = subs.filter((s) => s.analyze).reduce((s, x) => s + x.amount, 0);

  const add = () => {
    const a = parseFloat(amt);
    if (!name.trim() || !Number.isFinite(a) || a <= 0) return;
    setSubs([...subs, { id: uid(), name: name.trim(), amount: a, analyze: false }]);
    setName("");
    setAmt("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Subscriptions & variable charges</h2>
            <p className="text-xs text-muted-foreground">Toggle <span className="text-primary font-semibold">Analyze</span> to simulate cancellation.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="font-mono font-semibold">{currencyPrecise(total)}</p>
          </div>
        </div>
        {subs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No subscriptions logged.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {subs.map((s) => (
              <li key={s.id} className="py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {s.name}
                    {s.analyze && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">flagged</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currencyPrecise(s.amount)} / mo · {currency(s.amount * 12)} / yr
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={s.analyze}
                    onCheckedChange={(v) => setSubs(subs.map((x) => (x.id === s.id ? { ...x, analyze: v } : x)))}
                  />
                  <button onClick={() => setSubs(subs.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <div className="card-surface p-5">
          <h2 className="font-semibold mb-3">Add subscription</h2>
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Streaming service" />
            <Input type="number" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Monthly amount" />
            <Button onClick={add} className="w-full" variant="secondary"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </div>

        <div className="card-surface p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">If you cancel flagged</p>
            <p className="text-3xl font-bold font-display mt-1">{currency(flagged)}<span className="text-sm text-muted-foreground"> /mo</span></p>
            <p className="text-sm text-primary mt-1">{currency(flagged * 12)} saved per year</p>
          </div>
        </div>
      </div>
    </div>
  );
}
