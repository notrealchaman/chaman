"use client";

import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { CardHeader2 } from "@/components/dashboard/ui";

const palette = ["#22c55e", "#38bdf8", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];

export function RevenueChart({ data }: { data: { month: string; revenue: number; profit: number }[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader2 title="Revenue over time" description="Monthly revenue vs profit" />
      <div className="h-72 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#rev)" name="Revenue" />
            <Area type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={2} fill="transparent" name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SpendBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v: any) => `$${v}/mo`} />
          <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => `$${v}/mo`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniBars({ data }: { data: { name: string; orders: number; revenue: number }[] }) {
  return (
    <div className="h-64 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
          <Bar dataKey="revenue" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
