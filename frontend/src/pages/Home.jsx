import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    FiArrowRight,
    FiCalendar,
    FiClock,
    FiMapPin,
    FiSearch,
    FiShield,
    FiStar,
    FiThumbsUp,
    FiTruck,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import RecentlyViewed from '../components/RecentlyViewed';
import AnimatedCityMap from '../components/ui/AnimatedCityMap';
import AnimatedGradientText from '../components/ui/AnimatedGradientText';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FloatingOrbs from '../components/ui/FloatingOrbs';
import MarqueeBanner from '../components/ui/MarqueeBanner';
import MorphingBlob from '../components/ui/MorphingBlob';
import ParticleField from '../components/ui/ParticleField';
import Rating from '../components/ui/Rating';
import RouteLine from '../components/ui/RouteLine';
import Select from '../components/ui/Select';
import { VehicleCardSkeleton } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import TestimonialCarousel from '../components/ui/TestimonialCarousel';
import VehicleCard from '../components/VehicleCard';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import api from '../services/api';

const testimonials = [
  { name: 'Aditi Sharma', role: 'Frequent renter, Bengaluru', text: 'Booking took under two minutes and the car was spotless. The real-time availability check saved me from a wasted trip.', rating: 5 },
  { name: 'Rohan Mehta', role: 'Weekend rider, Pune', text: 'I compare three bikes side by side before every trip now. Pricing is transparent — no surprise fees at pickup.', rating: 5 },
  { name: 'Sana Kapoor', role: 'Business traveller, Delhi', text: 'The support chatbot answered my cancellation question instantly. Refund landed the same day.', rating: 4 },
];

const steps = [
  { title: 'Search & compare', text: 'Filter by type, price, and location, then compare your shortlist side by side.', icon: FiSearch, color: 'from-primary-500 to-purple-600' },
  { title: 'Pick your dates', text: 'See live availability instantly — no back-and-forth, no double bookings.', icon: FiCalendar, color: 'from-cyan-500 to-blue-600' },
  { title: 'Drive away', text: 'Pay securely, get instant confirmation, and pick up your vehicle.', icon: FiTruck, color: 'from-emerald-500 to-teal-600' },
];

