import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Rating from './Rating';

export default function TestimonialCarousel({ testimonials }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const navigate = (dir) => {
    setDirection(dir);
    setCurrent((prev) =>
      dir === 1
        ? (prev + 1) % testimonials.length
        : (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const t = testimonials[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  };

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden">
      <div className="relative min-h-[220px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="card-surface rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center">
              <Rating value={t.rating} showValue={false} size={18} />
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-700 dark:text-slate-300 italic">
              "{t.text}"
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-grad-primary text-sm font-bold text-white shadow-glow"
              >
                {t.name[0]}
              </motion.span>
              <div className="text-left">
                <p className="text-sm font-semibold text-primary-950 dark:text-white">{t.name}</p>
                <p className="text-xs text-primary-400 dark:text-slate-500">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-primary-100 p-2 text-primary-500 transition-colors hover:bg-primary-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <FiChevronLeft size={18} />
        </button>
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className="relative h-2 overflow-hidden rounded-full transition-all"
              style={{ width: i === current ? 24 : 8 }}
            >
              <span
                className={`absolute inset-0 rounded-full ${
                  i === current ? 'bg-grad-primary' : 'bg-primary-200 dark:bg-white/20'
                }`}
              />
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate(1)}
          className="rounded-full border border-primary-100 p-2 text-primary-500 transition-colors hover:bg-primary-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
