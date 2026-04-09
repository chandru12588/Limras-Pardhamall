import React, { useEffect, useMemo, useState } from "react";
import FlashSlider from "../components/FlashSlider";
import ProductCard from "../shared/ProductCard";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function Home({ addToCart }) {
  const [search, setSearch] = useState("");
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
        if (!res.ok) {
          throw new Error(data?.error || "Unable to load products.");
        }
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

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));
  }, [products, search]);

  const grouped = useMemo(() => {
    return {
      burkha: filteredProducts.filter((product) => product.category === "burkha"),
      hijab: filteredProducts.filter((product) => product.category === "hijab"),
      shawl: filteredProducts.filter((product) => product.category === "shawl"),
      other: filteredProducts.filter((product) => !["burkha", "hijab", "shawl"].includes(product.category)),
    };
  }, [filteredProducts]);

  const renderGrid = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center place-items-center">
      {items.map((product) => (
        <div key={product.id} className="w-full max-w-[320px]">
          <ProductCard product={product} addToCart={addToCart} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <FlashSlider />

      <div className="my-6 max-w-3xl mx-auto">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search burkha, hijab, shawl..."
          className="w-full border p-3 rounded-lg bg-white"
        />
      </div>

      {loading && <p className="text-center text-white font-medium">Loading products...</p>}
      {error && <p className="text-center text-red-200 font-medium">{error}</p>}

      {!loading && !error && (
        <>
          {search.trim() ? (
            filteredProducts.length === 0 ? (
              <p className="text-center text-white font-medium">No products found.</p>
            ) : (
              renderGrid(filteredProducts)
            )
          ) : (
            <>
              {grouped.burkha.length > 0 && (
                <>
                  <h2 className="text-3xl text-center font-bold mt-8 mb-6 text-white drop-shadow-md">Burkha Collection</h2>
                  {renderGrid(grouped.burkha)}
                </>
              )}

              {grouped.hijab.length > 0 && (
                <>
                  <h2 className="text-3xl text-center font-bold mt-12 mb-6 text-white drop-shadow-md">Hijab Collection</h2>
                  {renderGrid(grouped.hijab)}
                </>
              )}

              {grouped.shawl.length > 0 && (
                <>
                  <h2 className="text-3xl text-center font-bold mt-12 mb-6 text-white drop-shadow-md">Shawl Collection</h2>
                  <div className="mb-12">{renderGrid(grouped.shawl)}</div>
                </>
              )}

              {grouped.other.length > 0 && (
                <>
                  <h2 className="text-3xl text-center font-bold mt-12 mb-6 text-white drop-shadow-md">More Products</h2>
                  <div className="mb-12">{renderGrid(grouped.other)}</div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
