const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    razorpayOrderId: { type: String, unique: true, sparse: true }, // For secure verification + Idempotency
    razorpayPaymentId: { type: String, unique: true, sparse: true }, // For Deduplication & Audit
    paymentStatus: { type: String, default: 'Pending' }, // CREATED, ATTEMPTED, SUCCESS, FAILED
    gatewayResponse: { type: Object }, // Audit Trail
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    paymentVerifiedAt: { type: Date }, // Explicit timestamp for verification
    isDelivered: { type: Boolean, required: true, default: false },
    status: { type: String, default: 'Pending' } // Pending, Processed, Shipped, Delivered
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
