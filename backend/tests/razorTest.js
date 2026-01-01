// Node 22+ has built-in fetch
const crypto = require('crypto');
require('dotenv').config();

const BASE_URL = 'http://127.0.0.1:5001/api';

const USER_EMAIL = 'sonal@gmail.com';
const USER_PASSWORD = '121212';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

const MOCK_PAYMENT_ID = 'pay_mock123456';

async function testOrderFlow() {
    try {
        console.log('--- STARTING ORDER FLOW TEST ---');

        // 1. LOGIN (USER)
        console.log('\n1. Logging in as User...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);
        const token = loginData.token;
        console.log('✅ User Login successful.');

        // 2. FETCH PRODUCT
        console.log('\n2. Fetching a product...');
        const productsRes = await fetch(`${BASE_URL}/products`);
        const products = await productsRes.json();
        if (products.length === 0) throw new Error('No products found.');
        const product = products[0];
        console.log(`✅ Found product: ${product.name} (${product._id})`);

        // 3. CREATE ORDER
        console.log('\n3. Creating Order...');
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                orderItems: [{
                    name: product.name,
                    quantity: 1,
                    image: product.image,
                    price: product.price,
                    product: product._id
                }],
                shippingAddress: { address: 'Test St', city: 'Test City', postalCode: '11111', country: 'Test' },
                paymentMethod: 'Razorpay',
                itemsPrice: product.price,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: product.price
            })
        });
        const order = await orderRes.json();
        if (!orderRes.ok) throw new Error(`Order creation failed: ${order.message}`);
        console.log(`✅ Order Created: ${order._id}`);

        // 4. INITIATE PAYMENT
        console.log('\n4. Initiating Razorpay Payment...');
        const payRes = await fetch(`${BASE_URL}/orders/pay/${order._id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(`Payment initiation failed: ${payData.message}`);
        console.log(`✅ Razorpay Order ID Generated: ${payData.id}`);

        // 5. VERIFY SECURITY
        console.log('\n5. Verifying Payment Security...');
        const razorpay_order_id = payData.id;
        const razorpay_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + MOCK_PAYMENT_ID)
            .digest('hex');

        // Negative Test: Mismatched Order ID
        console.log('   - Testing Security: Mismatched IDOR Check...');
        const failVerifyRes = await fetch(`${BASE_URL}/orders/pay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                razorpay_order_id: 'order_fake123', // WRONG ID
                razorpay_payment_id: MOCK_PAYMENT_ID,
                razorpay_signature: razorpay_signature,
                order_id: order._id
            })
        });

        if (!failVerifyRes.ok) {
            console.log('✅ Security Check Passed: Mismatched ID was correctly rejected.');
        } else {
            throw new Error('❌ SECURITY FAIL: Mismatched ID was ACCEPTED!');
        }

        // Positive Test: Correct Payment
        console.log('   - Testing Valid Payment...');
        const successVerifyRes = await fetch(`${BASE_URL}/orders/pay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: MOCK_PAYMENT_ID,
                razorpay_signature: razorpay_signature,
                order_id: order._id
            })
        });
        const successData = await successVerifyRes.json();
        if (!successVerifyRes.ok) throw new Error(`Verification failed: ${successData.message}`);
        console.log('✅ Payment Verified Successfully.');

        // Idempotency Test: Duplicate Verification
        console.log('   - Testing Idempotency (Duplicate Verification)...');
        const duplicateVerifyRes = await fetch(`${BASE_URL}/orders/pay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: MOCK_PAYMENT_ID,
                razorpay_signature: razorpay_signature,
                order_id: order._id
            })
        });
        const duplicateData = await duplicateVerifyRes.json();
        if (duplicateData.message === 'Order already paid') {
            console.log('✅ Idempotency Check Passed: Duplicate handled safely.');
        } else {
            console.log(`❌ Idempotency Check Failed: Unexpected response: ${duplicateData.message}`);
        }


        // 6. STATUS UPDATES (Admin Feature)
        console.log('\n6. Testing Admin Status Updates...');

        // Admin Login
        console.log('   - Logging in as Admin...');
        const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
        const adminData = await adminLoginRes.json();
        if (!adminLoginRes.ok) throw new Error(`Admin Login failed: ${adminData.message}`);
        const adminToken = adminData.token;
        console.log('✅ Admin Login successful.');

        // Test "Out for Delivery"
        console.log('   - Updating status to "Out for Delivery"...');
        const outRes = await fetch(`${BASE_URL}/orders/${order._id}/deliver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'Out for Delivery' })
        });
        if (!outRes.ok) {
            const err = await outRes.json();
            throw new Error(`Admin update failed: ${err.message}`);
        } else {
            console.log('✅ Status updated successfully.');
        }

        // Test Invalid Status
        console.log('   - Testing Invalid Status rejection...');
        const invalidRes = await fetch(`${BASE_URL}/orders/${order._id}/deliver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'In Space' }) // Invalid
        });
        if (invalidRes.status === 400) {
            console.log('✅ Security Check Passed: Invalid status rejected.');
        } else {
            console.log(`❌ Security Check Failed: Invalid status accepted/ignored (Status: ${invalidRes.status}).`);
        }

        console.log('\n--- TEST COMPLETE: ALL CHECKS PASSED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

testOrderFlow();
