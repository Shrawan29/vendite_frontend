import React, { useEffect, useState } from "react";
import axios from "axios";
import { ProductHeader } from "../components/products/ProductHeader.jsx";
import { ProductControls } from "../components/products/ProductControls.jsx";
import { AddProductForm } from "../components/products/AddProductForm.jsx";
import { ProductDisplay } from "../components/products/ProductDisplay.jsx";

export default function ProductDashboard() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [form, setForm] = useState({});
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState("info");
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductDetails, setShowProductDetails] = useState(false);

    const showToast = (message, type = "info") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchProducts = async () => {
        try {
            const data = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/get-all-products`);
            setProducts(Array.isArray(data.data.message) ? data.data.message : []);
            showToast("Products loaded successfully", "success");
        } catch (err) {
            showToast("Error fetching products", "error");
            setProducts([]);
        }
    };

    const fetchLowStock = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/low-stock-products`);
            setLowStock(data.data || []);
        } catch (err) {
            setLowStock([]);
        }
    };

    const handleCreate = async () => {
        if (!form.name || !form.sku || !form.price) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        try {
            const newProduct = {
                _id: Date.now().toString(),
                ...form,
                price: parseFloat(form.price),
                stockQuantity: parseInt(form.stockQuantity) || 0,
                alertQuantity: parseInt(form.alertQuantity) || 10,
                tax: parseFloat(form.tax) || 0,
                category: { name: form.category || "Uncategorized" }
            };

            setProducts(prev => [...prev, newProduct]);
            showToast("Product created successfully", "success");
            setForm({});
            setShowAddForm(false);
        } catch (err) {
            showToast("Error creating product", "error");
        }
    };

    const filterAndSortProducts = () => {
        let filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" ||
                product.category?.name === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "price":
                    return a.price - b.price;
                case "stock":
                    return a.stockQuantity - b.stockQuantity;
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    };

    const getUniqueCategories = () => {
        const categories = products.map(p => p.category?.name || "Uncategorized");
        return [...new Set(categories)];
    };

    const showProductModal = (product) => {
        setSelectedProduct(product);
        setShowProductDetails(true);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchLowStock();
        filterAndSortProducts();
    }, [products, searchTerm, selectedCategory, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 ">
            <ProductHeader totalProducts={products.length} lowStock={lowStock} />
            
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <ProductControls
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    categories={getUniqueCategories()}
                    showAddForm={showAddForm}
                    setShowAddForm={setShowAddForm}
                    filteredProducts={filteredProducts}
                    totalProducts={products.length}
                />

                <AddProductForm
                    form={form}
                    setForm={setForm}
                    onSubmit={handleCreate}
                    onCancel={() => setShowAddForm(false)}
                    isVisible={showAddForm}
                />

                <ProductDisplay
                    products={filteredProducts}
                    onProductClick={showProductModal}
                    onAddProduct={() => setShowAddForm(true)}
                    hasFilters={searchTerm || selectedCategory !== "all"}
                    selectedProduct={selectedProduct}
                    showProductDetails={showProductDetails}
                    setShowProductDetails={setShowProductDetails}
                    toastMessage={toastMessage}
                    toastType={toastType}
                />
            </div>
        </div>
    );
}