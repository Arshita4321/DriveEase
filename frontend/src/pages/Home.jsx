import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
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
import AITripRecommender from '../components/AITripRecommender';
import RecentlyViewed from '../components/RecentlyViewed';
import AnimatedCityMap from '../components/ui/AnimatedCityMap';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MarqueeBanner from '../components/ui/MarqueeBanner';
import Rating from '../components/ui/Rating';
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
  { title: 'Search & compare', text: 'Filter by type, price, and location, then compare your shortlist side by side.', icon: FiSearch, color: 'bg-primary-500' },
  { title: 'Pick your dates', text: 'See live availability instantly — no back-and-forth, no double bookings.', icon: FiCalendar, color: 'bg-accent-cyan' },
  { title: 'Drive away', text: 'Pay securely, get instant confirmation, and pick up your vehicle.', icon: FiTruck, color: 'bg-primary-700' },
];

const features = [
  { icon: FiShield, title: 'Verified vehicles', desc: 'Every car inspected & sanitized before handoff', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: FiClock, title: 'Instant confirmation', desc: 'Real-time availability — book in under 60 seconds', color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { icon: FiThumbsUp, title: 'Free cancellation', desc: 'Change plans? Cancel up to 24hrs before pickup', color: 'text-accent-orange', bg: 'bg-orange-500/10' },
  { icon: FiStar, title: 'Top-rated hosts', desc: '4.8★ average from 12,000+ happy renters', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: FiMapPin, title: '24+ cities', desc: 'Available across major Indian cities & airports', color: 'text-accent-cyan', bg: 'bg-cyan-500/10' },
  { icon: FiTruck, title: 'Doorstep delivery', desc: 'Vehicle delivered to your location on request', color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const topCities = [
  { city: 'Delhi NCR', vehicles: 85, color: 'bg-primary-500' },
  { city: 'Mumbai', vehicles: 120, color: 'bg-accent-cyan' },
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

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark selection:bg-primary-500/30">
      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container-px relative mx-auto w-full max-w-7xl"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/50 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-primary-200"
            >
              <span className="flex h-2 w-2 rounded-full bg-accent-cyan animate-pulse"></span>
              The modern way to rent vehicles
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="font-display text-5xl font-extrabold tracking-tight text-primary-950 dark:text-white sm:text-6xl lg:text-7xl"
            >
              Every road starts with <br className="hidden sm:block" />
              <span className="text-primary-500">the right ride.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg text-primary-600 dark:text-slate-400 sm:text-xl"
            >
              Rent premium cars and bikes in minutes. Transparent pricing, instant confirmation,
              and a support team that actually answers.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mx-auto mt-10 flex w-full max-w-3xl flex-col items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-xl backdrop-blur-xl dark:bg-white/5 dark:shadow-card-dark sm:flex-row sm:rounded-full sm:p-2"
            >
              <div className="relative w-full flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand or model..."
                  className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm font-medium outline-none placeholder:text-primary-400 dark:text-white dark:placeholder:text-slate-500 sm:rounded-full"
                />
              </div>
              <div className="h-[1px] w-full bg-primary-200 dark:bg-white/10 sm:h-8 sm:w-[1px]" />
              <div className="relative w-full sm:w-48">
                <FiMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm font-medium outline-none placeholder:text-primary-400 dark:text-white dark:placeholder:text-slate-500 sm:rounded-full"
                />
              </div>
              <div className="h-[1px] w-full bg-primary-200 dark:bg-white/10 sm:h-8 sm:w-[1px]" />
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                containerClassName="w-full sm:w-36"
                className="rounded-xl border-none bg-transparent py-3 pl-3 pr-8 text-sm font-medium focus:ring-0 sm:rounded-full"
              >
                <option value="">Any type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </Select>
              <Button type="submit" variant="primary" className="w-full justify-center sm:w-auto sm:rounded-full sm:px-8">
                Search
              </Button>
            </motion.form>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container-px relative z-10 mx-auto -mt-10 max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={FiTruck} label="Vehicles listed" value={480} tone="primary" />
          <StatCard icon={FiThumbsUp} label="Happy renters" value={12000} tone="cyan" />
          <StatCard icon={FiMapPin} label="Cities covered" value={24} tone="orange" />
          <StatCard icon={FiStar} label="Average rating" value={4.8} tone="emerald" />
        </div>
      </section>

      {/* Brand marquee */}
      <section className="container-px mx-auto mt-20 max-w-7xl">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-primary-400 dark:text-slate-500">
          Trusted brands on our platform
        </p>
        <MarqueeBanner />
      </section>

      {/* Featured vehicles */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
              Featured vehicles
            </h2>
            <p className="mt-2 text-primary-600 dark:text-slate-400">Hand-picked premium rides for your next journey.</p>
          </div>
          <Link to="/vehicles" className="group flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
            View all collection 
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((v, i) => (
                <motion.div key={v._id} variants={itemVariants}>
                  <VehicleCard vehicle={v} index={i} />
                </motion.div>
              ))}
        </motion.div>
        
        <div className="mt-10 flex justify-center sm:hidden">
          <Button as={Link} to="/vehicles" variant="secondary" className="w-full justify-center">View all collection</Button>
        </div>
      </section>

      <RecentlyViewed vehicles={recent} />

      {/* Bento Grid - Why choose us */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
            Everything you need on the road
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-600 dark:text-slate-400">
            We've thought of everything so you can focus on the journey. Experience hassle-free rentals from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
          {/* Large Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl bg-primary-50 p-8 dark:bg-white/[0.03] md:col-span-2"
          >
            <div className="relative z-10 max-w-md">
              <div className="mb-4 inline-flex items-center rounded-xl bg-primary-100 p-2.5 dark:bg-white/10">
                <FiClock className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary-950 dark:text-white">Instant confirmation</h3>
              <p className="mt-3 text-primary-700 dark:text-slate-400">
                Skip the waiting. Our real-time availability system ensures that what you see is what you get. Book your vehicle and receive immediate confirmation in under 60 seconds.
              </p>
            </div>
            <div className="absolute -bottom-24 -right-12 h-64 w-64 rounded-full bg-grad-primary opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
          </motion.div>

          {/* Regular Features */}
          {features.filter(f => f.title !== 'Instant confirmation').slice(0, 4).map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface group relative overflow-hidden rounded-3xl p-8 transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-card-dark"
            >
              <div className={`mb-4 inline-flex items-center rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110 ${f.bg}`}>
                <f.icon size={24} className={f.color} />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-950 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-600 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="mb-16 grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
              Simple by design
            </h2>
            <p className="mt-4 text-primary-600 dark:text-slate-400">
              Three simple steps to get you on the road. We've removed all the friction from the rental process.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/5">
                <s.icon size={24} className="text-primary-950 dark:text-white" />
              </div>
              <div className="absolute right-0 top-0 font-display text-8xl font-black text-primary-50 dark:text-white/[0.02]">
                {i + 1}
              </div>
              <h3 className="relative z-10 font-display text-xl font-bold text-primary-950 dark:text-white">{s.title}</h3>
              <p className="relative z-10 mt-2 leading-relaxed text-primary-600 dark:text-slate-400">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Cities - Interactive Map */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
              Available in 24+ cities
            </h2>
            <p className="mt-4 text-primary-600 dark:text-slate-400">
              From bustling metro hubs to serene tourist hotspots. Wherever your journey takes you, we're already there.
            </p>
            
            <div className="mt-8 space-y-3">
              {topCities.map((c, i) => (
                <div key={c.city} className="flex items-center justify-between rounded-xl border border-primary-100 bg-white p-4 transition-colors hover:border-primary-300 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/20">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                    <span className="font-display font-medium text-primary-950 dark:text-white">{c.city}</span>
                  </div>
                  <span className="text-sm font-medium text-primary-500 dark:text-slate-400">{c.vehicles}+ vehicles</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-primary-50 p-6 dark:bg-white/[0.02] sm:p-10"
          >
            <AnimatedCityMap />
          </motion.div>
        </div>
      </section>

      {/* AI Trip Recommender (Kept functional, styling refined) */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-primary-950 dark:bg-[#0A0B14]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 sm:p-16">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Not sure what to drive?
              </h2>
              <p className="mt-4 text-lg text-primary-200">
                Tell us about your trip — terrain, group size, budget — and our intelligent system will recommend the perfect vehicle in seconds.
              </p>
              <div className="mt-12 hidden lg:block">
                 {/* Visual decoration for AI section */}
                 <div className="grid grid-cols-2 gap-4 opacity-70">
                    <div className="h-24 rounded-2xl bg-white/5" />
                    <div className="h-24 rounded-2xl bg-white/10" />
                    <div className="h-24 rounded-2xl bg-white/10" />
                    <div className="h-24 rounded-2xl bg-white/5" />
                 </div>
              </div>
            </div>
            <div className="bg-primary-900/50 p-6 sm:p-10 dark:bg-white/[0.02]">
              <AITripRecommender />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-px mx-auto mt-32 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
            Loved by renters
          </h2>
        </div>
        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* CTA */}
      <section className="container-px mx-auto my-32 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary-950 px-8 py-20 text-center dark:bg-white/[0.03] sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-grad-primary opacity-20" />
          <h2 className="relative z-10 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Ready for your next trip?
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-xl text-lg text-primary-200">
            Join thousands of renters who book their perfect car or bike in minutes.
          </p>
          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button as={Link} to="/vehicles" variant="primary" size="lg" className="w-full justify-center sm:w-auto" iconRight={FiArrowRight}>
              Browse vehicles
            </Button>
            <Button as={Link} to="/signup" variant="secondary" size="lg" className="w-full justify-center sm:w-auto">
              Create free account
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
