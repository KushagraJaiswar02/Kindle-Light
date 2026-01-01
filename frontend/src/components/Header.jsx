// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

import candleLogo from '../assets/CANDLE.png';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = React.useContext(AuthContext);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { cartCount } = useCart();

    const { scrollY } = useScroll();

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setScrolled(latest > 50);
        });
    }, [scrollY]);

    // Icons
    const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
    const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
    const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

    const handleLogout = () => {
        logout();
        addToast('Logged out successfully', 'info');
        navigate('/');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/shop', label: 'Shop' },
        { path: '/admin', label: 'Admin', admin: true },
    ];

    // Dynamic Text Classes based on Scroll State
    const textColorClass = scrolled ? 'text-charcoal' : 'text-white';
    const hoverColorClass = scrolled ? 'hover:text-flame' : 'hover:text-primary';

    return (
        <motion.header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out px-4 sm:px-8 
                ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-shadow/10 py-3' : 'bg-gradient-to-b from-black/60 to-transparent py-6'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto flex justify-between items-center">

                {/* 1. Logo */}
                <Link to="/" className="group z-50 flex items-center gap-3">
                    {/* Logo: Invert brightness when not scrolled (to make it white), standard when scrolled (dark) */}
                    <img
                        src={candleLogo}
                        alt="CandlesWithKinzee"
                        className={`h-9 w-9 rounded-full object-cover transition-all duration-300 ${!scrolled ? 'brightness-0 invert' : ''}`}
                    />
                    <span className={`text-xl md:text-2xl font-serif font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-brown' : 'text-white'}`}>
                        CandlesWith<span className="font-light">Kinzee</span>
                    </span>
                </Link>

                {/* 2. Desktop Navigation (Centered) */}
                <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                    {navLinks.map((link) => {
                        if (link.auth && !user) return null;
                        // Hide Profile link for Admin
                        if (link.path === '/profile' && user?.isAdmin) return null;
                        if (link.admin && (!user || !user.isAdmin)) return null;
                        // Actually, I'll allow it for mobile menu visibility logic or just rely on the UserIcon for desktop.
                        // The loop maps navLinks. Let's check navLinks definition.


                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-sm font-medium tracking-wide uppercase transition-all duration-200 relative group ${isActive ? 'font-bold' : ''} ${textColorClass} ${hoverColorClass}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.label}
                                        <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-flame' : 'bg-white'}`}></span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* 3. Right Actions (Cart & User) */}
                <div className={`hidden md:flex items-center space-x-6 z-50 ${textColorClass}`}>

                    {/* Cart - Hide for Admin and Guests */}
                    {user && !user.isAdmin && (
                        <Link to="/cart" className={`relative p-1 transition-colors ${hoverColorClass}`} title="Cart">
                            <ShoppingCartIcon />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-flame text-[10px] text-white font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* User Section */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            {/* Profile Link (Icon Only) - Hide for Admin */}

                            {/* User Section */}
{user ? (
    <div className="flex items-center space-x-4">
        {/* Profile Link: Show for everyone, but we use the enhanced UI from main */}
        <Link 
            to="/profile" 
            className={`flex items-center gap-3 transition-colors group ${hoverColorClass}`} 
            title="My Profile"
        >
            <span className="font-medium text-sm hidden sm:block">Profile</span>
            {user.profileImage ? (
                <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm" 
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg shadow-sm">
                    👤
                </div>
            )}
        </Link>

        {/* Separator: Only hide if you specifically want it gone for Admins */}
        <div className={`h-4 w-px ${scrolled ? 'bg-charcoal/20' : 'bg-white/30'}`}></div>

        {/* Logout Button */}
        <button 
            onClick={handleLogout} 
            className={`flex items-center gap-2 transition-colors ${hoverColorClass}`} 
            title="Logout"
        >
            <LogOutIcon />
        </button>
    </div>
) : (
   
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border 
                                    ${scrolled
                                        ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
                                        : 'border-white text-white hover:bg-white hover:text-brown'
                                    }`}
                            >
                                Sign In
                            </motion.button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden z-50">
                    <button onClick={() => setIsOpen(!isOpen)} className={`${textColorClass}`}>
                        {isOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-neutral-100 py-6 px-6 flex flex-col space-y-4 md:hidden"
                    >
                        {navLinks.map((link) => {
                            if (link.auth && !user) return null;
                            if (link.admin && (!user || !user.isAdmin)) return null;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-lg font-serif text-charcoal"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <hr className="border-neutral-100" />
                        {user ? (
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-primary font-medium">Logout</button>
                        ) : (
                            <Link to="/login" onClick={() => setIsOpen(false)} className="text-primary font-medium">Sign In</Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.header>
    );
};

export default Header;