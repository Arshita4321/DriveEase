import { motion } from 'framer-motion';

const orbs = [
  { color: 'bg-primary-500/20', size: 'h-72 w-72', pos: '-top-24 right-[-10%]', duration: 8, y: [-20, 20, -20], x: [0, 15, 0] },
  { color: 'bg-accent-cyan/15', size: 'h-56 w-56', pos: 'top-40 left-[-10%]', duration: 10, y: [15, -15, 15], x: [0, -10, 0] },
  { color: 'bg-purple-500/10', size: 'h-40 w-40', pos: 'bottom-20 right-[20%]', duration: 12, y: [-10, 25, -10], x: [0, 20, 0] },
  { color: 'bg-emerald-400/10', size: 'h-32 w-32', pos: 'top-20 left-[30%]', duration: 9, y: [10, -20, 10], x: [0, -15, 0] },
  { color: 'bg-orange-400/10', size: 'h-24 w-24', pos: 'bottom-10 left-[15%]', duration: 11, y: [-15, 10, -15], x: [0, 12, 0] },
];

export default function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} ${orb.size} ${orb.pos} blur-3xl`}
          animate={{ y: orb.y, x: orb.x }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
