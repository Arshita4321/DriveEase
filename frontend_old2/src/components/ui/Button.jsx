import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const variants = {
  primary:
    'bg-grad-primary text-white shadow-glow hover:shadow-glow hover:brightness-110',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 dark:bg-white/5 dark:text-primary-200 dark:border-white/10 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-primary-700 hover:bg-primary-50 dark:text-primary-200 dark:hover:bg-white/5',
  accent:
    'bg-accent-orange text-white hover:brightness-105 shadow-[0_0_25px_-8px_rgba(251,146,60,0.7)]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline:
    'bg-transparent border border-white/30 text-white hover:bg-white/10',
};

const sizes = {
  sm: 'text-sm px-3.5 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-7 py-3.5 rounded-2xl gap-2.5',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  ...props
}) {
  return (
    <motion.div
      whileHover={disabled || loading ? {} : { y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      className="inline-block"
    >
      <Comp
        disabled={disabled || loading}
        className={clsx(
          'btn-focus-ring inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <>
            {Icon && <Icon className="shrink-0" />}
            {children}
            {IconRight && <IconRight className="shrink-0" />}
          </>
        )}
      </Comp>
    </motion.div>
  );
}
