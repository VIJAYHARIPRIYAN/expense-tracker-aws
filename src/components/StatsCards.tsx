import { useState, useRef, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { IndianRupee, Receipt, TrendingUp, PiggyBank } from 'lucide-react';

interface StatsCardsProps {
  data: {
    totalSpending: number;
    transactionCount: number;
    highestCategory: string;
    monthlyAverage: number;
    savingsRate: number;
  };
  currency: 'USD' | 'INR';
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  delay: number;
  color: string;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN', {
        maximumFractionDigits: value % 1 === 0 ? 0 : 1,
        minimumFractionDigits: 0,
        useGrouping: true,
      })}
      {suffix}
    </span>
  );
}

function StatCard({ title, value, subtitle, icon, delay, color }: StatCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative glass-card glass-card-hover rounded-xl p-6 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0.5, y: 0.5 })}
      style={{
        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(196, 255, 0, 0.05) 0%, transparent 60%)`,
      }}
    >
      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${color}15 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <h3 className="font-mono-data text-xs text-slate-200 uppercase tracking-widest font-semibold mb-2">
          {title}
        </h3>
        <div className="font-heading text-3xl sm:text-4xl text-white font-bold tracking-tight mb-2">
          {value}
        </div>
        <p className="font-mono-data text-[11px] text-slate-300 font-medium">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default function StatsCards({ data, currency: _currency }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Spending',
      value: <AnimatedNumber value={data.totalSpending} prefix="₹" />,
      subtitle: 'All time expenses',
      icon: <IndianRupee className="w-5 h-5" />,
      color: '#c4ff00',
      delay: 0.1,
    },
    {
      title: 'Transactions',
      value: <AnimatedNumber value={data.transactionCount} />,
      subtitle: 'Total processed',
      icon: <Receipt className="w-5 h-5" />,
      color: '#00e5ff',
      delay: 0.2,
    },
    {
      title: 'Top Category',
      value: data.highestCategory,
      subtitle: 'Highest spend area',
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#6366f1',
      delay: 0.3,
    },
    {
      title: 'Monthly Average',
      value: <AnimatedNumber value={data.monthlyAverage} prefix="₹" />,
      subtitle: 'Per month spend',
      icon: <IndianRupee className="w-5 h-5" />,
      color: '#c4ff00',
      delay: 0.4,
    },
    {
      title: 'Savings Rate',
      value: <AnimatedNumber value={data.savingsRate} suffix="%" />,
      subtitle: 'Of total income',
      icon: <PiggyBank className="w-5 h-5" />,
      color: '#00e5ff',
      delay: 0.5,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          delay={stat.delay}
          color={stat.color}
        />
      ))}
    </div>
  );
}
