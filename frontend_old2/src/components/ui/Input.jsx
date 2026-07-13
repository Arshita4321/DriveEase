import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, containerClassName, ...props },
  ref
) {
  return (
    <label className={clsx('block', containerClassName)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">
          {label}
        </span>
      )}
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm text-primary-950 placeholder:text-primary-300 outline-none transition-all',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-primary-800',
            error ? 'border-red-400' : 'border-primary-100 dark:border-white/10',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
});

export default Input;
