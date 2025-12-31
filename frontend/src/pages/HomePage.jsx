// src/pages/HomePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import ProductCard from '../components/ProductCard.jsx';
// Import local asset
import heroImage from '../assets/hero.png';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end start"] });
    const yRange = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const smoothY = useSpring(yRange, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setFeaturedProducts(data.slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Bento Grid Data - Using Branded Placeholders for reliability
    // Colors: Primary #F5C76B, Text #2C2C2C
    const moods = [
        { name: 'Aromatherapy', image: 'https://placehold.co/600x600/F5C76B/2C2C2C?text=Aromatherapy', link: '/shop?category=aromatherapy', size: 'col-span-2 row-span-2' },
        { name: 'Soy Wax', image: 'https://placehold.co/400x400/FFF7E6/8B5E3C?text=Pure+Soy+Wax', link: '/shop?type=soy', size: 'col-span-1 row-span-1' },
        { name: 'Pillar', image: 'https://placehold.co/400x600/FF9F1C/FFFFFF?text=Elegant+Pillars', link: '/shop?type=pillar', size: 'col-span-1 row-span-2' },
        { name: 'Votives', image: 'https://placehold.co/400x400/8B5E3C/FFF7E6?text=Votives', link: '/shop?type=votives', size: 'col-span-1 row-span-1' },
    ];

    return (
        <div className="bg-beige min-h-screen font-sans selection:bg-primary selection:text-white" ref={scrollRef}>
            <SEO
                title="Home"
                description="CandlesWithKinzee - Handcrafted, artisanal soy wax candles for your home sanctuary."
                keywords="boutique candles, soy wax, aromatherapy, luxury home fragrance"
            />

            {/* 1. Full-Width Immersive Hero */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Luxury Candle Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 drop-shadow-lg"
                    >
                        Light Your <span className="italic text-primary">Essence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-2xl text-white/90 font-light mb-10 max-w-2xl mx-auto drop-shadow-md"
                    >
                        Hand-poured artisanal soy candles for moments of pure tranquility.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Link to="/shop" className="inline-block px-10 py-4 bg-white text-charcoal font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Shop the Collection
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </motion.div>
            </section>

            {/* 2. Values / Trust Signals (Horizontal 3-Col) */}
            <section className="py-16 bg-white border-b border-brown/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brown/10">
                        <div className="px-4 py-4">
                            <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Pure Ingredients</h3>
                            <p className="text-brown/70 text-sm leading-relaxed">100% natural organic soy wax & phthalate-free oils.</p>
                        </div>
                        <div className="px-4 py-4">
                            <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Small Batch</h3>
                            <p className="text-brown/70 text-sm leading-relaxed">Hand-poured in batches of ten for quality control.</p>
                        </div>
                        <div className="px-4 py-4">
                            <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Eco-Conscious</h3>
                            <p className="text-brown/70 text-sm leading-relaxed">Reusable vessels and biodegradable packaging.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Shop by Mood (Bento Grid) - Reduced Padding */}
            <section className="py-20 bg-beige">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <span className="text-primary font-bold tracking-widest uppercase text-xs">Categories</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mt-2">Shop by Mood</h2>
                        </div>
                        <Link to="/shop" className="hidden md:inline-block text-brown hover:text-primary transition-colors border-b border-secondary">View All &rarr;</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[600px]">
                        {moods.map((mood, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group overflow-hidden rounded-2xl shadow-sm ${mood.size}`}
                                style={{ willChange: 'transform' }}
                            >
                                <Link to={mood.link} className="block h-full w-full">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition duration-500 z-10"></div>
                                    <img
                                        src={mood.image}
                                        alt={mood.name}
                                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <h3 className="text-2xl font-serif text-white font-medium tracking-wide drop-shadow-md">
                                            {mood.name}
                                        </h3>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/shop" className="text-brown hover:text-primary transition-colors border-b border-secondary">View All &rarr;</Link>
                    </div>
                </div>
            </section>

            {/* 4. Best Sellers (Standard Grid, No Parallax Gap) */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-4">Trending Now</h2>
                        <div className="w-16 h-1 bg-primary mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product, i) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            // Fallback skeletal loading/empty state if needed
                            <p className="col-span-full text-center text-brown/50">Loading best sellers...</p>
                        )}
                    </div>

                    <div className="text-center mt-16">
                        <Link to="/shop" className="px-8 py-3 border border-charcoal text-charcoal font-medium hover:bg-charcoal hover:text-white transition-all rounded-full">
                            Shop All Candles
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. Minimal Footer Callout */}
            <section className="py-16 bg-brown text-beige text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-serif mb-4">Join the Inner Circle</h2>
                    <p className="max-w-md mx-auto text-white/70 mb-8 font-light">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <div className="flex max-w-md mx-auto gap-2">
                        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-primary" />
                        <button className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-white hover:text-primary transition-colors">Sign Up</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;