import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { formatInr } from '../lib/expenseAnalytics';

interface Transaction {
  id: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
}

interface ExpenseTableProps {
  transactions: Transaction[];
  currency: 'USD' | 'INR';
}

const PAGE_SIZE = 7;

export default function ExpenseTable({ transactions, currency: _currency }: ExpenseTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, [transactions]);

  const filtered = useMemo(() => {
    let data = [...transactions];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(t =>
        t.merchant.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s)
      );
    }
    if (filterCategory !== 'All') {
      data = data.filter(t => t.category === filterCategory);
    }
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return data;
  }, [transactions, search, sortField, sortDir, filterCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const categoryColors: Record<string, string> = {
    Food: '#c4ff00',
    Transport: '#00e5ff',
    Shopping: '#6366f1',
    Entertainment: '#f472b6',
    Utilities: '#fb923c',
    Healthcare: '#a78bfa',
  };

  const getCategoryColor = (cat: string) => {
    if (categoryColors[cat]) return categoryColors[cat];
    const list = ['#c4ff00', '#00e5ff', '#6366f1', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#f87171', '#fbbf24'];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % list.length;
    return list[idx];
  };

  return (
    <motion.div
      className="glass-card rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl text-white font-semibold">Recent Transactions</h3>
            <p className="font-mono-data text-xs text-slate-300">{filtered.length} entries</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 pr-4 py-2 bg-[#1a1a1a] rounded-lg font-mono-data text-xs text-white placeholder:text-slate-400/50 border border-[#111] focus:border-[#c4ff00]/30 focus:outline-none transition-colors w-56"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                className="pl-9 pr-6 py-2 bg-[#1a1a1a] rounded-lg font-mono-data text-xs text-white border border-[#111] focus:border-[#c4ff00]/30 focus:outline-none appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {[
                { key: 'date' as const, label: 'Date' },
                { key: 'merchant' as const, label: 'Merchant' },
                { key: 'category' as const, label: 'Category' },
                { key: 'amount' as const, label: 'Amount' },
              ].map(col => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-data text-[11px] text-slate-200 uppercase tracking-widest font-semibold group-hover:text-[#c4ff00] transition-colors">
                      {col.label}
                    </span>
                    <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-[#c4ff00] transition-colors" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {pageData.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="border-b border-[#1a1a1a]/50 hover:bg-white/[0.02] transition-colors group/row"
                >
                  <td className="px-6 py-3">
                    <span className="font-mono-data text-xs text-slate-300">{tx.date}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-white group-hover/row:text-[#c4ff00] transition-colors">
                      {tx.merchant}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono-data text-[10px]"
                      style={{
                        backgroundColor: `${getCategoryColor(tx.category)}15`,
                        color: getCategoryColor(tx.category),
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-mono-data text-sm text-white">
                      -{formatInr(tx.amount)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[#1a1a1a] flex items-center justify-between">
        <span className="font-mono-data text-xs text-slate-300">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-lg glass-card flex items-center justify-center disabled:opacity-30 hover:border-[#c4ff00]/30 transition-colors"
            data-cursor-hover
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-lg font-mono-data text-xs flex items-center justify-center transition-colors ${
                page === i
                  ? 'bg-[#c4ff00]/20 text-[#c4ff00] border border-[#c4ff00]/30'
                  : 'glass-card text-slate-200 hover:border-[#c4ff00]/30 hover:text-white'
              }`}
              data-cursor-hover
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-8 h-8 rounded-lg glass-card flex items-center justify-center disabled:opacity-30 hover:border-[#c4ff00]/30 transition-colors"
            data-cursor-hover
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
