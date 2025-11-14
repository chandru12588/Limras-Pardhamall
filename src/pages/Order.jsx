import React from "react";
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

const products = [
  { id: "b1", title:"Classic Black Burkha", price:1200, img: img5},
  { id: "b2", title:"Designer Burkha", price:1800, img: img1},
  { id: "b3", title:"Premium Burkha", price:2500, img: img6},
  { id: "h1", title:"Elegant Hijab Adult", price:600, img: hijab1},
  { id: "h2", title:"Kids Hijab", price:350, img: hijab2},
  { id: "h3", title:"Kids Hijab 2", price:350, img: hijab3},
  { id: "s1", title:"Plain Shawl", price:450, img: shawl1},
  { id: "s2", title:"Designer Shawl 1", price:750, img: shawl2},
  { id: "s3", title:"Designer Shawl 2", price:750, img: shawl3},
];

export default function Order({ addToCart }){
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 place-items-center">
        {products.map(p=>(
          <div key={p.id} className="w-[320px]">
            <ProductCard product={p} addToCart={addToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}
