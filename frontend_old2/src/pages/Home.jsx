import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiCalendar, FiArrowRight, FiShield,
  FiClock, FiThumbsUp, FiStar, FiTruck,
} from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import RouteLine from '../components/ui/RouteLine';
import VehicleCard from '../components/VehicleCard';
import { VehicleCardSkeleton } from '../components/ui/Skeleton';
import Rating from '../components/ui/Rating';

const testimonials = [
  { name: 'Aditi Sharma', role: 'Frequent renter, Bengaluru', text: 'Booking took under two minutes and the car was spotless. The real-time availability check saved me from a wasted trip.', rating: 5 },
  { name: 'Rohan Mehta', role: 'Weekend rider, Pune', text: 'I compare three bikes side by side before every trip now. Pricing is transparent — no surprise fees at pickup.', rating: 5 },
  { name: 'Sana Kapoor', role: 'Business traveller, Delhi', text: 'The support chatbot answered my cancellation question instantly. Refund landed the same day.', rating: 4 },
];

const steps = [
  { title: 'Search & compare', text: 'Filter by type, price, and location, then compare your shortlist side by side.', icon: FiSearch },
  { title: 'Pick your dates', text: 'See live availability instantly — no back-and-forth, no double bookings.', icon: FiCalendar },
  { title: 'Drive away', text: 'Pay securely, get instant confirmation, and pick up your vehicle.', icon: FiTruck },
];

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/vehicles', { params: { sort: 'rating', limit: 6, available: true } })
      .then(({ data }) => setVehicles(data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grad-radial-glow">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 left-[-10%] h-72 w-72 rounded-full bg-accent-cyan/10 blur-3xl" />

        <div className="container-px relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 pb-16 pt-14 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-200">
              <FiStar className="fill-amber-400 text-amber-400" size={12} /> Rated 4.8/5 by 12,000+ renters
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-primary-950 dark:text-white sm:text-5xl lg:text-6xl">
              Every road starts with{' '}
              <span className="text-gradient">the right ride.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-primary-500 dark:text-slate-400">
              Rent premium cars and bikes in minutes. Transparent pricing, instant confirmation,
              and a support team that actually answers.
            </p>

            <form
              onSubmit={handleSearch}
              className="glass mt-8 flex flex-col gap-2 rounded-2xl p-2.5 shadow-card sm:flex-row"
            >
              <div className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or brand"
                  className="w-full rounded-xl bg-white/70 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-primary-300 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <div className="relative sm:w-40">
                <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl bg-white/70 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-primary-300 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-xl bg-white/70 px-3 py-2.5 text-sm outline-none dark:bg-white/5 dark:text-white sm:w-32"
              >
                <option value="">Any type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
              <Button type="submit" variant="primary" icon={FiSearch} className="justify-center">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Verified vehicles</span>
              <span className="flex items-center gap-1.5"><FiClock className="text-primary-500" /> Instant confirmation</span>
              <span className="flex items-center gap-1.5"><FiThumbsUp className="text-accent-orange" /> Free cancellation</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md animate-float">
              <div className="glass-strong rounded-3xl p-6 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=900&auto=format&fit=crop"
                  alt="Featured rental car"
                  className="h-56 w-full rounded-2xl object-cover"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-primary-950 dark:text-white">BMW 3 Series</p>
                    <Rating value={4.9} count={128} />
                  </div>
                  <span className="rounded-xl bg-grad-primary px-3 py-1.5 font-mono text-sm font-bold text-white">
                    ₹3,499/day
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="glass absolute -left-8 top-8 hidden rounded-2xl p-3 shadow-xl sm:block"
              >
                <p className="text-xs text-primary-500 dark:text-slate-400">Bookings today</p>
                <p className="font-mono text-xl font-bold text-primary-900 dark:text-white">248</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="glass absolute -bottom-6 -right-4 hidden rounded-2xl p-3 shadow-xl sm:block"
              >
                <p className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <FiShield /> Verified
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <RouteLine className="h-10 opacity-70" />
      </section>

      {/* Stats */}
      <section className="container-px mx-auto -mt-6 max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={FiTruck} label="Vehicles listed" value={480} tone="primary" />
          <StatCard icon={FiThumbsUp} label="Happy renters" value={12000} tone="cyan" />
          <StatCard icon={FiMapPin} label="Cities covered" value={24} tone="orange" />
          <StatCard icon={FiStar} label="Average rating" value={4.8} tone="emerald" />
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="container-px mx-auto mt-20 max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-cyan">Top rated</p>
            <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
              Featured vehicles
            </h2>
          </div>
          <Link to="/vehicles" className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:gap-2 dark:text-primary-300 sm:flex transition-all">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((v, i) => <VehicleCard key={v._id} vehicle={v} index={i} />)}
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Button as={Link} to="/vehicles" variant="secondary" iconRight={FiArrowRight}>View all vehicles</Button>
        </div>
      </section>

      {/* How it works */}
      <section className="container-px mx-auto mt-24 max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-accent-cyan">Simple by design</p>
          <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">How DriveEase works</h2>
        </div>
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-primary text-white shadow-glow">
                  <s.icon size={22} />
                </div>
                <h3 className="mt-4 font-display font-semibold text-primary-950 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-primary-500 dark:text-slate-400">{s.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-px mx-auto mt-24 max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-accent-cyan">Loved by renters</p>
          <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">What people say</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <Rating value={t.rating} showValue={false} size={15} />
                <p className="mt-3 text-sm leading-relaxed text-primary-700 dark:text-slate-300">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-grad-primary text-xs font-bold text-white">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-primary-950 dark:text-white">{t.name}</p>
                    <p className="text-xs text-primary-400 dark:text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-px mx-auto my-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-grad-primary px-8 py-14 text-center shadow-glow sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready for your next trip?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Join thousands of renters who book their perfect car or bike in minutes.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/vehicles" variant="accent" size="lg" iconRight={FiArrowRight}>Browse vehicles</Button>
            <Button as={Link} to="/signup" variant="outline" size="lg">Create free account</Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
