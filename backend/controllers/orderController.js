const Product = require('../models/ProductModel'); // Import Product Model
const Order = require('../models/OrderModel'); // Import Order Model

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        // 1. Validate Stock & Prepare Bulk Write Operations
        const bulkOps = orderItems.map(item => {
            return {
                updateOne: {
                    filter: { _id: item._id, countInStock: { $gte: item.quantity } }, // Check if stock exists
                    update: { $inc: { countInStock: -item.quantity } } // Atomic decrement
                }
            };
        });

        // We can't easily "Peek" inside a transaction here without more complex setup in Express (Sessions),
        // So for simplicity in this MERN stack (assuming no Replica Set for transactions on local), 
        // we will check stocks first, then write. 
        // Note: For TRUE production robustness with concurrency, we would use mongoose transactions.

        // Optimistic Check (Double Check)
        for (const item of orderItems) {
            const product = await Product.findById(item._id);
            if (!product) {
                res.status(404);
                throw new Error(`Product not found: ${item.name}`);
            }
            if (product.countInStock < item.quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for ${item.name}`);
            }
        }

        // Execute Bulk Update (Decrement Stock)
        const result = await Product.bulkWrite(bulkOps);

        // Check if any updates failed (meaning condition { $gte } failed between check and write)
        if (result.modifiedCount !== orderItems.length) {
            res.status(400);
            throw new Error('Stock validation failed during processing. Please try again.');
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
};

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders
};
