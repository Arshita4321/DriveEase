import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Card({ className, hover = false, children, glass = false, ...props }) {
  const Comp = hover ? motion.div : 'div';
  const hoverProps = hover
    ? { whileHover: { y: -6, transition: { duration: 0.25 } } }
    : {};
  return (
    <Comp
      className={clsx(
        'rounded-2xl p-6',
        glass ? 'glass' : 'card-surface',
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default Card;
