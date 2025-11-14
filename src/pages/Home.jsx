import React, { useState } from "react";
import FlashSlider from "../components/FlashSlider";
import ProductCard from "../shared/ProductCard";

import img5 from "../assets/img5.jpeg";
import img1 from "../assets/img1.jpg";
import img6 from "../assets/img6.jpg";
import hijab1 from "../assets/hijab1.jpg";
import hijab2 from "../assets/Hijab2.jpg";
import hijab3 from "../assets/Hijab3.jpg";
import shawl1 from "../assets/shall1.jpg";
import shawl2 from "../assets/shall2.jpg";
import shawl3 from "../assets/shall3.jpeg";

export default function Home({ addToCart }) {
  const [search, setSearch] = useState("");

  const burkha = [
    { id: "b1", title: "Classic Black Burkha", price: 1200, img: img5 },
    { id: "b2", title: "Designer Burkha", price: 1800, img: img1 },
    { id: "b3", title: "Premium Embroidery Burkha", price: 2500, img: img6 },
  ];

  const hijabs = [
    { id: "h1", title: "Elegant Hijab Adult", price: 600, img: hijab1 },
    { id: "h2", title: "Kids Hijab", price: 350, img: hijab2 },
    { id: "h3", title: "Kids Hijab 2", price: 350, img: hijab3 },
  ];

  const shawls = [
    { id: "s1", title: "Plain Shawl", price: 450, img: shawl1 },
    { id: "s2", title: "Designer Shawl 1", price: 750, img: shawl2 },
    { id: "s3", title: "Designer Shawl 2", price: 750, img: shawl3 },
  ];

  const allProducts = [...burkha, ...hijabs, ...shawls];

  const filtered = allProducts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (p) => addToCart(p);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <FlashSlider />

      <div className="my-6 max-w-3xl mx-auto">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search burkha, hijab, shawl..."
          className="w-full border p-3 rounded-lg bg-white"
        />
      </div>

      {/* Search results */}
      {search.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center place-items-center">
          {filtered.map(p=>(
            <div key={p.id} className="w-[320px]">
              <ProductCard product={p} addToCart={handleAdd} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-3xl text-center font-bold mt-8 mb-6 text-white drop-shadow-md">Burkha Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center place-items-center">
            {burkha.map(p=>(
              <div key={p.id} className="w-[320px]">
                <ProductCard product={p} addToCart={handleAdd} />
              </div>
            ))}
          </div>

          <h2 className="text-3xl text-center font-bold mt-12 mb-6 text-white drop-shadow-md">Hijab Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center place-items-center">
            {hijabs.map(p=>(
              <div key={p.id} className="w-[320px]">
                <ProductCard product={p} addToCart={handleAdd} />
              </div>
            ))}
          </div>

          <h2 className="text-3xl text-center font-bold mt-12 mb-6 text-white drop-shadow-md">Shawl Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center place-items-center mb-12">
            {shawls.map(p=>(
              <div key={p.id} className="w-[320px]">
                <ProductCard product={p} addToCart={handleAdd} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
