const Product = require('../models/ProductModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {};

    // Add Category Filter
    if (req.query.category) {
        keyword.category = req.query.category;
    }

    // Smart Filtering: Hide OOS items unless 'showAll' is requested (e.g. by Admin)
    // Note: In a real app, verify admin token here. For now, we trust the query param or just hide for public shop.
    let filter = { ...keyword, isDeleted: false };

    // If NOT explicitly asking for all (Admin), hide OOS logic:
    if (req.query.showAll !== 'true') {
        filter.countInStock = { $gt: 0 };
    }

    const products = await Product.find(filter);
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name profileImage');

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.isDeleted = true;
        await product.save();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    console.log('createProduct called with body:', req.body);
    const { name, price, description, image, category, countInStock } = req.body;

    // Basic Validation
    if (!name || !price || !category) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    const product = new Product({
        name,
        price,
        user: req.user._id,
        image: image || '/images/sample.jpg', // Default if not provided
        category,
        countInStock: countInStock || 0,
        numReviews: 0,
        description: description || 'No description',
        isDeleted: false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Fetch deleted products (History)
// @route   GET /api/products/history
// @access  Private/Admin
const getDeletedProducts = async (req, res) => {
    // Return ALL products ever added (both active and deleted), sorted by creation date
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
};

// @desc    Get unique product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories);
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    const { rating, comment, images } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Check if already reviewed
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            images: images || [] // Array of image URLs
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Update existing review
// @route   PUT /api/products/:id/reviews
// @access  Private
const updateProductReview = async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const review = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        review.rating = Number(rating);
        review.comment = comment;

        // Recalculate Average
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.json({ message: 'Review updated' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Delete existing review
// @route   DELETE /api/products/:id/reviews
// @access  Private
const deleteProductReview = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const reviewIndex = product.reviews.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (reviewIndex === -1) {
            res.status(404);
            throw new Error('Review not found');
        }

        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;

        if (product.reviews.length > 0) {
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json({ message: 'Review removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

module.exports = {
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
};
