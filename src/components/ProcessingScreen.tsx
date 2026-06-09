import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Cpu, Database, TrendingUp, BarChart3, LayoutDashboard, Tags, FileText } from 'lucide-react';

interface LogEntry {
  id: number;
  message: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'complete';
}

const LOGS: { message: string; icon: React.ReactNode }[] = [
  { message: 'Validating uploaded file structure...', icon: <Database className="w-4 h-4" /> },
  { message: 'Checking required columns and rows...', icon: <Cpu className="w-4 h-4" /> },
  { message: 'Standardizing all amounts to INR...', icon: <Tags className="w-4 h-4" /> },
  { message: 'Detecting duplicates and data quality issues...', icon: <TrendingUp className="w-4 h-4" /> },
  { message: 'Generating analytics and insights...', icon: <FileText className="w-4 h-4" /> },
  { message: 'Analytics generated successfully...', icon: <BarChart3 className="w-4 h-4" /> },
  { message: 'Dashboard ready', icon: <LayoutDashboard className="w-4 h-4" /> },
];

interface ProcessingScreenProps {
  onComplete: () => void;
}

export default function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= LOGS.length) {
      setTimeout(onComplete, 800);
      return;
    }

    const currentLog = LOGS[currentIndex];
    setDisplayedText('');
    setIsTyping(true);

    // Typewriter effect
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= currentLog.message.length) {
        setDisplayedText(currentLog.message.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // Mark as complete and move to next
        setTimeout(() => {
          setLogs(prev =>
            prev.map((log, i) =>
              i === currentIndex ? { ...log, status: 'complete' as const } : log
            )
          );

          setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
          }, 400);
        }, 300);
      }
    }, 30);

    // Add the log entry
    setLogs(prev => [
      ...prev,
      {
        id: currentIndex,
        message: currentLog.message,
        icon: currentLog.icon,
        status: 'processing',
      },
    ]);

    return () => clearInterval(typeInterval);
  }, [currentIndex, onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, displayedText]);

  const progress = ((currentIndex) / LOGS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#1a1a1a] z-50">
        <motion.div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #c4ff00, #00e5ff)',
            boxShadow: '0 0 20px rgba(196, 255, 0, 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* AI Core visual */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#c4ff00]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              borderTopColor: '#c4ff00',
              borderRightColor: 'transparent',
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-[#00e5ff]/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{
              borderBottomColor: '#00e5ff',
              borderLeftColor: 'transparent',
            }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-[#6366f1]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Cpu className="w-8 h-8 text-[#c4ff00]" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="font-heading text-3xl sm:text-4xl text-white mb-2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Processing Your Data
      </motion.h2>
      <motion.p
        className="font-mono-data text-sm text-slate-300 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Cloud Expense Tracker is validating and standardizing your expense data
      </motion.p>

      {/* Terminal logs */}
      <motion.div
        ref={containerRef}
        className="w-full max-w-xl glass-card rounded-xl p-6 max-h-[400px] overflow-y-auto hide-scrollbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="font-mono-data text-xs text-slate-300 ml-2">processing.log</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-[#6366f1] font-mono-data text-xs">
                  [{String(i + 1).padStart(2, '0')}]
                </span>

                {log.status === 'complete' ? (
                  <Check className="w-4 h-4 text-[#c4ff00] shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#00e5ff] animate-spin shrink-0" />
                )}

                <span className="text-[#6366f1]">{log.icon}</span>

                <span
                  className={`font-mono-data text-sm ${
                    log.status === 'complete'
                      ? 'text-slate-400'
                      : 'text-white'
                  }`}
                >
                  {i === currentIndex ? displayedText : log.message}
                  {i === currentIndex && isTyping && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-[#c4ff00] ml-0.5 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </span>

                {log.status === 'complete' && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono-data text-xs text-[#c4ff00] ml-auto"
                  >
                    DONE
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress text at bottom */}
        <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center gap-2">
          <span className="font-mono-data text-xs text-slate-300">
            {Math.round(progress)}% complete
          </span>
        </div>
      </motion.div>


    </div>
  );
}
