// src/components/ProductCard.jsx

import React from 'react';
import { motion } from 'framer-motion';

// --- Inline SVG Placeholder for Sparkle Icon (Quick View/Feature Highlight) ---
const SparkleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.09 3.55l-2.06 1.13c-.17.09-.38.09-.55 0L10.4 3.55c-.27-.15-.6 0-.75.27L9.5 5.56c-.09.17-.09.38 0 .55l1.13 2.06c.15.27 0 .6-.27.75l-2.06 1.13c-.17.09-.38.09-.55 0L3.55 10.4c-.27-.15-0-.6.27-.75L5.56 9.5c.17-.09.17-.38 0-.55L4.43 6.94c-.15-.27 0-.6.27-.75l2.06-1.13c.17-.09.38-.09.55 0l2.06 1.13c.27.15.6 0 .75-.27l1.13-2.06c.09-.17.09-.38 0-.55L15.09 3.55zM12 21.45l2.06-1.13c.17-.09-.38-.09-.55 0L17.5 20.45c.27.15.6 0 .75-.27l1.13-2.06c.09-.17.09-.38 0-.55l-1.13-2.06c-.15-.27 0-.6.27-.75l2.06-1.13c.17-.09.38-.09.55 0l2.06 1.13c.27.15.6 0 .75-.27l1.13-2.06c.09-.17.09-.38 0-.55l-1.13-2.06c-.15-.27 0-.6.27-.75l2.06-1.13c.17-.09.38-.09.55 0L24 12.95l-1.13 2.06c-.09.17-.09.38 0 .55l1.13 2.06c.15.27 0 .6-.27.75l-2.06 1.13c-.17.09-.38-.09-.55 0L12 21.45zM21 12H3"></path>
    </svg>
);

// --- Helper Function: Render Stars ---
const renderStars = (rating) => {
    // FIX: Provides a default value (0) if rating is undefined
    const safeRating = rating || 0;
    const roundedRating = Math.round(safeRating * 2) / 2;

    return (
        <div className="flex items-center text-primary text-sm">
            {Array(5).fill(0).map((_, i) => {
                const starValue = i + 1;
                return (
                    <span key={i} className={starValue <= roundedRating ? 'text-flame' : 'text-shadow'}>
                        ★
                    </span>
                );
            })}
            <span className="text-charcoal ml-2 text-xs">({safeRating.toFixed(1)})</span>
        </div>
    );
};

// --- Image Mapping Function ---
const generatePlaceholderUrl = (name) => {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    return `https://res.cloudinary.com/demo/image/fetch/w_350,h_350,c_fill,g_auto/f_auto/${slug}.jpg`;
};

// --- Reusable Product Card Component ---
export default function ProductCard({ product }) {

    const imageUrl = product?.image || generatePlaceholderUrl(product?.name || 'Default Candle');

    return (
        <motion.div
            className="group cursor-pointer"
            initial="idle"
            whileHover="hover"
        >
            {/* Image Container - Taller Aspect Ratio (3:4) & Image-First */}
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-5 relative rounded-sm">
                <img
                    src={imageUrl}
                    alt={product?.name}
                    className="w-full h-full object-cover transition duration-700 ease-in-out group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/350x450/E5E5E5/A3A3A3?text=Kinzee"; }}
                />

                {/* Floating Action (Top Right) */}
                <motion.button
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-charcoal opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); console.log('Quick view'); }}
                >
                    <SparkleIcon className="w-5 h-5 opacity-70" />
                </motion.button>

                {/* Slide-Up Add to Cart (Minimalist) */}
                <motion.div
                    variants={{
                        idle: { y: "101%" },
                        hover: { y: 0 }
                    }}
                    transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-full"
                >
                    <button
                        className="w-full bg-charcoal text-white font-medium py-4 text-xs uppercase tracking-widest hover:bg-black transition-colors"
                        onClick={(e) => { e.stopPropagation(); console.log('Added to cart'); }}
                    >
                        Add to Cart
                    </button>
                </motion.div>
            </div>

            {/* Minimalist Details Below */}
            <div className="text-center space-y-1">
                <h3 className="text-lg font-serif text-charcoal tracking-tight group-hover:text-primary transition-colors duration-300">
                    {product?.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-brown/60 font-medium">${product?.price ? product.price.toFixed(2) : '24.00'}</span>
                    {/* Optional Rating if desired, keeping it minimal for now */}
                    {product?.rating > 0 && (
                        <span className="flex items-center text-xs text-flame">
                            <span className="mr-0.5">★</span> {product.rating}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}