const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    const totalOrders = await Order.countDocuments(); // Count all attempts (or switch to isPaid: true if desired)
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ countInStock: { $lt: 5 } });

    // Only calculate revenue for PAID orders
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    res.json({
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockProducts,
        totalRevenue
    });
};

module.exports = { getAdminStats };
