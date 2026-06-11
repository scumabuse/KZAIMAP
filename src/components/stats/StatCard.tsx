import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent?: string;
  glow?: string;
  subtitle?: string;
  delay?: number;
  index?: number;
}

function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        setTimeout(() => {
          let start: number | null = null;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, delay);
      }
    }, { threshold: 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, delay]);

  return { count, ref };
}

export default function StatCard({
  label, value, icon, accent = '#4ade80', glow, subtitle, delay = 0, index = 0
}: StatCardProps) {
  const { count, ref } = useCountUp(value, 1400, delay);
  const glowColor = glow ?? accent;

  const cardVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { delay: index * 0.08, duration: 0.5 }
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "backOut" } }}
      className="stat-card"
    >
      {/* Glow orb */}
      <div
        className="stat-card-shine"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent)` }}
      />

      {/* Top-left subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          borderRadius: 'inherit',
        }}
      />

      <div className="relative z-10">
        {/* Icon + Value row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{
              background: `${accent}12`,
              color: accent,
              border: `1px solid ${accent}20`,
            }}
          >
            Live
          </motion.span>
        </div>

        {/* Big number */}
        <p
          className="text-5xl font-bold mb-1"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-1)', letterSpacing: '-0.04em' }}
        >
          {count.toLocaleString()}
        </p>

        <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-2)' }}>
          {label}
        </p>

        {subtitle && (
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}

        {/* Animated accent bar */}
        <motion.div
          className="mt-5 h-px w-full"
          style={{ background: `linear-gradient(90deg, ${accent}50, transparent)` }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.08 + 0.4, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
