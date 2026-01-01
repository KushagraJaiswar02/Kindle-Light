import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO.jsx';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [description, setDescription] = useState('');

    const categories = ['Aromatherapy', 'Soy Wax', 'Pillar Candles', 'Scented Votives', 'Seasonal', 'Decorative'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data) {
                    setName(data.name);
                    setPrice(data.price);
                    setImage(data.image);
                    setCategory(data.category);
                    setStock(data.stock);
                    setDescription(data.description);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
                addToast('Failed to fetch product', 'error');
            }
        };
        fetchProduct();
    }, [id, addToast]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    name,
                    price,
                    description,
                    image,
                    category,
                    stock,
                }),
            });

            if (res.ok) {
                addToast('Product Updated Successfully', 'success');
                navigate('/admin');
            } else {
                addToast('Update Failed', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('An error occurred', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-beige flex flex-col font-sans">
            <SEO title="Edit Product" description="Edit product details" robots="noindex" />

            <div className="flex-grow container mx-auto px-4 py-10 max-w-3xl">
                <button onClick={() => navigate('/admin')} className="text-brown hover:text-flame mb-6 font-medium">
                    &larr; Back to Admin Dashboard
                </button>

                <div className="bg-white p-8 rounded-xl shadow-2xl border border-shadow/50">
                    <h1 className="text-3xl font-bold text-brown mb-8 font-serif">Edit Product</h1>

                    <form onSubmit={submitHandler} className="space-y-6">

                        <div>
                            <label className="block text-charcoal font-bold mb-2">Product Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-charcoal font-bold mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    placeholder="Enter price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full p-3 border border-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-charcoal font-bold mb-2">Count In Stock</label>
                                <input
                                    type="number"
                                    placeholder="Enter stock"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full p-3 border border-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-charcoal font-bold mb-2">Category</label>
                            <input
                                type="text"
                                list="category-options"
                                placeholder="Select or Type New Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                            <datalist id="category-options">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-charcoal font-bold mb-2">Image</label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="flex-1 p-3 border border-shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="edit-image-file"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            try {
                                                setUpdating(true);
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                const data = await res.json();
                                                setImage(data.image);
                                                setUpdating(false);
                                                addToast('Image Uploaded', 'success');
                                            } catch (error) {
                                                console.error(error);
                                                setUpdating(false);
                                                addToast('Upload Failed', 'error');
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="edit-image-file"
                                        className="cursor-pointer bg-gray-200 text-charcoal px-4 py-3 rounded-lg hover:bg-gray-300 transition block text-center whitespace-nowrap"
                                    >
                                        Upload New File
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-charcoal font-bold mb-2">Description</label>
                            <textarea
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 border border-shadow rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full py-4 bg-flame text-white font-bold text-lg rounded-lg hover:bg-brown transition shadow-lg disabled:opacity-50"
                        >
                            {updating ? 'Updating...' : 'Update Product'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
