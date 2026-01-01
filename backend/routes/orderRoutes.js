const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyPayment,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/pay/verify').post(protect, verifyPayment);
router.route('/pay/:id').post(protect, createRazorpayOrder);
router.route('/:id/deliver').put(protect, admin, updateOrderStatus);

// Move parameterized route to the bottom
router.route('/:id').get(protect, getOrderById);

module.exports = router;
