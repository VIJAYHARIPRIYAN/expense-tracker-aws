import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { formatInr } from '../lib/expenseAnalytics';

interface ChartsProps {
  categoryData: { name: string; value: number; color: string }[];
  monthlyData: { month: string; amount: number }[];
  currency: 'USD' | 'INR';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-[#c4ff00]/20">
        <p className="font-mono-data text-xs text-slate-300">{label}</p>
        <p className="font-heading text-sm text-white">
          {formatInr(payload[0].value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Charts({ categoryData, monthlyData: _monthlyData, currency: _currency }: ChartsProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, margin: '-10%' });
  const isPieInView = useInView(pieRef, { once: true, margin: '-10%' });

  const processedCategoryData = [...categoryData]
    .sort((left, right) => right.value - left.value)
    .map((item, index) => ({
      ...item,
      color: item.color,
      percentage: categoryData.reduce((sum, current) => sum + current.value, 0) > 0
        ? (item.value / categoryData.reduce((sum, current) => sum + current.value, 0)) * 100
        : 0,
      rank: index + 1,
    }));

  const totalSpending = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        ref={pieRef}
        className="glass-card rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-heading text-xl text-white font-semibold mb-1">Spending Breakdown</h3>
        <p className="font-mono-data text-xs text-slate-300 mb-4">By category</p>
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={processedCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={isPieInView ? -270 : 90}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {processedCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-slate-300">Total Spend</p>
              <p className="font-heading text-2xl text-white font-semibold mt-2">{formatInr(totalSpending)}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
          {processedCategoryData.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="font-mono-data text-xs text-slate-300 font-medium">
                {cat.name} ({formatInr(cat.value)})
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        ref={lineRef}
        className="glass-card rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="font-heading text-xl text-white font-semibold mb-1">Monthly Trend</h3>
        <p className="font-mono-data text-xs text-slate-300 mb-4">Ranked categories</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={processedCategoryData} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              type="number"
              tick={{ fill: '#e2e8f0', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: '#1a1a1a' }}
              tickLine={false}
              tickFormatter={(v) => formatInr(v).replace(/\.00$/, '')}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e2e8f0', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[0, 12, 12, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isLineInView}
            >
              {processedCategoryData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {processedCategoryData.slice(0, 3).map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="font-mono-data text-xs text-slate-300">{entry.name}</span>
              <span className="font-mono-data text-xs text-white">{entry.percentage.toFixed(1)}% · {formatInr(entry.value)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
