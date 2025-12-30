import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = React.useContext(AuthContext);
    const { addToast } = useToast();

    // Scroll detection for Glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Placeholder Icons (for visual structure without external libraries)
    const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const ShoppingCartIcon = () => '🛒';
    const UserIcon = () => '👤';

    const handleLogout = () => {
        logout();
        addToast('Logged out successfully', 'info');
    };

    // Filter links based on role
    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/shop', label: 'Shop' },
        { path: '/profile', label: 'Profile', auth: true }, // Only for logged in
        { path: '/admin', label: 'Admin', admin: true },    // Only for admin
    ];

    return (
        <motion.header
            className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-shadow/30' : 'bg-white shadow-md border-shadow/50'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LOGO AREA: Textual Logo with Elegant Font Style */}
                    <Link
                        to="/"
                        className="flex items-center space-x-1 group"
                    >
                        <motion.span
                            className="text-3xl font-serif font-extrabold text-brown tracking-wide"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="text-flame group-hover:text-primary transition-colors">Candles</span>With<span className="text-flame group-hover:text-primary transition-colors">Kinzee</span>
                        </motion.span>
                    </Link>

                    {/* Desktop Navigation Links (Hidden on Mobile) */}
                    <nav className="hidden md:flex items-center space-x-2 lg:space-x-6">
                        {navLinks.map((link) => {
                            if (link.auth && !user) return null;
                            if (link.admin && (!user || !user.isAdmin)) return null;
                            // Hide Profile link for Admin users
                            if (link.path === '/profile' && user && user.isAdmin) return null;

                            return (
                                <NavLink key={link.path} to={link.path} className={({ isActive }) => `px-3 py-2 font-medium transition duration-200 rounded-md relative ${isActive ? 'text-flame font-bold' : 'text-charcoal hover:text-flame'}`}>
                                    {({ isActive }) => (
                                        <>
                                            {link.label}
                                            {isActive && (
                                                <motion.div
                                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-flame"
                                                    layoutId="navbar-underline"
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Right-Side Icons & CTAs (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Cart Button */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-charcoal bg-beige rounded-full hover:bg-primary/50 transition duration-200"
                            title="Shopping Cart"
                        >
                            <ShoppingCartIcon />
                            {/* Cart Item Count */}
                            {/* <motion.span
                                key="cart-count"
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-flame rounded-full"
                            >
                                3
                            </motion.span> */}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-brown">Hi, {user.name}</span>
                                <button onClick={handleLogout} className="text-sm text-charcoal hover:text-flame underline">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <motion.button
                                    className="flex items-center py-2 px-4 text-charcoal bg-primary font-semibold rounded-lg hover:bg-flame hover:text-white transition duration-200 shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {UserIcon()} <span className="ml-1">Sign In</span>
                                </motion.button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button (Hidden on Desktop) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-brown hover:text-flame"
                        >
                            {isOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu (Conditionally Rendered) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-white border-t border-shadow/50 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-3 space-y-1 flex flex-col">
                            {navLinks.map((link) => {
                                if (link.auth && !user) return null;
                                if (link.admin && (!user || !user.isAdmin)) return null;
                                // Hide Profile link for Admin users
                                if (link.path === '/profile' && user && user.isAdmin) return null;
                                return (
                                    <Link key={link.path} to={link.path} className="block px-3 py-2 text-charcoal hover:bg-beige rounded-md font-medium" onClick={() => setIsOpen(false)}>{link.label}</Link>
                                );
                            })}
                            {user ? (
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-charcoal hover:bg-beige rounded-md font-medium">Logout</button>
                            ) : (
                                <Link to="/login" className="flex items-center px-3 py-2 text-charcoal font-medium hover:bg-beige rounded-md" onClick={() => setIsOpen(false)}>Sign In</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;