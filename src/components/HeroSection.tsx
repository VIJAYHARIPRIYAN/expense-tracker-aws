import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const WORDS_HEADLINE = ['Understand', 'Your', 'Money', 'Through', 'Data'];
const WORDS_SUB = ['Upload', 'expense', 'data', 'and', 'instantly', 'generate', 'actionable', 'insights,', 'spending', 'analysis,', 'trends,', 'and', 'reports.'];

interface HeroSectionProps {
  onStartAnalysis: () => void;
}

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function HeroSection({ onStartAnalysis }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10%' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 60, rotateX: -40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: 0.3 + i * 0.12,
        duration: 0.8,
        ease: easeOut,
      },
    }),
  };

  const subWordVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2 + i * 0.04,
        duration: 0.5,
        ease: easeOut,
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-8"
    >
      {/* Floating particles overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c4ff00]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Main headline */}
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-300 tracking-tight leading-[1.05] mb-6" style={{ perspective: '1000px' }}>
          <span className="inline-flex flex-wrap justify-center gap-x-4 sm:gap-x-6">
            {WORDS_HEADLINE.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate={controls}
                className={i === 4 ? 'gradient-text font-500' : 'text-white'}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          <span className="inline-flex flex-wrap justify-center gap-x-1.5">
            {WORDS_SUB.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={subWordVariants}
                initial="hidden"
                animate={controls}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <motion.button
            onClick={onStartAnalysis}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#c4ff00] text-black font-heading font-500 text-lg rounded-full btn-glow"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span className="relative z-10">Start Analysis</span>
            <motion.span
              className="relative z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
            <div className="absolute inset-0 rounded-full bg-[#c4ff00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ filter: 'blur(20px)' }} />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[2]" />
    </section>
  );
}
