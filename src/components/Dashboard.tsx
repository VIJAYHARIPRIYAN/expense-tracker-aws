import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import StatsCards from './StatsCards';
import Charts from './Charts';
import ExpenseTable from './ExpenseTable';
import ExpenditureOrb from './ExpenditureOrb';

interface DashboardProps {
  data: {
    stats: {
      totalSpending: number;
      transactionCount: number;
      highestCategory: string;
      monthlyAverage: number;
      savingsRate: number;
    };
    transactions: any[];
    categoryData: any[];
    monthlyData: any[];
  };
  currency: 'USD' | 'INR';
  setCurrency: (currency: 'USD' | 'INR') => void;
  validationWarnings?: string[];
}

export default function Dashboard({ data, currency, validationWarnings = [] }: DashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-5%' });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen px-4 sm:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Background blur transition overlay */}
      <motion.div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ backdropFilter: 'blur(20px)' }}
        initial={{ opacity: 1 }}
        animate={isVisible ? { opacity: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => {
          const el = document.querySelector('[data-blur-overlay]');
          if (el) el.remove();
        }}
        data-blur-overlay
      />

      {/* ExpenditureOrb background */}
      <div className="fixed right-0 top-0 w-[45%] h-full opacity-30 pointer-events-none z-[1]">
        <ExpenditureOrb />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono-data text-xs text-[#c4ff00] tracking-[0.3em] uppercase">
                Cloud Expense Tracker
              </span>
              <motion.div
                className="w-2 h-2 rounded-full bg-[#c4ff00]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-white mt-1">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-full border border-slate-800 shrink-0">
            <span className="text-[10px] font-mono-data text-slate-400 uppercase tracking-wider pl-3">Currency:</span>
            <div className="px-3 py-1 rounded-full font-mono-data text-xs bg-[#c4ff00] text-black font-semibold">
              INR (₹)
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatsCards data={data.stats} currency={currency} />
        </motion.div>

        {/* Charts */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Charts
            categoryData={data.categoryData}
            monthlyData={data.monthlyData}
            currency={currency}
          />
        </motion.div>

        {/* Expense Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <ExpenseTable transactions={data.transactions} currency={currency} />
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-20 py-12 border-t border-[#1a1a1a]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl text-white">
                Intelligence for Every Dollar.
              </h2>
              <p className="font-mono-data text-sm text-slate-300 mt-2">
                vijayharipriyan@gmail.com
              </p>
              {validationWarnings.length > 0 && (
                <p className="font-mono-data text-xs text-amber-300 mt-2 max-w-2xl">
                  Warnings: {validationWarnings.join(' • ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs text-slate-300">Powered by</span>
              <span className="font-mono-data text-xs text-[#c4ff00]">Data Engine v2.4</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