const features = [
  { icon: FiShield, title: 'Verified vehicles', desc: 'Every car inspected & sanitized before handoff', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: FiClock, title: 'Instant confirmation', desc: 'Real-time availability — book in under 60 seconds', color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { icon: FiThumbsUp, title: 'Free cancellation', desc: 'Change plans? Cancel up to 24hrs before pickup', color: 'text-accent-orange', bg: 'bg-orange-500/10' },
  { icon: FiStar, title: 'Top-rated hosts', desc: '4.8★ average from 12,000+ happy renters', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: FiMapPin, title: '24+ cities', desc: 'Available across major Indian cities & airports', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: FiTruck, title: 'Doorstep delivery', desc: 'Vehicle delivered to your location on request', color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const topCities = [
  { city: 'Delhi NCR', vehicles: 85, color: 'bg-primary-500' },
  { city: 'Mumbai', vehicles: 120, color: 'bg-cyan-500' },
  { city: 'Bengaluru', vehicles: 95, color: 'bg-emerald-500' },
  { city: 'Hyderabad', vehicles: 55, color: 'bg-violet-500' },
  { city: 'Pune', vehicles: 45, color: 'bg-amber-500' },
];

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();
  const { recent } = useRecentlyViewed();

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
      <section className="relative overflow-hidden">
        <FloatingOrbs />
        <ParticleField count={40} color="rgba(91,84,240,0.25)" />

        <div className="container-px relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 pb-16 pt-14 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-200"
            >
              <FiStar className="fill-amber-400 text-amber-400" size={12} /> Rated 4.8/5 by 12,000+ renters
            </motion.span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-primary-950 dark:text-white sm:text-5xl lg:text-6xl">
              Every road starts with{' '}
              <AnimatedGradientText>the right ride.</AnimatedGradientText>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 max-w-md text-base text-primary-500 dark:text-slate-400"
            >
              Rent premium cars and bikes in minutes. Transparent pricing, instant confirmation,
              and a support team that actually answers.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass mt-8 flex flex-col gap-2 rounded-2xl p-2.5 shadow-card"
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
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                containerClassName="sm:w-32"
                className="rounded-xl bg-white/70 px-3 hover:bg-white dark:bg-white/5 dark:hover:bg-white/[0.08]"
              >
                <option value="">Any type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </Select>
              <Button type="submit" variant="primary" icon={FiSearch} className="justify-center">
                Search
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary-500 dark:text-slate-400"
            >
              <span className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Verified vehicles</span>
              <span className="flex items-center gap-1.5"><FiClock className="text-primary-500" /> Instant confirmation</span>
              <span className="flex items-center gap-1.5"><FiThumbsUp className="text-accent-orange" /> Free cancellation</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md animate-float">
              <div className="glass-strong rounded-3xl p-6 shadow-2xl animate-pulse-glow">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e66927b70?q=80&w=900&auto=format&fit=crop"
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

      {/* Brand marquee */}
      <section className="container-px mx-auto mt-16 max-w-7xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary-400 dark:text-slate-500"
        >
          Trusted brands on our platform
        </motion.p>
        <MarqueeBanner />
      </section>

      {/* Featured vehicles */}
      <section className="container-px mx-auto mt-20 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-accent-cyan">Top rated</p>
            <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
              Featured vehicles
            </h2>
          </div>
          <Link to="/vehicles" className="hidden items-center gap-1 text-sm font-semibold text-primary-600 hover:gap-2 dark:text-primary-300 sm:flex transition-all">
            View all <FiArrowRight />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((v, i) => <VehicleCard key={v._id} vehicle={v} index={i} />)}
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Button as={Link} to="/vehicles" variant="secondary" iconRight={FiArrowRight}>View all vehicles</Button>
        </div>
      </section>

      <RecentlyViewed vehicles={recent} />

      {/* Why choose us - Feature grid */}
      <section className="container-px mx-auto mt-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold text-accent-cyan">Why DriveEase</p>
          <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
            Everything you need on the road
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="card-surface flex items-start gap-4 rounded-2xl p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary-950 dark:text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
            >
              <Card hover className="relative h-full overflow-hidden text-center">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                  <s.icon size={22} />
                </div>
                <div className="absolute -right-4 -top-4 font-display text-7xl font-black text-primary-100/50 dark:text-white/[0.03]">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display font-semibold text-primary-950 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-primary-500 dark:text-slate-400">{s.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Cities - Interactive Map */}
      <section className="container-px mx-auto mt-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold text-accent-cyan">Pan-India presence</p>
          <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
            Available in 24+ cities
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-500 dark:text-slate-400">
            From metro hubs to tourist hotspots — hover over a city to see available vehicles.
          </p>
        </motion.div>
        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <AnimatedCityMap />
          <div className="space-y-4">
            {topCities.map((c, i) => (
              <motion.div
                key={c.city}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface flex items-center gap-4 rounded-2xl px-5 py-3"
              >
                <div className={`h-3 w-3 rounded-full ${c.color} animate-pulse`} />
                <span className="font-display font-semibold text-primary-950 dark:text-white">{c.city}</span>
                <span className="ml-auto font-mono text-sm font-bold text-primary-500 dark:text-slate-400">{c.vehicles}+</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Carousel */}
      <section className="container-px mx-auto mt-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold text-accent-cyan">Loved by renters</p>
          <h2 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">What people say</h2>
        </motion.div>
        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* CTA */}
      <section className="container-px mx-auto my-24 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-grad-primary px-8 py-14 text-center shadow-glow sm:px-16"
        >
          <MorphingBlob color="primary" className="absolute -left-20 -top-20 h-60 w-60 opacity-50" />
          <MorphingBlob color="cyan" className="absolute -right-16 -bottom-16 h-48 w-48 opacity-40" />
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-white/10"
          />
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
