import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const scaleSpring = useSpring(scale, { damping: 20, stiffness: 200 });

  const isHovering = useRef(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = () => {
      if (!isHovering.current) {
        isHovering.current = true;
        scale.set(2.5);
      }
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      scale.set(1);
    };

    window.addEventListener('mousemove', moveCursor);

    const observer = new MutationObserver(() => {
      const interactive = document.querySelectorAll('a, button, [data-cursor-hover], input, textarea, select, [role="button"]');
      interactive.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const initialInteractive = document.querySelectorAll('a, button, [data-cursor-hover], input, textarea, select, [role="button"]');
    initialInteractive.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, [cursorX, cursorY, scale]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: scaleSpring,
          opacity: opacity,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div
          className="w-4 h-4 rounded-full border border-[#c4ff00]"
          style={{
            boxShadow: '0 0 10px rgba(196, 255, 0, 0.4), 0 0 30px rgba(196, 255, 0, 0.1)',
          }}
        />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div
          className="w-1 h-1 rounded-full bg-[#c4ff00]"
          style={{
            boxShadow: '0 0 6px rgba(196, 255, 0, 0.8)',
          }}
        />
      </motion.div>
    </>
  );
}
