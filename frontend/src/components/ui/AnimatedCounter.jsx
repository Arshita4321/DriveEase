import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const rounded = useTransform(spring, (v) => {
    if (value >= 1000) {
      return prefix + Math.round(v).toLocaleString('en-IN') + suffix;
    }
    const decimals = String(value).includes('.') ? 1 : 0;
    return prefix + v.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  return <motion.span ref={ref} className={className}>{rounded}</motion.span>;
}
