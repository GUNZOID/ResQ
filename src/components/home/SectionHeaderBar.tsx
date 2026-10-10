import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderBarProps {
  number: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  theme: 'emerald' | 'rose' | 'blue' | 'purple';
  statusBadge: string;
  rightAction?: React.ReactNode;
}

const themeStyles = {
  emerald: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    number: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    pulse: 'bg-emerald-500',
    accentBorder: 'border-l-4 border-l-emerald-500',
  },
  rose: {
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
    number: 'text-rose-700 bg-rose-50 border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    pulse: 'bg-rose-500',
    accentBorder: 'border-l-4 border-l-rose-500',
  },
  blue: {
    bar: 'bg-blue-600',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
    number: 'text-blue-700 bg-blue-50 border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    pulse: 'bg-blue-500',
    accentBorder: 'border-l-4 border-l-blue-600',
  },
  purple: {
    bar: 'bg-purple-600',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
    number: 'text-purple-700 bg-purple-50 border-purple-200',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    pulse: 'bg-purple-500',
    accentBorder: 'border-l-4 border-l-purple-600',
  },
};

export const SectionHeaderBar: React.FC<SectionHeaderBarProps> = ({
  number,
  title,
  subtitle,
  icon: Icon,
  theme,
  statusBadge,
  rightAction,
}) => {
  const styles = themeStyles[theme];

  return (
    <div className="w-full mb-2">
      {/* Visual Section Divider Bar (Instagram-style subtle divider bar) */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className={`h-1.5 w-8 rounded-full ${styles.bar}`} />
        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          SEC {number}
        </span>
      </div>

      {/* Section Header Card / Bar */}
      <div
        className={`bg-white rounded-2xl px-3.5 py-2.5 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3 ${styles.accentBorder}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${styles.iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 tracking-tight truncate">
                {title}
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge} shrink-0 flex items-center gap-1`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${styles.pulse} animate-pulse`} />
                {statusBadge}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
          </div>
        </div>

        {rightAction && <div className="shrink-0">{rightAction}</div>}
      </div>
    </div>
  );
};
