import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext.jsx"; // get user and loading state

import { ProductHeader } from "../components/products/ProductHeader.jsx";
import { ProductControls } from "../components/products/ProductControls.jsx";
import  {AddProductForm}  from "../components/products/AddProductForm.jsx";
import { ProductDisplay } from "../components/products/ProductDisplay.jsx";

export default function ProductDashboard() {
  const { user, loading } = useAuth(); // user & loading, no token needed

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
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };
  // axios config with credentials to send cookies
  const axiosConfig = {
    withCredentials: true,
  };

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoadingProducts(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/products/get-all-products`,
        axiosConfig
      );
      setProducts(Array.isArray(data.data) ? data.data : []);
      showToast("Products loaded successfully", "success");
    } catch (err) {
      showToast("Error fetching products", "error");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [user]);

  const fetchLowStock = useCallback(async () => {
    if (!user) return;
    setLoadingLowStock(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/products/low-stock-products`,
        axiosConfig
      );
      setLowStock(data.data || []);
    } catch (err) {
      setLowStock([]);
    } finally {
      setLoadingLowStock(false);
    }
  }, [user]);

  const handleCreate = async () => {
    if (!form.name || !form.sku || !form.price) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const newProduct = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity) || 0,
        alertQuantity: parseInt(form.alertQuantity) || 10,
        tax: parseFloat(form.tax) || 0,
        category: form.category || "Uncategorized",
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products/create-product`,
        newProduct,
        axiosConfig
      );
      await fetchProducts();
      showToast("Product created successfully", "success");
      setForm({});
      setShowAddForm(false);
    } catch (err) {
      showToast("Error creating product", "error");
    }
  };

  // Filtering & sorting products
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category?.name === selectedCategory;

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
  }, [products, searchTerm, selectedCategory, sortBy]);

  const getUniqueCategories = () => {
    const categories = products.map((p) => p.category?.name || "Uncategorized");
    return [...new Set(categories)];
  };

  const showProductModal = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Fetch products & low stock when user loads or changes
  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchLowStock();
    }
  }, [user, fetchProducts, fetchLowStock]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view products.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductHeader totalProducts={products.length} lowStock={lowStock} loading={loadingLowStock} />

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
          loading={loadingProducts}
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
