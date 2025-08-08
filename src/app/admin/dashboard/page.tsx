"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '@/components/layout/Layout'


function aggregateByDay(entries: any[], field: string) {
  return entries.reduce((acc, entry) => {
    const date = new Date(entry.started_at).toISOString().slice(0, 10);
    acc[date] = (acc[date] || 0) + (entry[field] || 0);
    return acc;
  }, {} as Record<string, number>);
}

function formatForChart(data: Record<string, number>) {
  return Object.entries(data).map(([date, value]) => ({ date, value }));
}

export default function AdminDashboardPage() {
  const [userCount, setUserCount] = useState<number>(0);
  const [logCount, setLogCount] = useState<number>(0);
  
  const [tokensPerDay, setTokensPerDay] = useState<any[]>([]);
  const [costPerDay, setCostPerDay] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const users = await supabase
        .from('vw_users')
        .select('*', { count: 'exact', head: true });
      setUserCount(users.count || 0);

      const logs = await supabase
        .from('agent_logs')
        .select('*', { count: 'exact', head: true });
      setLogCount(logs.count || 0);
      
    

      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const usage = await supabase
        .from('agent_logs')
        .select('started_at, token_usage, cost_eur')
        .gte('started_at', fromDate)
        .order('started_at');

      if (usage.data) {
        setTokensPerDay(formatForChart(aggregateByDay(usage.data, 'token_usage')));
        setCostPerDay(formatForChart(aggregateByDay(usage.data, 'cost_eur')));
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold">Totaal gebruikers</h2>
          <p className="text-3xl">{userCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold">Totaal prompts</h2>
          <p className="text-3xl">{logCount}</p>
        </CardContent>
      </Card>
     

      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Tokens per dag</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tokensPerDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Kosten per dag (EUR)</h2>
          <ResponsiveContainer width="100%" height={300}>
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
    </Layout>
  );
}
