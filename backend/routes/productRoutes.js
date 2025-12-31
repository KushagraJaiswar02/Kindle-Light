const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    getDeletedProducts,
    getCategories,
    createProductReview,
    updateProductReview,
    deleteProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/categories').get(getCategories);
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/history').get(protect, admin, getDeletedProducts);
router.route('/:id/reviews')
    .post(protect, createProductReview)
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct).put(protect, admin, updateProduct);

module.exports = router;
