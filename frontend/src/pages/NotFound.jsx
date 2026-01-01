import React from "react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO.jsx';

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] text-center px-4">
      <SEO title="404 - Page Not Found" description="The page you are looking for does not exist." robots="noindex, nofollow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        <div className="text-9xl font-serif text-charcoal/10 font-bold select-none mb-4">404</div>
        <h1 className="text-3xl font-serif text-charcoal mb-4">Looks like this candle has burned out.</h1>
        <p className="text-brown/70 mb-8">
          The page you are looking for is lost in the dark or has been moved.
          Let's get you back to the light.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-charcoal text-white px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-primary transition-colors duration-300"
          >
            Return Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
