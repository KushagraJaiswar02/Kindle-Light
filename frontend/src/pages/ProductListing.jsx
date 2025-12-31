// src/ProductListingPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard.jsx';
import SEO from '../components/SEO.jsx';

const ProductListingPage = () => {
    // Dummy Data for Product Display
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const [filterOpen, setFilterOpen] = useState(false);

    // Placeholder Icons for Filter and Close
    const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

    // --- Framer Motion Variants (Unchanged) ---
    const sidebarVariants = {
        hidden: { x: '-100%', opacity: 0, transition: { type: "tween" } },
        visible: { x: '0%', opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const mainContentClass = filterOpen ? 'md:w-3/4' : 'w-full';


    return (

        <div className="bg-white min-h-screen">
            <SEO
                title="Shop All Candles"
                description="Browse our wide selection of candles including aromatherapy, soy wax, pillar, and more."
                keywords="buy candles, shop candles, candle store, online candle shop"
            />

            {/* 1. Collection Hero - Minimalist & Centered */}
            <div className="bg-beige pt-32 pb-16 md:pt-40 md:pb-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Hand-Poured in small batches</p>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-charcoal mb-4">The Collection</h1>
                    <p className="text-brown/70 max-w-lg mx-auto font-light">
                        Discover scents designed to elevate your sanctuary. 100% soy wax, clean burning, and sustainably crafted.
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">

                    {/* 2. Standard E-commerce Sticky Sidebar (Desktop) / Mobile Drawer Toggle */}
                    {/* Mobile Toggle */}
                    <div className="md:hidden w-full flex justify-between items-center mb-6 border-b border-neutral-200 pb-4">
                        <button
                            onClick={() => setFilterOpen(true)}
                            className="flex items-center text-sm font-medium text-charcoal uppercase tracking-wider"
                        >
                            <span className="mr-2">+</span> Filters
                        </button>
                        <span className="text-sm text-brown/60">{products.length} Products</span>
                    </div>

                    {/* Sidebar */}
                    <aside className={`fixed inset-0 z-50 bg-white p-6 transition-transform duration-300 transform ${filterOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:inset-auto md:w-64 md:block md:bg-transparent md:p-0 md:shadow-none md:z-10 md:sticky md:top-32`}>
                        {/* Mobile Close Button */}
                        <div className="flex justify-between items-center mb-8 md:hidden">
                            <span className="font-serif text-xl">Filters</span>
                            <button onClick={() => setFilterOpen(false)}><XIcon /></button>
                        </div>

                        <div className="space-y-10">
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal mb-4">Category</h3>
                                <ul className="space-y-3">
                                    {['Shop All', 'Aromatherapy', 'Soy Wax', 'Pillar', 'Votive'].map((item, i) => (
                                        <li key={item}>
                                            <a href="#" className={`text-sm hover:text-primary transition-colors ${i === 0 ? 'text-charcoal font-medium border-b border-primary pb-0.5' : 'text-brown/70'}`}>
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal mb-4">Price</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm text-brown/70 hover:text-charcoal cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                        <span>Under $25</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-brown/70 hover:text-charcoal cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                        <span>$25 - $50</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-brown/70 hover:text-charcoal cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                        <span>$50 +</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Overlay for Mobile Sidebar */}
                    {filterOpen && (
                        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setFilterOpen(false)}></div>
                    )}

                    {/* 3. Product Grid */}
                    <main className="flex-1">
                        {/* Sort Bar (Desktop Only - Mobile usually hides or combines) */}
                        <div className="hidden md:flex justify-between items-center mb-8">
                            <span className="text-sm text-brown/60">{products.length} Results</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-brown/60">Sort by:</span>
                                <select className="text-sm bg-transparent border-none focus:ring-0 text-charcoal font-medium cursor-pointer">
                                    <option>Best Selling</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {products.length > 0 ? products.map(product => (
                                <motion.div key={product._id} variants={itemVariants}>
                                    <Link to={`/product/${product._id}`}>
                                        <ProductCard product={product} />
                                    </Link>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-brown/50">
                                    Loading products...
                                </div>
                            )}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductListingPage;