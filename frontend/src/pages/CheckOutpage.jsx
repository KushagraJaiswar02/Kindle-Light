// src/CheckoutPage.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { useCart } from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Placeholder Icons
const LockIcon = () => '🔒'; // For security
const LocationIcon = () => '📍'; // For shipping/location
const PaymentIcon = () => '💳'; // For payment

const CheckoutPage = () => {
    // Simple state to simulate checkout steps
    const [currentStep, setCurrentStep] = useState(1);
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = React.useContext(AuthContext);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    // Sync variables from user profile when available
    React.useEffect(() => {
        if (user && user.addresses && user.addresses.length > 0) {
            setShippingAddress(prev => ({
                ...prev,
                address: prev.address || user.addresses[0].street || '',
                city: prev.city || user.addresses[0].city || '',
                postalCode: prev.postalCode || user.addresses[0].postalCode || '',
                country: prev.country || user.addresses[0].country || ''
            }));
        }
    }, [user]);

    const subtotal = cartTotal;
    const shipping = 50.00;
    const taxes = 0;
    const total = subtotal + shipping + taxes;

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        if (!user) {
            addToast('Please login to place an order', 'error');
            navigate('/login');
            return;
        }

        try {
            // OPTIONAL: Update User Profile with new address if desired
            // The user requested to save the address to profile
            try {
                await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        addresses: [{
                            street: shippingAddress.address,
                            city: shippingAddress.city,
                            postalCode: shippingAddress.postalCode,
                            country: shippingAddress.country
                        }]
                    })
                });
            } catch (profileErr) {
                console.warn("Failed to auto-save address to profile", profileErr);
            }

            // 1. Create Order
            const orderRes = await fetch('http://localhost:5001/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    orderItems: cartItems.map((item) => ({
                        product: item._id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    shippingAddress,
                    paymentMethod: 'Razorpay',
                    itemsPrice: subtotal,
                    taxPrice: taxes,
                    shippingPrice: shipping,
                    totalPrice: total
                })
            });

            const order = await orderRes.json();
            if (!orderRes.ok) throw new Error(order.message || 'Failed to create order');

            // 2. Create Razorpay Order
            const payRes = await fetch(`http://localhost:5001/api/orders/pay/${order._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const paymentData = await payRes.json();
            if (!payRes.ok) throw new Error(paymentData.message || 'Failed to initiate payment');

            // 3. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: paymentData.amount,
                currency: "INR",
                name: "CandlesWithKinzee",
                description: `Order #${order._id}`,
                order_id: paymentData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('http://localhost:5001/api/orders/pay/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: order._id
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            addToast('Payment Successful! Order Placed.', 'success');
                            clearCart();
                            navigate('/profile');
                        } else {
                            addToast(verifyData.message || 'Payment Verification Failed', 'error');
                        }
                    } catch (err) {
                        addToast('Verification Error: ' + err.message, 'error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#D97706"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            addToast(error.message, 'error');
        }
    };

    // Framer Motion variant for page entry
    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const StepIndicator = ({ step, label }) => (
        <div className={`flex flex-col items-center w-1/3 ${step <= currentStep ? 'text-flame' : 'text-shadow'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${step <= currentStep ? 'bg-flame text-white' : 'bg-beige border border-shadow'}`}>
                {step}
            </div>
            <span className="text-sm font-medium hidden sm:block">{label}</span>
        </div>
    );

    const ShippingForm = () => (
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-brown flex items-center space-x-2">{LocationIcon()} <span>Shipping Address</span></h2>
            [cite_start]<p className="text-charcoal/70 text-sm">Location tracking helps with shipping estimation and address autofill[cite: 13].</p>

            {/* Saved Addresses Selection */}
            {user?.addresses?.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <p className="text-sm font-bold text-charcoal">Saved Addresses:</p>
                    {user.addresses.map((addr, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setShippingAddress({
                                address: addr.street,
                                city: addr.city,
                                postalCode: addr.postalCode,
                                country: addr.country
                            })}
                            className="text-left p-3 border border-shadow/50 rounded-lg hover:bg-beige transition text-xs flex justify-between items-center bg-white"
                        >
                            <span>{addr.street}, {addr.city}</span>
                            <span className="text-flame font-bold">Use</span>
                        </button>
                    ))}
                </div>
            )}

            <input type="text" placeholder="Full Name" className="w-full p-3 border border-shadow rounded-lg focus:ring-primary focus:border-primary" />
            <input name="address" value={shippingAddress.address} onChange={handleAddressChange} type="text" placeholder="Address Line 1" className="w-full p-3 border border-shadow rounded-lg focus:ring-primary focus:border-primary" required />
            <input name="city" value={shippingAddress.city} onChange={handleAddressChange} type="text" placeholder="City" className="w-full p-3 border border-shadow rounded-lg focus:ring-primary focus:border-primary" required />
            <div className="flex space-x-4">
                <input name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} type="text" placeholder="Zip/Postal Code" className="w-1/2 p-3 border border-shadow rounded-lg focus:ring-primary focus:border-primary" required />
                <input name="country" value={shippingAddress.country} onChange={handleAddressChange} type="text" placeholder="Country" className="w-1/2 p-3 border border-shadow rounded-lg focus:ring-primary focus:border-primary" required />
            </div>

            <motion.button
                type="button"
                className="w-full py-3 bg-primary text-charcoal font-bold rounded-lg hover:bg-flame hover:text-white transition"
                onClick={() => setCurrentStep(2)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                Continue to Payment
            </motion.button>
        </motion.div>
    );

    const PaymentForm = () => (
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-brown flex items-center space-x-2">{PaymentIcon()} <span>Payment Method</span></h2>
            [cite_start]<p className="text-charcoal/70 text-sm">Secure online transactions with payment gateway integration (Razorpay / Stripe)[cite: 9, 14, 18].</p>

            {/* Simulated Payment Gateway Form */}
            <div className="p-6 bg-beige rounded-lg border border-shadow space-y-4">
                <p className="text-sm text-charcoal flex items-center">
                    [cite_start]{LockIcon()} **Security is key.** You will be redirected to Razorpay's secure payment gateway to complete your purchase.[cite: 37].
                </p>
                <div className="flex items-center space-x-3 p-3 bg-white rounded border border-shadow/30">
                    <span className="font-bold text-lg text-blue-800">Razorpay</span>
                    <span className="text-sm text-gray-500">Secure Payment</span>
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    type="button"
                    className="w-1/3 py-3 border border-brown text-brown font-bold rounded-lg hover:bg-beige transition"
                    onClick={() => setCurrentStep(1)}
                >
                    &larr; Back to Shipping
                </button>
                <motion.button
                    type="button"
                    className="w-2/3 py-3 bg-flame text-white font-bold rounded-lg hover:bg-brown transition"
                    onClick={() => setCurrentStep(3)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    Review Order
                </motion.button>
            </div>
        </motion.div>
    );

    const ReviewOrder = () => (
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-brown">Review & Place Order</h2>
            [cite_start]<p className="text-charcoal/70 text-sm">Final check before placing your order. Security is Flipkart-like secure checkout and encryption for user data[cite: 13].</p>

            {/* Review Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-beige rounded-lg border border-shadow/50">
                    <h3 className="font-semibold text-brown mb-2">Shipping Details</h3>
                    <p className="text-sm text-charcoal">{user?.name}</p>
                    <p className="text-sm text-charcoal">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                    <button className="text-flame text-xs mt-1 hover:underline" onClick={() => setCurrentStep(1)}>Edit</button>
                </div>
                <div className="p-4 bg-beige rounded-lg border border-shadow/50">
                    <h3 className="font-semibold text-brown mb-2">Payment Details</h3>
                    <p className="text-sm text-charcoal">Method: Razorpay Secure</p>
                    <button className="text-flame text-xs mt-1 hover:underline" onClick={() => setCurrentStep(2)}>Edit</button>
                </div>
            </div>

            {/* Final Place Order Button */}
            <motion.button
                className="w-full py-4 bg-flame text-white font-extrabold text-xl rounded-lg shadow-xl hover:bg-brown transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
            >
                Place Order (${total.toFixed(2)})
            </motion.button>

        </motion.div>
    );


    const renderFormContent = () => {
        switch (currentStep) {
            case 1: return <ShippingForm />;
            case 2: return <PaymentForm />;
            case 3: return <ReviewOrder />;
            default: return <ShippingForm />;
        }
    };


    return (
        <motion.div
            className="min-h-screen bg-beige p-4 md:p-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <SEO title="Secure Checkout" description="Complete your purchase securely." robots="noindex, nofollow" />
            <div className="container mx-auto">
                <Link to="/cart" className="flex items-center text-brown hover:text-flame mb-4 text-sm font-medium transition">
                    &larr; Back to Cart
                </Link>

                <h1 className="text-4xl font-extrabold text-brown mb-8 text-center md:text-left flex items-center space-x-3">
                    {LockIcon()} <span>Secure Checkout</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* 1. Main Form Area */}
                    <div className="lg:w-3/5 bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-shadow/50">

                        {/* Step Indicator */}
                        <div className="flex justify-between mb-8 pb-4 border-b border-shadow/50">
                            <StepIndicator step={1} label="Shipping" />
                            <StepIndicator step={2} label="Payment" />
                            <StepIndicator step={3} label="Review" />
                        </div>

                        {/* Form Content (Animated) */}
                        <div key={currentStep}>
                            {renderFormContent()}
                        </div>
                    </div>

                    {/* 2. Order Summary Sidebar */}
                    <div className="lg:w-2/5 h-fit">
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-shadow/50 sticky top-24">
                            <h2 className="text-2xl font-bold text-brown mb-4 border-b pb-3 border-shadow/50">Order Summary</h2>

                            <div className="space-y-3 text-charcoal">
                                <div className="flex justify-between">
                                    <span className="text-md">Subtotal:</span>
                                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-md">Shipping:</span>
                                    <span className="font-semibold text-primary">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-shadow/50 pb-3">
                                    <span className="text-md">Taxes (8%):</span>
                                    <span className="font-semibold">${taxes.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between pt-3">
                                    <span className="text-2xl font-extrabold text-charcoal">Order Total:</span>
                                    <span className="text-2xl font-extrabold text-flame">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CheckoutPage;