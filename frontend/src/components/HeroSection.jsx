import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <div className="relative bg-beige h-96 md:h-[550px] flex items-center justify-center overflow-hidden">
            {/* Background Glow Effect */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1.05, opacity: 0.8 }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/40 blur-3xl opacity-50 pointer-events-none"
            />

            <div className="relative z-10 text-center p-6 max-w-4xl">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-8xl font-black text-brown tracking-tighter mb-4 leading-tight"
                >
                    Handcrafted Comfort.
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-xl md:text-3xl text-charcoal/80 mb-10 font-light italic"
                >
                    Experience the pure glow of artisanal candles, ethically made for your home.
                </motion.p>
                <motion.button
                    initial={{ scale: 0.8, opacity: 0, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.6 }}
                    className="bg-flame text-charcoal font-bold py-3 px-10 rounded-full text-lg"
                    whileHover={{
                        scale: 1.08,
                        boxShadow: "0 8px 20px rgba(255, 159, 28, 0.6)",
                        backgroundColor: "#F5C76B"
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    Explore Scents
                </motion.button>
            </div>
        </div>
    );
}
