import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-px mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-7xl font-extrabold text-gradient"
      >
        404
      </motion.h1>
      <h2 className="mt-3 font-display text-xl font-semibold text-primary-950 dark:text-white">
        This road doesn't lead anywhere
      </h2>
      <p className="mt-2 text-sm text-primary-500 dark:text-slate-400">
        The page you're looking for might have been moved or doesn't exist.
      </p>
      <Button as={Link} to="/" variant="primary" icon={FiArrowLeft} className="mt-6">
        Back to home
      </Button>
    </div>
  );
}
