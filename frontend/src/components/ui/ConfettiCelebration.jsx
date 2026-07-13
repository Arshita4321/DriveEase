import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const COLORS = ['#5B54F0', '#9333ea', '#06B6D4', '#10b981', '#FB923C', '#f43f5e', '#eab308'];
const SHAPES = ['circle', 'square', 'triangle'];

function Particle({ id, onComplete }) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const x = Math.random() * 800 - 400;
  const y = -(Math.random() * 600 + 200);
  const rotate = Math.random() * 720 - 360;
  const scale = Math.random() * 0.6 + 0.4;
  const duration = Math.random() * 1.5 + 1.5;

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration * 1000 + 500);
    return () => clearTimeout(timer);
  }, [id, duration, onComplete]);

  return (
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
      animate={{ x, y, rotate, scale, opacity: [1, 1, 0] }}
      transition={{ duration, ease: 'easeOut' }}
      className="pointer-events-none absolute"
      style={{ left: '50%', top: '50%' }}
    >
      {shape === 'circle' && (
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
      )}
      {shape === 'square' && (
        <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
      )}
      {shape === 'triangle' && (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `10px solid ${color}`,
          }}
        />
      )}
    </motion.div>
  );
}

export default function ConfettiCelebration({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => Date.now() + i);
      setParticles((prev) => [...prev, ...newParticles]);
    }
  }, [trigger]);

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p !== id));
  };

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((id) => (
            <Particle key={id} id={id} onComplete={removeParticle} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
