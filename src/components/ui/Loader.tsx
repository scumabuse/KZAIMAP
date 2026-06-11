import { motion } from 'framer-motion';

export default function Loader({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="3" />
          <motion.circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="var(--green)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 20 * 0.3} ${2 * Math.PI * 20 * 0.7}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.6))' }}
          />
        </svg>
      </motion.div>

      {text && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[13px] font-semibold tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
