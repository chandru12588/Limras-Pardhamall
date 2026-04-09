import React, { useEffect, useState } from "react";
import ProductCard from "../shared/ProductCard";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function Order({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Unable to load products.");
        if (active) setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load products.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Products</h1>

      {loading && <p className="text-center text-white font-medium">Loading products...</p>}
      {error && <p className="text-center text-red-200 font-medium">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 place-items-center">
          {products.map((product) => (
            <div key={product.id} className="w-full max-w-[320px]">
              <ProductCard product={product} addToCart={addToCart} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
