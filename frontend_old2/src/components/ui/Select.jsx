import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';

const Select = forwardRef(function Select({ label, className, children, containerClassName, ...props }, ref) {
  return (
    <label className={clsx('block', containerClassName)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">
          {label}
        </span>
      )}
      <span className="relative block">
        <select
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-xl border border-primary-100 bg-white/80 px-4 py-2.5 pr-9 text-sm text-primary-950 outline-none transition-all',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'dark:bg-white/5 dark:text-slate-100 dark:border-white/10 dark:focus:ring-primary-800',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
      </span>
    </label>
  );
});

export default Select;
