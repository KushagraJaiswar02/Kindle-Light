import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO.jsx';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Placeholder icons (using emojis for simplicity and aesthetic fit)
const ProfileIcon = () => '👤';
const OrdersIcon = () => '📦';
const AddressIcon = () => '🏠';
const SettingsIcon = () => '⚙️';

const ProfilePage = () => {
    const { user, updateUser } = React.useContext(AuthContext); // Access AuthContext
    const { addToast } = useToast();
    const [activeSection, setActiveSection] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editing States
    const [editingProfile, setEditingProfile] = useState(false);
    const [addingAddress, setAddingAddress] = useState(false);
    const [addingCard, setAddingCard] = useState(false);

    // Form Data
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phoneNumber: '', password: '', profileImage: '' });
    const [addressForm, setAddressForm] = useState({ street: '', city: '', postalCode: '', country: '' });
    const [cardForm, setCardForm] = useState({ number: '', expiry: '', holderName: '', cvc: '' });

    // Framer Motion variant
    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchOrders();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/profile', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setProfile(data);
            setProfileForm({ name: data.name, email: data.email, phoneNumber: data.phoneNumber || '', password: '', profileImage: data.profileImage || '' });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/myorders', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (error) { console.error(error); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(profileForm)
            });
            const data = await res.json();
            if (res.ok) {
                addToast('Profile Updated', 'success');
                setProfile(data); // Immediate update
                updateUser(data); // Update global user state for Header
                setEditingProfile(false);
            } else { addToast(data.message, 'error'); }
        } catch (error) { addToast(error.message, 'error'); }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.text();

            if (res.ok) {
                setProfileForm({ ...profileForm, profileImage: data });
                addToast('Image Uploaded', 'success');
            } else {
                addToast('Image upload failed', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('Image upload failed', 'error');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        const newAddresses = [...(profile.addresses || []), addressForm];
        updateUserData({ addresses: newAddresses }, () => {
            setAddingAddress(false);
            setAddressForm({ street: '', city: '', postalCode: '', country: '' });
            addToast('Address Added', 'success');
        });
    };

    const handleRemoveAddress = (index) => {
        const newAddresses = profile.addresses.filter((_, i) => i !== index);
        updateUserData({ addresses: newAddresses }, () => addToast('Address Removed', 'info'));
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        // Simulation: "Encrypt" and mask data
        const last4 = cardForm.number.slice(-4);
        const cardType = getCardType(cardForm.number);
        const encryptedData = btoa(JSON.stringify(cardForm)); // Mock encryption

        const newMethod = {
            cardType,
            last4,
            expiryDate: cardForm.expiry,
            holderName: cardForm.holderName,
            encryptedData
        };

        const newMethods = [...(profile.paymentMethods || []), newMethod];
        updateUserData({ paymentMethods: newMethods }, () => {
            setAddingCard(false);
            setCardForm({ number: '', expiry: '', holderName: '', cvc: '' });
            addToast('Card Saved Securely', 'success');
        });
    };

    const handleRemoveCard = (index) => {
        const newMethods = profile.paymentMethods.filter((_, i) => i !== index);
        updateUserData({ paymentMethods: newMethods }, () => addToast('Card Removed', 'info'));
    };

    // Helper to update specific fields via PUT
    const updateUserData = async (updates, onSuccess) => {
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                if (onSuccess) onSuccess();
            } else { addToast(data.message, 'error'); }
        } catch (e) { addToast(e.message, 'error'); }
    };

    // Utility
    const getCardType = (number) => {
        if (/^4/.test(number)) return 'Visa';
        if (/^5/.test(number)) return 'MasterCard';
        return 'Card';
    };

    // --- Render Helpers (Functions, not Components, to prevent remounting/focus loss) ---

    if (loading || !profile) return <div className="p-10 text-center">Loading Profile...</div>;

    const renderProfileDetails = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-charcoal">Personal Information</h2>
            {editingProfile ? (
                <form onSubmit={handleUpdateProfile} className="bg-beige p-6 rounded-lg space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                                {profileForm.profileImage ? (
                                    <img src={profileForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">👤</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-flame text-white hover:bg-brown p-2 rounded-full cursor-pointer shadow-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                <input type='file' onChange={uploadFileHandler} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div><label className="block text-xs font-bold uppercase text-brown mb-1">Name</label>
                        <input className="w-full p-2 border rounded" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold uppercase text-brown mb-1">Email</label>
                        <input className="w-full p-2 border rounded" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold uppercase text-brown mb-1">Phone Number</label>
                        <input className="w-full p-2 border rounded" placeholder="+1 (555) 000-0000" value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold uppercase text-brown mb-1">New Password (leave blank to keep)</label>
                        <input type="password" className="w-full p-2 border rounded" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} /></div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-flame text-white px-4 py-2 rounded font-bold">Save Changes</button>
                        <button type="button" onClick={() => setEditingProfile(false)} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm relative">
                    <button onClick={() => setEditingProfile(true)} className="absolute top-4 right-4 text-sm text-blue-600 underline">Edit</button>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-beige shadow-md bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">👤</span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-6 w-full">
                            <div><p className="text-xs text-gray-500 uppercase">Name</p><p className="font-medium text-lg">{profile.name}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Email</p><p className="font-medium text-lg">{profile.email}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Phone</p><p className="font-medium text-lg">{profile.phoneNumber || 'Not provided'}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Member Since</p><p className="font-medium text-lg">{new Date(profile.createdAt).toLocaleDateString()}</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAddresses = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-charcoal">Address Book</h2>
                <button onClick={() => setAddingAddress(!addingAddress)} className="text-sm bg-charcoal text-white px-3 py-1 rounded">
                    {addingAddress ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {addingAddress && (
                <form onSubmit={handleAddAddress} className="bg-beige p-6 rounded-lg space-y-4 mb-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Street Address" required className="p-2 border rounded" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                        <input placeholder="City" required className="p-2 border rounded" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                        <input placeholder="Postal Code" required className="p-2 border rounded" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
                        <input placeholder="Country" required className="p-2 border rounded" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                    </div>
                    <button type="submit" className="bg-flame text-white px-4 py-2 rounded font-bold shadow-md">Save Address</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.addresses && profile.addresses.length > 0 ? (
                    profile.addresses.map((addr, idx) => (
                        <div key={idx} className="p-4 border border-neutral-200 rounded-lg relative hover:shadow-md transition bg-white">
                            <button onClick={() => handleRemoveAddress(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">✕</button>
                            <p className="font-bold">{addr.street}</p>
                            <p>{addr.city}, {addr.postalCode}</p>
                            <p className="text-sm text-gray-500 uppercase">{addr.country}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No addresses saved.</p>
                )}
            </div>
        </div>
    );

    const renderWallet = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-charcoal">Wallet & Payment Methods</h2>
                <button onClick={() => setAddingCard(!addingCard)} className="text-sm bg-charcoal text-white px-3 py-1 rounded">
                    {addingCard ? 'Cancel' : '+ Add Card'}
                </button>
            </div>

            {addingCard && (
                <form onSubmit={handleAddCard} className="bg-neutral-100 p-6 rounded-lg space-y-4 border border-neutral-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Card Number" required minLength="16" maxLength="16" className="p-2 border rounded md:col-span-2" value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })} />
                        <input placeholder="Expiry (MM/YY)" required className="p-2 border rounded" value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })} />
                        <input placeholder="CVC" required className="p-2 border rounded" maxLength="4" value={cardForm.cvc} onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })} />
                        <input placeholder="Card Holder Name" required className="p-2 border rounded md:col-span-2" value={cardForm.holderName} onChange={e => setCardForm({ ...cardForm, holderName: e.target.value })} />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow-md w-full">Encrypt & Save Card</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.paymentMethods && profile.paymentMethods.length > 0 ? (
                    profile.paymentMethods.map((method, idx) => (
                        <div key={idx} className="relative p-6 rounded-xl text-white shadow-xl bg-gradient-to-r from-gray-700 to-gray-900 h-48 flex flex-col justify-between transform hover:scale-105 transition-transform">
                            <button onClick={() => handleRemoveCard(idx)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs opacity-70">Credit Card</span>
                                <span className="font-bold tracking-wider">{method.cardType}</span>
                            </div>
                            <div className="text-2xl tracking-widest font-mono">
                                **** **** **** {method.last4}
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase opacity-70">Card Holder</p>
                                    <p className="font-medium tracking-wide">{method.holderName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-70">Expires</p>
                                    <p className="font-medium">{method.expiryDate}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No payment methods saved.</p>
                )}
            </div>
        </div>
    );

    // Default Order Component reuse (Simplified)
    const renderOrderHistory = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-charcoal">Recent Orders</h2>
            {orders.length === 0 ? <p>No orders found.</p> : orders.map(order => (
                <div key={order._id} className="p-4 border rounded hover:bg-gray-50">
                    <div className="flex justify-between">
                        <span className="font-bold">ID: {order._id.substring(0, 10)}...</span>
                        <span className={order.isPaid ? "text-green-600" : "text-red-500"}>{order.isPaid ? "Paid" : "Unpaid"}</span>
                    </div>
                    <p className="text-sm">Total: ${order.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile': return renderProfileDetails();
            case 'addresses': return renderAddresses();
            case 'wallet': return renderWallet();
            case 'orders':
            default: return renderOrderHistory();
        }
    };

    // ... (rest of NavButton and renderContent logic remains similar, adapted below)

    const NavButton = ({ section, icon, label }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition duration-200 
                ${activeSection === section
                    ? 'bg-flame text-white shadow-md'
                    : 'text-charcoal hover:bg-beige hover:text-brown'
                }`
            }
        >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <motion.div
            className="min-h-screen bg-beige p-4 md:p-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <SEO title="My Account" description="Manage your CandlesWithKinzee profile." />
            <div className="container mx-auto">
                {/* ... Header ... */}
                <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white" />
                    ) : (
                        <span className="text-5xl">👤</span>
                    )}
                    <h1 className="text-4xl font-extrabold text-brown">
                        Welcome, {user.name}!
                    </h1>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/4 bg-white p-6 rounded-xl shadow-xl border border-shadow/50 h-fit">
                        <nav className="space-y-2">
                            <NavButton
                                section="profile"
                                icon={user.profileImage ? <img src={user.profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover" /> : "👤"}
                                label="Profile Details"
                            />
                            <NavButton section="addresses" icon="🏠" label="Address Book" />
                            <NavButton section="wallet" icon="💳" label="Wallet" />
                            <NavButton section="orders" icon="📦" label="My Orders" />
                        </nav>
                    </div>
                    <motion.div
                        key={activeSection}
                        className="lg:w-3/4 bg-white p-8 rounded-xl shadow-xl border border-shadow/50"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;