import { motion } from 'framer-motion';
import { FiCommand, FiMap, FiMessageSquare, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Guide() {
  const features = [
    {
      id: 'search',
      title: 'Smart Search & Command Palette',
      description: 'Navigate at the speed of thought. Press Cmd+K (or Ctrl+K) anywhere on the platform to instantly search for vehicles, access pages, or manage your profile without leaving your keyboard.',
      icon: FiCommand,
      color: 'text-accent-cyan',
      bgColor: 'bg-accent-cyan/10',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      align: 'left'
    },
    {
      id: 'map',
      title: 'Interactive Road Trips Map',
      description: 'Don\'t just rent a car, plan an adventure. Our interactive map plots scenic routes across the country and automatically curates the perfect vehicles for your chosen terrain.',
      icon: FiMap,
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange/10',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop',
      align: 'right'
    },
    {
      id: 'ai',
      title: 'AI Trip Recommender',
      description: 'Not sure where to go? Chat with our AI travel assistant. It analyzes your preferences, time of year, and group size to build a custom itinerary and match you with the ideal ride.',
      icon: FiMessageSquare,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
      align: 'left'
    },
    {
      id: 'bookings',
      title: 'Seamless Booking Management',
      description: 'Your upcoming trips, rental history, and wishlist all in one place. Easily modify dates, add extra insurance, or contact your host directly through the secure dashboard.',
      icon: FiCalendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      image: 'https://images.unsplash.com/photo-1588828945763-71ab529244ee?q=80&w=600&auto=format&fit=crop',
      align: 'right'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-primary-950 pt-20">
      {/* Hero Section */}
      <section className="container-px mx-auto max-w-5xl py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-950 dark:text-white sm:text-5xl lg:text-6xl">
            Welcome to the <span className="text-gradient">DriveEase</span> Tour
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-600 dark:text-slate-400">
            Discover the powerful features designed to make your vehicle rental experience seamless, inspiring, and completely hassle-free.
          </p>
        </motion.div>
      </section>

      {/* Features Walkthrough */}
      <section className="container-px mx-auto max-w-5xl pb-24">
        <div className="flex flex-col gap-24">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`flex flex-col gap-10 md:items-center ${
                feature.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl dark:shadow-card-dark">
                  <div className="absolute inset-0 bg-primary-950/10 dark:bg-primary-950/40 mix-blend-overlay z-10" />
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2 md:px-8">
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor} ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h2 className="mb-4 font-display text-3xl font-bold text-primary-950 dark:text-white">
                  {feature.title}
                </h2>
                <p className="text-lg leading-relaxed text-primary-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-900 py-24 text-center dark:bg-primary-950/50">
        <div className="container-px mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to hit the road?
            </h2>
            <p className="mb-10 text-lg text-primary-200">
              Join thousands of adventurers who trust DriveEase for their journeys.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button as={Link} to="/vehicles" variant="primary" size="lg" iconRight={FiArrowRight}>
                Browse Vehicles
              </Button>
              <Button as={Link} to="/signup" variant="ghost" className="text-white hover:bg-white/10" size="lg">
                Create an Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
