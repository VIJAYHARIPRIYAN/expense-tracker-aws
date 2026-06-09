import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NeonPulseGradient from './components/NeonPulseGradient';
import HeroSection from './components/HeroSection';
import UploadZone from './components/UploadZone';
import ProcessingScreen from './components/ProcessingScreen';
import Dashboard from './components/Dashboard';
import type { AnalyticsSnapshot } from './lib/expenseAnalytics';

type AppState = 'hero' | 'upload' | 'processing' | 'dashboard';

const DEFAULT_DATA: AnalyticsSnapshot = {
  stats: {
    totalSpending: 10812,
    transactionCount: 15,
    highestCategory: 'Shopping',
    lowestCategory: 'Healthcare',
    monthlyAverage: 4580,
    savingsRate: 23.5,
  },
  transactions: [
    { id: 1, date: '2024-12-28', merchant: 'Whole Foods Market', category: 'Food', amount: 127.43, type: 'expense' },
    { id: 2, date: '2024-12-27', merchant: 'Uber Technologies', category: 'Transport', amount: 24.50, type: 'expense' },
    { id: 3, date: '2024-12-26', merchant: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, type: 'expense' },
    { id: 4, date: '2024-12-25', merchant: 'Amazon.com', category: 'Shopping', amount: 89.99, type: 'expense' },
    { id: 5, date: '2024-12-24', merchant: 'Shell Gas Station', category: 'Transport', amount: 56.00, type: 'expense' },
    { id: 6, date: '2024-12-23', merchant: 'Chipotle Mexican Grill', category: 'Food', amount: 18.75, type: 'expense' },
    { id: 7, date: '2024-12-22', merchant: 'CVS Pharmacy', category: 'Healthcare', amount: 34.20, type: 'expense' },
    { id: 8, date: '2024-12-21', merchant: 'Con Edison', category: 'Utilities', amount: 142.00, type: 'expense' },
    { id: 9, date: '2024-12-20', merchant: 'Spotify Premium', category: 'Entertainment', amount: 9.99, type: 'expense' },
    { id: 10, date: '2024-12-19', merchant: 'Target Corporation', category: 'Shopping', amount: 203.56, type: 'expense' },
    { id: 11, date: '2024-12-18', merchant: 'Blue Bottle Coffee', category: 'Food', amount: 8.50, type: 'expense' },
    { id: 12, date: '2024-12-17', merchant: 'MTA New York', category: 'Transport', amount: 33.00, type: 'expense' },
    { id: 13, date: '2024-12-16', merchant: 'Apple Store', category: 'Shopping', amount: 1299.00, type: 'expense' },
    { id: 14, date: '2024-12-15', merchant: 'Equinox Gym', category: 'Healthcare', amount: 240.00, type: 'expense' },
    { id: 15, date: '2024-12-14', merchant: 'Starbucks Coffee', category: 'Food', amount: 6.75, type: 'expense' },
  ],
  categoryData: [
    { name: 'Food', value: 2847, color: '#c4ff00', percentage: 26.34 },
    { name: 'Transport', value: 1923, color: '#00e5ff', percentage: 17.79 },
    { name: 'Shopping', value: 3156, color: '#6366f1', percentage: 29.20 },
    { name: 'Entertainment', value: 1245, color: '#f472b6', percentage: 11.52 },
    { name: 'Utilities', value: 987, color: '#fb923c', percentage: 9.13 },
    { name: 'Healthcare', value: 654, color: '#a78bfa', percentage: 6.05 },
  ],
  monthlyData: [
    { month: 'Jan', amount: 4200 },
    { month: 'Feb', amount: 3800 },
    { month: 'Mar', amount: 5100 },
    { month: 'Apr', amount: 4600 },
    { month: 'May', amount: 3900 },
    { month: 'Jun', amount: 5500 },
    { month: 'Jul', amount: 4800 },
    { month: 'Aug', amount: 5200 },
    { month: 'Sep', amount: 4400 },
    { month: 'Oct', amount: 6100 },
    { month: 'Nov', amount: 5300 },
    { month: 'Dec', amount: 5800 },
  ],
  insights: [
    'Shopping is the top expense category.',
    'Food and Transport are the next highest recurring costs.',
    'Monthly spending peaks in October and December.',
  ],
  warnings: [],
  sourceCurrency: 'INR',
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('hero');
  const [uploadedData, setUploadedData] = useState<AnalyticsSnapshot | null>(null);
  const [currency] = useState<'INR'>('INR');

  useEffect(() => {
    if (appState === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [appState]);

  const handleStartAnalysis = useCallback(() => {
    setAppState('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFileUpload = useCallback((data: AnalyticsSnapshot) => {
    setUploadedData(data);
    setAppState('processing');
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setAppState('dashboard');
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <NeonPulseGradient />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {appState === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HeroSection onStartAnalysis={handleStartAnalysis} />
            </motion.div>
          )}

          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex flex-col items-center justify-center px-4"
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-mono-data text-xs text-[#c4ff00] tracking-[0.3em] uppercase mb-4 block">
                  Data Upload
                </span>
                <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
                  Upload Your <span className="gradient-text">Expenses</span>
                </h2>
                <p className="text-slate-300 max-w-lg mx-auto">
                  Drag and drop your expense file or browse to select. We support CSV,
                  Excel, and JSON formats.
                </p>
              </motion.div>

              <UploadZone onFileUpload={handleFileUpload} />
            </motion.div>
          )}

          {appState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProcessingScreen onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {appState === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, filter: 'blur(20px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Dashboard
                data={uploadedData || DEFAULT_DATA}
                currency={currency}
                setCurrency={() => undefined}
                validationWarnings={uploadedData?.warnings || []}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
