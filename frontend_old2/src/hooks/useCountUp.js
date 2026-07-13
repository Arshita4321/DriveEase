import { useEffect, useRef, useState } from 'react';

/** Animates a number from 0 to `target` whenever `target` changes. */
export default function useCountUp(target = 0, duration = 1200) {
  const [value, setValue] = useState(0);
  const frame = useRef();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}
