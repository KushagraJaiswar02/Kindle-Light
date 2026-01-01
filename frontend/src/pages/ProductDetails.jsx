// src/ProductDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO.jsx';
import AuthContext from '../context/AuthContext';

// --- Clean "Star" Component ---
const StarRating = ({ rating }) => {
    const safeRating = rating || 0;
    return (
        <div className="flex items-center space-x-1">
            <span className="flex text-flame">
                {Array(5).fill(0).map((_, i) => (
                    <span key={i} className={i < Math.round(safeRating) ? 'opacity-100' : 'opacity-20'}>★</span>
                ))}
            </span>
            <span className="text-xs text-charcoal/60 font-medium tracking-wide uppercase ml-2">
                {safeRating} / 5.0
            </span>
        </div>
    );
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();
    const { addToast } = useToast();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            setProduct(data);
            setLoading(false);

            // Check for existing user review
            if (user) {
                const existing = data.reviews.find(r => r.user === user._id || r.user._id === user._id);
                if (existing) {
                    setHasCurrentReview(true);
                    setRating(existing.rating);
                    setComment(existing.comment);
                } else {
                    setHasCurrentReview(false);
                    setRating(0);
                    setComment('');
                }
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Keep track if user is currently editing their existing review
    const [isEditing, setIsEditing] = useState(false);
    const [hasCurrentReview, setHasCurrentReview] = useState(false);

    // Fetch product logic...
    useEffect(() => {
        fetchProduct();
    }, [id, user]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        try {
            const method = hasCurrentReview ? 'PUT' : 'POST';
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ rating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                addToast(hasCurrentReview ? 'Review Updated' : 'Review Submitted!', 'success');
                setIsEditing(false); // Stop editing mode
                fetchProduct(); // Refresh
            } else {
                addToast(data.message, 'error');
            }
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const deleteReviewHandler = async () => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (res.ok) {
                addToast('Review deleted', 'info');
                setHasCurrentReview(false);
                setRating(0);
                setComment('');
                fetchProduct();
            }
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, Number(quantity));
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    // Framer Motion variant for page entry
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <motion.div
            className="min-h-screen bg-white"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <SEO
                title={product.name}
                description={product.description}
                image={product.image}
            />

            {/* Navigation (Floating) */}
            <div className="fixed top-24 left-6 z-40 lg:absolute lg:top-10 lg:left-10">
                <Link to="/shop" className="group flex items-center gap-3 text-charcoal/80 hover:text-black transition text-sm font-medium tracking-wide bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-neutral-100">
                    <span className="group-hover:-translate-x-1 transition-transform font-serif">←</span>
                    <span>Back</span>
                </Link>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 lg:pt-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* 1. Left Side - Product Visuals (Cols 7) */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative w-full aspect-[4/5] lg:aspect-square bg-stone-50 rounded-[2rem] overflow-hidden"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover mix-blend-multiply opacity-95"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x1200/F5F5F4/A3A3A3?text=Kinzee+Detail" }}
                            />
                        </motion.div>
                    </div>

                    {/* 2. Right Side - Product Details (Cols 5) */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-32 space-y-10">

                            {/* Header */}
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-bold tracking-widest text-brown/60 uppercase mb-3">{product.category || 'Collection'}</p>
                                    {user && user.isAdmin && (
                                        <Link to={`/admin/product/${product._id}/edit`} className="text-xs font-bold uppercase tracking-widest text-brown border-b border-brown hover:text-primary transition-colors">
                                            Edit Item
                                        </Link>
                                    )}
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-serif text-charcoal leading-tight mb-4">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <p className="text-3xl font-light text-charcoal">${product.price.toFixed(2)}</p>
                                    <div className="h-4 w-[1px] bg-neutral-300"></div>
                                    <StarRating rating={product.rating} />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="text-brown/80 font-light leading-relaxed text-base lg:text-lg">
                                <p>{product.description}</p>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-neutral-100">
                                <div>
                                    <span className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Fragrance</span>
                                    <span className="text-brown">{product.scent || 'Signature Blend'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Weight</span>
                                    <span className="text-brown">{product.weight || '12 oz'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Burn Time</span>
                                    <span className="text-brown">40-50 Hours</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Wax Type</span>
                                    <span className="text-brown">Soy Blend</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-6">
                                {product.countInStock > 0 ? (
                                    <div className="flex gap-4">
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                value={quantity}
                                                min="1"
                                                max={product.countInStock}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val > product.countInStock) setQuantity(product.countInStock);
                                                    else if (val < 1) setQuantity(1);
                                                    else setQuantity(val);
                                                }}
                                                className="w-full h-16 border border-neutral-300 rounded-xl text-center text-lg text-charcoal focus:ring-0 focus:border-charcoal hover:border-gray-400 transition"
                                            />
                                        </div>
                                        <motion.button
                                            onClick={handleAddToCart}
                                            className="flex-1 h-16 bg-charcoal text-white font-bold uppercase tracking-widest text-sm hover:bg-black rounded-xl shadow-lg hover:shadow-xl transition-all"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Add to Cart
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="w-full h-16 bg-neutral-100 text-neutral-400 flex items-center justify-center font-bold uppercase tracking-widest text-sm rounded-xl">
                                        Out of Stock
                                    </div>
                                )}
                                <p className="text-xs text-center text-brown/50">
                                    Free shipping on all US orders over $50.
                                </p>
                            </div>

                            {/* Accordions */}
                            <div className="space-y-4 pt-4">
                                <details className="group cursor-pointer border-b border-neutral-100 pb-4">
                                    <summary className="flex justify-between items-center font-medium text-charcoal list-none text-sm uppercase tracking-wide">
                                        <span>Shipping & Returns</span>
                                        <span className="transition group-open:rotate-180 text-xl font-light">+</span>
                                    </summary>
                                    <p className="text-sm text-brown/70 mt-3 pl-2 leading-relaxed">
                                        We ship within 2-3 business days. Easy returns within 30 days of delivery.
                                    </p>
                                </details>
                                <details className="group cursor-pointer border-b border-neutral-100 pb-4">
                                    <summary className="flex justify-between items-center font-medium text-charcoal list-none text-sm uppercase tracking-wide">
                                        <span>Care Instructions</span>
                                        <span className="transition group-open:rotate-180 text-xl font-light">+</span>
                                    </summary>
                                    <p className="text-sm text-brown/70 mt-3 pl-2 leading-relaxed">
                                        Trim wick to 1/4 inch before lighting. Keep candle free of match trimmings.
                                    </p>
                                </details>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* --- REVIEWS SECTION --- */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className="bg-stone-50 py-24 px-6 lg:px-12"
            >
                <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Summary / Header (Cols 4) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                            <h2 className="text-3xl font-serif text-charcoal mb-4">Customer Reviews</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-6xl font-serif text-charcoal">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                                <div>
                                    <StarRating rating={product.rating} />
                                    <p className="text-sm text-brown/60 mt-1">{product.numReviews} Reviews</p>
                                </div>
                            </div>
                            <p className="text-brown/80 mb-8 leading-relaxed">
                                We love hearing from our community. Share your experience with us and help others find their perfect scent.
                            </p>

                            {/* Write Review Trigger (Simple Button Scroll) */}
                            {user && !hasCurrentReview && (
                                <button
                                    onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}
                                    className="hidden lg:block border border-charcoal text-charcoal px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {/* Reviews Flow (Cols 8) */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* Form Section */}
                            <div id="review-form" className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-sm border border-stone-100">
                                {user ? (
                                    hasCurrentReview && !isEditing ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">✓</div>
                                            <h3 className="text-xl font-bold text-charcoal mb-2">Thank you!</h3>
                                            <p className="text-brown/70 mb-6">You have already reviewed this product.</p>
                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => setIsEditing(true)} className="text-xs font-bold uppercase tracking-widest border-b border-charcoal text-charcoal hover:text-black">Edit</button>
                                                <button onClick={deleteReviewHandler} className="text-xs font-bold uppercase tracking-widest border-b border-red-300 text-red-400 hover:text-red-500">Delete</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitReviewHandler} className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-bold text-charcoal">{isEditing ? 'Update Review' : 'Write a Review'}</h3>
                                                {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-400">Cancel</button>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase text-brown/60 mb-3">Rating</label>
                                                <div className="flex gap-4">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setRating(star)}
                                                            className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-charcoal' : 'text-neutral-200'}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase text-brown/60 mb-3">Your Experience</label>
                                                <textarea
                                                    rows="4"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    className="w-full p-4 bg-neutral-50 border-0 rounded-xl focus:ring-2 focus:ring-charcoal/10 transition resize-none text-charcoal placeholder-neutral-400"
                                                    placeholder="What did you think about the scent?"
                                                    required
                                                ></textarea>
                                            </div>

                                            <button type="submit" className="bg-charcoal text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition shadow-lg w-full lg:w-auto">
                                                {isEditing ? 'Update' : 'Post Review'}
                                            </button>
                                        </form>
                                    )
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-brown/70 mb-4">Please log in to share your thoughts.</p>
                                        <Link to="/login" className="inline-block bg-charcoal text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Sign In</Link>
                                    </div>
                                )}
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-8">
                                {product.reviews.map((review) => (
                                    <div key={review._id} className="border-b border-stone-200 pb-8 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.user && review.user.profileImage ? (
                                                <img src={review.user.profileImage} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-charcoal font-bold text-xs uppercase">
                                                    {review.name.substring(0, 2)}
                                                </div>
                                            )}
                                            <div>
                                                <span className="block font-bold text-charcoal text-sm">{review.name}</span>
                                                <span className="text-xs text-brown/50">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="ml-auto"><StarRating rating={review.rating} /></div>
                                        </div>
                                        <p className="text-brown/80 leading-relaxed font-light pl-[52px]">{review.comment}</p>
                                    </div>
                                ))}
                                {product.reviews.length === 0 && (
                                    <p className="text-brown/50 italic text-center py-12">No reviews yet. Be the first to verify this product!</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductDetailPage;