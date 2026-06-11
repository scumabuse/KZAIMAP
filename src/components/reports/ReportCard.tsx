import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle, XCircle, MapPin, ShieldAlert, Cpu } from 'lucide-react';
import type { Report } from '../../types';
import Badge from '../ui/Badge';

interface ReportCardProps {
  report: Report;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'pending' | 'verified' | 'rejected') => void;
  index?: number;
}

export default function ReportCard({
  report, showActions = false, onDelete, onStatusChange, index = 0,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "backOut" } }}
      className="card flex flex-col group"
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: '200px', borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }}>
        {report.photo_url ? (
          <motion.img
            src={report.photo_url}
            alt="Свалка"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <MapPin size={32} style={{ color: 'var(--text-faint)' }} />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge variant={report.status} />
        </div>
        {report.ai_pollution_level && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant={report.ai_pollution_level} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-7 flex flex-col flex-1" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Description */}
        <p className="text-sm leading-loose line-clamp-2 flex-1 mb-4" style={{ color: 'var(--text-2)' }}>
          {report.description || (
            <span className="italic" style={{ color: 'var(--text-faint)' }}>Нет описания</span>
          )}
        </p>

        {/* AI Block */}
        {report.ai_confidence !== null && (
          <div
            className="mb-4 p-3 rounded-xl"
            style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.1)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={12} style={{ color: 'var(--green)' }} />
              <span className="label-caps text-[10px]" style={{ color: 'var(--green)' }}>AI Анализ</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="progress flex-1">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${report.ai_confidence}%` }}
                  transition={{ delay: index * 0.06 + 0.3, duration: 1, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--green)' }}>
                {report.ai_confidence}%
              </span>
            </div>
            {report.ai_hazardous && (
              <div className="flex items-center gap-1.5 mt-2">
                <ShieldAlert size={12} style={{ color: 'var(--red)' }} />
                <span className="text-[11px] font-bold" style={{ color: 'var(--red)' }}>Опасные отходы</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={11} style={{ color: 'var(--green)' }} />
            <span className="font-mono">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </span>
          </div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--text-faint)' }}>
            {format(new Date(report.created_at), 'd MMM, HH:mm', { locale: ru })}
          </p>
        </div>

        {/* Admin Actions */}
        {showActions && (
          <div className="flex gap-3 pt-5 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {report.status === 'pending' ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStatusChange?.(report.id, 'verified')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  <CheckCircle size={18} /> Одобрить
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStatusChange?.(report.id, 'rejected')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.15)' }}
                >
                  <XCircle size={18} /> Отклонить
                </motion.button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                style={{
                  background: report.status === 'verified' ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
                  color: report.status === 'verified' ? 'var(--green)' : 'var(--red)',
                  border: `1px solid ${report.status === 'verified' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}`
                }}>
                {report.status === 'verified' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {report.status === 'verified' ? 'Одобрено' : 'Отклонено'}
              </div>
            )}
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(report.id)}
              title="Удалить обращение"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
