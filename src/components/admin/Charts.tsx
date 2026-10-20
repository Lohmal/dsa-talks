"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Stat = {
  questionId: string;
  text: string;
  average: number | null;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

// 5 (strongly agree) in navy through 1 (strongly disagree) in red.
const SCALE = [
  { value: 5, label: "5 · Kesinlikle katılıyorum", color: "#13224b" },
  { value: 4, label: "4 · Katılıyorum", color: "#4a64a8" },
  { value: 3, label: "3 · Kararsızım", color: "#b9c1d6" },
  { value: 2, label: "2 · Katılmıyorum", color: "#f08a95" },
  { value: 1, label: "1 · Kesinlikle katılmıyorum", color: "#d7182a" },
] as const;

const short = (text: string, max = 46) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const height = (rows: number) => Math.max(220, rows * 46 + 60);

export function AverageChart({ stats }: { stats: Stat[] }) {
  const data = stats.map((stat, index) => ({
    name: `${index + 1}. ${short(stat.text)}`,
    full: stat.text,
    average: stat.average === null ? 0 : Number(stat.average.toFixed(2)),
    count: stat.count,
  }));

  return (
    <div style={{ height: height(data.length) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#e4e8ef" />
          <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#5b6478" }} />
          <YAxis
            type="category"
            dataKey="name"
            width={270}
            tick={{ fontSize: 12, fill: "#13224b" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(19,34,75,0.04)" }}
            formatter={(value) => [`${value} / 5`, "Ortalama"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
          />
          <Bar
            dataKey="average"
            fill="#d7182a"
            radius={[0, 6, 6, 0]}
            barSize={20}
            label={{ position: "right", fontSize: 12, fontWeight: 700, fill: "#13224b" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistributionChart({ stats }: { stats: Stat[] }) {
  const data = stats.map((stat, index) => {
    const row: Record<string, string | number> = { name: `${index + 1}. ${short(stat.text)}`, full: stat.text };
    for (const { value } of SCALE) {
      row[`r${value}`] = stat.count ? Math.round((stat.distribution[value] / stat.count) * 1000) / 10 : 0;
      row[`n${value}`] = stat.distribution[value];
    }
    return row;
  });

  return (
    <div style={{ height: height(data.length) + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" stackOffset="expand" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 12, fill: "#5b6478" }} />
          <YAxis
            type="category"
            dataKey="name"
            width={270}
            tick={{ fontSize: 12, fill: "#13224b" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(19,34,75,0.04)" }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
            formatter={(value, name, item) => {
              const key = String(item.dataKey).replace("r", "n");
              return [`%${value} (${item.payload[key]} kişi)`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {SCALE.map(({ value, label, color }) => (
            <Bar key={value} dataKey={`r${value}`} name={label} stackId="a" fill={color} barSize={22} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
