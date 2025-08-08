"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from "@/components/ui/card";
import Layout from '@/components/layout/Layout'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Types -----------------------------------------------------------------

type AgentLog = {
  started_at: string; // ISO date from Supabase
  token_usage: number | null;
  cost_eur: number | null;
};

type ChartPoint = { date: string; value: number };

// --- Helpers ----------------------------------------------------------------

function aggregateByDay(
  rows: AgentLog[],
  field: keyof Pick<AgentLog, "token_usage" | "cost_eur">
): ChartPoint[] {
  const map = new Map<string, number>();

  for (const r of rows) {
    const d = new Date(r.started_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);

    const increment = (r[field] ?? 0) as number;
    map.set(key, (map.get(key) ?? 0) + increment);
  }

  return Array.from(map, ([date, value]) => ({ date, value })).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
}

// --- Page -------------------------------------------------------------------

export default function AdminDashboardPage() {
  //const supabase = createClient();

  const [userCount, setUserCount] = useState<number>(0);
  const [logCount, setLogCount] = useState<number>(0);

  const [tokensPerDay, setTokensPerDay] = useState<ChartPoint[]>([]);
  const [costPerDay, setCostPerDay] = useState<ChartPoint[]>([]);

  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  // nieuw: periode selectie (dagen)
  const [rangeDays, setRangeDays] = useState<number>(30);

  // helper voor export
  const downloadCSV = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    // exporteer geaggregeerde data als 2 tabbladen-achtig CSV
    const header1 = 'date,tokens';
    const body1 = tokensPerDay.map(p => `${p.date},${p.value}`).join('');
    const header2 = 'date,cost_eur';
    const body2 = costPerDay.map(p => `${p.date},${p.value}`).join('');
    const csv = [`# Tokens per day`, header1, body1, '', `# Cost per day`, header2, body2].join('');
    downloadCSV(`admin-metrics-${rangeDays}d.csv`, csv);
  };

  useEffect(() => {
    const fromDateISO = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();

    const run = async () => {
      // 1) Users (let op: dit werkt alleen als je een view of policy hebt)
      const usersRes = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      setUserCount(usersRes.count ?? 0);

      // 2) Logs count
      const logsHead = await supabase
        .from('agent_logs')
        .select('*', { count: 'exact', head: true });
      setLogCount(logsHead.count ?? 0);

      // 3/4) Usage & costs per dag + totalen
      const usage = await supabase
        .from<AgentLog>('agent_logs')
        .select('started_at, token_usage, cost_eur')
        .gte('started_at', fromDateISO);

      const rows = usage.data ?? [];

      setTokensPerDay(aggregateByDay(rows, 'token_usage'));
      setCostPerDay(aggregateByDay(rows, 'cost_eur'));

      // totalen
      const tokens = rows.reduce((acc, r) => acc + (r.token_usage ?? 0), 0);
      const cost = rows.reduce((acc, r) => acc + (r.cost_eur ?? 0), 0);
      setTotalTokens(tokens);
      setTotalCost(cost);
    };

    run();
  }, [supabase, rangeDays]);

  return (
  <Layout>
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Controls */}
      <div className="md:col-span-4 flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Periode:</label>
          <select
            className="border rounded-md px-2 py-1"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
          >
            <option value={7}>7 dagen</option>
            <option value={30}>30 dagen</option>
            <option value={90}>90 dagen</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="ml-auto inline-flex items-center rounded-md border px-3 py-1.5 text-sm bg-white hover:bg-zinc-50"
        >
          Export CSV
        </button>
      </div>

      <Card className="md:col-span-1">
        <CardContent>
          <h2 className="text-xl font-semibold">Totaal gebruikers</h2>
          <p className="text-3xl">{userCount}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardContent>
          <h2 className="text-xl font-semibold">Totaal prompts</h2>
          <p className="text-3xl">{logCount}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardContent>
          <h2 className="text-xl font-semibold">Totaal tokens ({rangeDays}d)</h2>
          <p className="text-3xl">{totalTokens.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardContent>
          <h2 className="text-xl font-semibold">Totale kosten ({rangeDays}d)</h2>
          <p className="text-3xl">€ {totalCost.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Grafieken: elk 2 kolommen breed op md+ */}
    <div className="col-span-1 md:col-span-2">
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Tokens per dag</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={tokensPerDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="col-span-1 md:col-span-2">
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Kosten per dag (EUR)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={costPerDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
    </Layout>
  );
}
