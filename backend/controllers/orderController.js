const Product = require('../models/ProductModel'); // Import Product Model
const Order = require('../models/OrderModel'); // Import Order Model
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
                    filter: { _id: item.product, countInStock: { $gte: item.quantity } }, // Check if stock exists
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
            console.log(`Checking Stock for: ${item.name}, ID: ${item.product}`);
            const product = await Product.findById(item.product);
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

// @desc    Create Razorpay Order
// @route   POST /api/orders/pay/:id
// @access  Private
const createRazorpayOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const options = {
            amount: Math.round(order.totalPrice * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${order._id}`,
        };

        try {
            const razorpayOrder = await razorpay.orders.create(options);

            // SECURITY: Link local order to Razorpay order
            order.razorpayOrderId = razorpayOrder.id;
            await order.save();

            res.json(razorpayOrder);
        } catch (error) {
            res.status(500);
            throw new Error(error.message);
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/pay/verify
// @access  Private
const verifyPayment = async (req, res) => {
    console.log('[DEBUG] Hit verifyPayment Endpoint');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        const order = await Order.findById(order_id);

        if (order) {
            console.log(`[DEBUG] Verify Payment - ID: ${order._id}, isPaid: ${order.isPaid}, razorpayOrderId: ${order.razorpayOrderId}`);
            // 1. IDEMPOTENCY CHECK
            if (order.isPaid) {
                return res.json({ message: 'Order already paid', order }); // Positive acknowledgment for duplicates
            }

            // 2. SECURITY: Verify that the payment belongs to THIS order
            if (order.razorpayOrderId !== razorpay_order_id) {
                res.status(400);
                throw new Error('Payment verification failed: Order Mismatch');
            }

            // 3. PERSISTENCE & AUDIT
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentVerifiedAt = Date.now();
            order.paymentMethod = 'Razorpay';
            order.razorpayPaymentId = razorpay_payment_id;
            order.paymentStatus = 'SUCCESS';
            order.gatewayResponse = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            };

            const updatedOrder = await order.save();
            res.json({ message: 'Payment success', order: updatedOrder });
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } else {
        res.status(400);
        throw new Error('Invalid signature');
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const { status } = req.body;

        // SECURITY: Allow List Validation
        const validStatuses = ['Pending', 'Processed', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (status && !validStatuses.includes(status)) {
            res.status(400);
            throw new Error('Invalid status update');
        }

        order.status = status || order.status;

        if (order.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyPayment,
    updateOrderStatus
};
