import React from 'react';
import { FiStar } from 'react-icons/fi';
import clsx from 'clsx';

export default function Rating({ value = 0, size = 14, showValue = true, count }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <FiStar
            key={n}
            size={size}
            className={clsx(
              n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-primary-200 dark:text-white/15'
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-medium text-primary-500 dark:text-slate-400">
          {value?.toFixed?.(1) ?? '0.0'} {count !== undefined && `(${count})`}
        </span>
      )}
    </span>
  );
}
