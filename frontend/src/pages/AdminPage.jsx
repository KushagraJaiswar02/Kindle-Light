import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO.jsx';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// --- Icons ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    // Data State
    const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, usersCount: 0, lowStock: 0 });
    const [products, setProducts] = useState([]);
    const [deletedProducts, setDeletedProducts] = useState([]); // History
    const [orders, setOrders] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [editingProduct, setEditingProduct] = useState(null); // For Edit Mode
    const [productForm, setProductForm] = useState({ name: '', price: '', countInStock: '', category: '', description: '', image: '' });

    // Categories
    const categories = ['Aromatherapy', 'Soy Wax', 'Pillar Candles', 'Scented Votives', 'Seasonal', 'Decorative'];

    useEffect(() => {
        if (activeSection === 'dashboard') fetchStats();
        if (activeSection === 'products') fetchProducts();
        if (activeSection === 'orders') fetchOrders();
        // if (activeSection === 'users') fetchUsers(); // User management not fully implemented yet
        if (activeSection === 'history') fetchDeletedProducts();
    }, [activeSection, user.token]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${user.token}` } });
            const data = await res.json();
            setStats({
                revenue: data.totalRevenue || 0,
                ordersCount: data.totalOrders || 0,
                usersCount: data.totalUsers || 0,
                lowStock: data.lowStockProducts || 0
            });
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?showAll=true');
            const data = await res.json();
            setProducts(data);
        } catch (error) { console.error(error); }
    };

    const fetchDeletedProducts = async () => {
        try {
            const res = await fetch('/api/products/history', { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.status === 401) {
                addToast('Session expired. Please login again.', 'error');
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setDeletedProducts(data);
            } else {
                setDeletedProducts([]);
            }
        } catch (error) {
            console.error(error);
            setDeletedProducts([]);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${user.token}` } });
            const data = await res.json();
            setOrders(data);
        } catch (error) { console.error(error); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(productForm)
            });

            if (res.status === 401) {
                addToast('Session expired. Please login again.', 'error');
                setLoading(false);
                return;
            }

            if (res.ok) {
                addToast(editingProduct ? 'Product Updated' : 'Product Created', 'success');
                setProductForm({ name: '', price: '', countInStock: '', category: '', description: '', image: '' });
                setEditingProduct(null);
                fetchProducts();
            } else {
                const data = await res.json();
                addToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            price: product.price,
            countInStock: product.countInStock,
            category: product.category,
            description: product.description,
            image: product.image || ''
        });
        window.scrollTo(0, 0); // Scroll to form
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure? This will move the product to history.')) return;
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                addToast('Product moved to history', 'success');
                fetchProducts();
                // Optionally refetch history if we were finding a way to update counts
            }
        } catch (error) { console.error(error); }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Update order status to "${status}"?`)) return;
        try {
            const res = await fetch(`/api/orders/${id}/deliver`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                addToast(`Order updated to ${status}`, 'success');
                fetchOrders();
            } else {
                const data = await res.json();
                addToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) { console.error(error); }
    };


    // --- Sub-components ---

    const StatsCard = ({ title, value, color, flicker }) => (
        <motion.div whileHover={{ scale: 1.05 }} className={`p-6 bg-white rounded-xl shadow-lg border-l-4 ${color}`}>
            <p className="text-charcoal/70 font-medium text-sm uppercase tracking-wider">{title}</p>
            <p className={`text-3xl font-bold text-charcoal mt-2 ${flicker ? 'animate-pulse' : ''}`}>{value}</p>
        </motion.div>
    );

    const DashboardHome = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} color="border-green-500" />
                <StatsCard title="Total Orders" value={stats.ordersCount} color="border-blue-500" />
                <StatsCard title="Total Users" value={stats.usersCount} color="border-purple-500" />
                <StatsCard title="Low Stock Alerts" value={stats.lowStock} color="border-red-500" flicker={stats.lowStock > 0} />
            </div>
        </div>
    );

    const renderProductSection = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Product Management</h2>

            {/* Add/Edit Product Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-brown mb-4">{editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}</h3>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Product Name" required className="p-3 border border-shadow rounded-lg" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />

                    <input
                        type="text"
                        list="category-options"
                        placeholder="Category (Select or Type New)"
                        required
                        className="p-3 border border-shadow rounded-lg"
                        value={productForm.category}
                        onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    />
                    <datalist id="category-options">
                        {categories.map(c => <option key={c} value={c} />)}
                    </datalist>

                    <input type="number" placeholder="Price ($)" required className="p-3 border border-shadow rounded-lg" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                    <input type="number" placeholder="Stock Quantity" required className="p-3 border border-shadow rounded-lg" value={productForm.countInStock} onChange={e => setProductForm({ ...productForm, countInStock: e.target.value })} />
                    {/* Image Upload Handlers */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-charcoal font-bold mb-1">Product Image</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Enter Image URL"
                                className="flex-1 p-3 border border-shadow rounded-lg"
                                value={productForm.image}
                                onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    id="image-file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        try {
                                            setLoading(true);
                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: formData,
                                            });
                                            const data = await res.text();
                                            setProductForm({ ...productForm, image: data });
                                            setLoading(false);
                                        } catch (error) {
                                            console.error(error);
                                            setLoading(false);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="image-file"
                                    className="cursor-pointer bg-gray-200 text-charcoal px-4 py-3 rounded-lg hover:bg-gray-300 transition block text-center"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>
                        {productForm.image && (
                            <div className="mt-2 text-sm text-green-600">
                                Image Selected: {productForm.image}
                            </div>
                        )}
                    </div>
                    <textarea placeholder="Description" required className="p-3 border border-shadow rounded-lg md:col-span-2 h-24" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>

                    <div className="md:col-span-2 flex gap-4">
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-flame text-white font-bold rounded-lg hover:bg-brown transition disabled:opacity-50">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProduct && (
                            <button type="button" onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', countInStock: '', category: '', description: '', image: '' }); }} className="py-3 px-6 bg-gray-300 text-charcoal font-bold rounded-lg hover:bg-gray-400 transition">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Product Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h3 className="text-xl font-bold text-brown mb-4">Active Inventory</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-shadow/30 text-charcoal/70 text-sm">
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
                            const isOutOfStock = product.countInStock === 0;

                            return (
                                <tr key={product._id} className="border-b border-shadow/10 hover:bg-beige/30 transition">
                                    <td className="p-3 font-semibold text-charcoal">{product.name}</td>
                                    <td className="p-3 text-sm">{product.category}</td>
                                    <td className="p-3">${product.price.toFixed(2)}</td>
                                    <td className="p-3 font-bold">
                                        {isOutOfStock ? (
                                            <span className="text-red-600 uppercase text-xs tracking-wider">Out of Stock</span>
                                        ) : isLowStock ? (
                                            <span className="text-[#FF9F1C] flex items-center gap-1">
                                                {product.countInStock} <span className="text-[10px] uppercase font-bold border border-[#FF9F1C] px-1 rounded">Low</span>
                                            </span>
                                        ) : (
                                            <span className="text-green-600">{product.countInStock}</span>
                                        )}
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <Link to={`/admin/product/${product._id}/edit`} className="text-blue-500 hover:text-blue-700" title="Edit"><EditIcon /></Link>
                                        <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700" title="Delete"><TrashIcon /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const HistorySection = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Product History (All Records)</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <p className="mb-4 text-charcoal/70">Complete record of every product ever added to the inventory.</p>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-shadow/30 text-charcoal/70 text-sm">
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deletedProducts.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No records found.</td></tr>
                        ) : (
                            deletedProducts.map(product => (
                                <tr key={product._id} className={`border-b border-shadow/10 transition ${product.isDeleted ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-beige/30'}`}>
                                    <td className="p-3 font-semibold text-charcoal">{product.name}</td>
                                    <td className="p-3 text-sm">{product.category}</td>
                                    <td className="p-3">${product.price.toFixed(2)}</td>
                                    <td className="p-3">{product.countInStock}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isDeleted ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                            {product.isDeleted ? 'Deleted' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const OrderSection = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Orders</h2>
            {/* Placeholder for Orders implementation from previous steps - reusing basic structure */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-shadow/30 text-charcoal/70 text-sm">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">User</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Paid</th>
                            <th className="p-3">Delivered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} className="border-b border-shadow/10 hover:bg-beige/30 transition">
                                <td className="p-3 text-sm font-mono text-charcoal/70">{order._id}</td>
                                <td className="p-3 font-semibold text-charcoal">{order.user ? order.user.name : 'Unknown User'}</td>
                                <td className="p-3 text-sm">{order.createdAt.substring(0, 10)}</td>
                                <td className="p-3 text-flame font-bold">${order.totalPrice.toFixed(2)}</td>
                                <td className="p-3">
                                    {order.isPaid ? (
                                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Paid</span>
                                    ) : (
                                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">Unpaid</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col space-y-1">
                                        {/* Status Display */}
                                        <div className="mb-1 text-xs font-bold">
                                            {order.isDelivered ? (
                                                <span className="text-green-600">DELIVERED</span>
                                            ) : (order.status === 'Out for Delivery') ? (
                                                <span className="text-orange-500">OUT FOR DELIVERY</span>
                                            ) : (
                                                <span className="text-red-500">PENDING</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!order.isDelivered && (
                                            <div className="flex space-x-2 text-[10px]">
                                                {/* Only show 'Out for Delivery' if not already there */}
                                                {order.status !== 'Out for Delivery' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Out for Delivery')}
                                                        className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                                                    >
                                                        Mark Out
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                                    className="bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                                                >
                                                    Mark Delivered
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'products': return renderProductSection();
            case 'orders': return <OrderSection />;
            case 'history': return <HistorySection />;
            default: return <DashboardHome />;
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex flex-col md:flex-row font-sans">
            <SEO title="Admin Dashboard" description="Admin dashboard" robots="noindex" />

            <nav className="w-full md:w-64 bg-brown/90 text-white p-6 flex-shrink-0">
                <h1 className="text-2xl font-serif font-bold mb-8 tracking-wider text-primary">AdminPanel</h1>
                <ul className="space-y-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
                        { id: 'products', label: 'Products', icon: ProductIcon },
                        { id: 'orders', label: 'Orders', icon: OrderIcon },
                        // Replaced Users with History for this specific task focus
                        { id: 'history', label: 'History', icon: HistoryIcon },
                    ].map(item => (
                        <li key={item.id}>
                            <button onClick={() => setActiveSection(item.id)} className={`flex items-center space-x-3 w-full p-3 rounded-lg transition duration-200 ${activeSection === item.id ? 'bg-flame text-white shadow-lg' : 'hover:bg-white/10'}`}>
                                <item.icon /> <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <main className="flex-grow p-6 md:p-10 overflow-y-auto">
                <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
};

export default AdminDashboard;