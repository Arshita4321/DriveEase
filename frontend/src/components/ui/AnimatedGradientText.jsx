
const gradients = [
  'from-primary-500 via-purple-500 to-cyan-400',
  'from-cyan-400 via-emerald-400 to-primary-500',
  'from-orange-400 via-pink-500 to-primary-500',
  'from-primary-500 via-purple-500 to-cyan-400',
];

export default function AnimatedGradientText({ children, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="animate-gradient-text bg-clip-text text-transparent bg-[length:300%_100%] bg-gradient-to-r from-primary-500 via-purple-500 to-cyan-400">
        {children}
      </span>
    </span>
  );
}
