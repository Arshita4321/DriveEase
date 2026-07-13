import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiDroplet, FiMapPin, FiSettings, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import Rating from './ui/Rating';
import WishlistButton from './WishlistButton';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

export default function VehicleCard({ vehicle, index = 0 }) {
  const img = vehicle.images?.[0] || PLACEHOLDER;
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="tilt-card"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="card-surface group overflow-hidden rounded-2xl"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
      >
        <Link to={`/vehicles/${vehicle._id}`}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={img}
              alt={vehicle.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 flex gap-1.5">
              <Badge tone="primary" className="glass !bg-white/80 dark:!bg-black/40">{vehicle.type}</Badge>
              {!vehicle.isAvailable && <Badge tone="danger">Booked</Badge>}
            </div>
            <WishlistButton vehicleId={vehicle._id} className="absolute right-3 top-3" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="rounded-lg bg-black/50 px-2 py-1 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                ₹{vehicle.pricePerDay}
                <span className="font-normal text-white/70">/day</span>
              </span>
            </div>
            {/* Shine effect on hover */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                opacity: isHovered ? 0.15 : 0,
                background: `radial-gradient(circle at ${(tilt.y / 10 + 0.5) * 100}% ${(tilt.x / -10 + 0.5) * 100}%, white 0%, transparent 60%)`,
              }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-primary-950 dark:text-white line-clamp-1">
                  {vehicle.name}
                </h3>
                <p className="text-xs text-primary-400 dark:text-slate-400">{vehicle.brand} · {vehicle.year || ''}</p>
              </div>
              <Rating value={vehicle.averageRating} count={vehicle.numReviews} showValue={false} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-primary-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><FiUsers size={12} /> {vehicle.seats} seats</span>
              <span className="flex items-center gap-1"><FiSettings size={12} /> {vehicle.transmission}</span>
              <span className="flex items-center gap-1"><FiDroplet size={12} /> {vehicle.fuelType}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-primary-400 dark:text-slate-500">
              <FiMapPin size={12} /> {vehicle.location}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
