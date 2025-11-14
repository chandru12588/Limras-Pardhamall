import React from "react";

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="w-full card-shadow bg-white rounded-lg p-3 flex flex-col items-center">
      <div className="w-full h-56 overflow-hidden flex items-center justify-center">
        <img src={product.img} alt={product.title} className="w-full h-full object-contain" />
      </div>

      <div className="text-center mt-3 w-full">
        <h3 className="font-semibold text-lg">{product.title}</h3>
        <p className="text-green-700 font-bold mt-1">₹{product.price}</p>
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="btn-primary mt-3 w-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
