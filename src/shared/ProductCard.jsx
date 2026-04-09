import React from "react";
import fallbackImage from "../assets/logo.png";

export default function ProductCard({ product, addToCart }) {
  const imageSrc = product.imageUrl || product.img || "https://via.placeholder.com/400x500?text=No+Image";
  const videoSrc = product.videoUrl || "";
  const available = product.available !== false;

  return (
    <div className="w-full card-shadow bg-white rounded-lg p-3 flex flex-col items-center">
      <div className="w-full h-56 overflow-hidden flex items-center justify-center">
        {videoSrc ? (
          <video src={videoSrc} className="w-full h-full object-contain" controls muted />
        ) : (
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-contain"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        )}
      </div>

      <div className="text-center mt-3 w-full">
        <h3 className="font-semibold text-lg">{product.title}</h3>
        <p className="text-green-700 font-bold mt-1">Rs {product.price}</p>
        <button
          type="button"
          onClick={() => addToCart(product)}
          className={`mt-3 w-full ${available ? "btn-primary" : "bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed"}`}
          disabled={!available}
        >
          {available ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
