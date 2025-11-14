import React, { useState } from "react";

export default function Cart({ cart = [], removeFromCart, clearCart }) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  // WhatsApp message for cart items
  const waCartText = encodeURIComponent(
    "Cart Order details:\n" +
      cart
        .map(
          (c, i) =>
            `${i + 1}. ${c.title} - Size: ${c.size || "-"} - Color: ${
              c.color || "-"
            } x${c.quantity} - ₹${c.price * c.quantity}`
        )
        .join("\n") +
      `\nTotal: ₹${total}`
  );

  // State for custom order form
  const [customDesign, setCustomDesign] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customQty, setCustomQty] = useState(1);

  // WhatsApp message for custom order
  const handleCustomOrder = () => {
    if (!customDesign || !customColor || !customSize || !customModel) {
      alert("Please fill all fields for custom order!");
      return;
    }

    const message = `Custom Order:
Design: ${customDesign}
Color: ${customColor}
Size: ${customSize}
Model: ${customModel}
Quantity: ${customQty}`;

    const phoneNumber = "7904559113";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Toggle Menu for Mobile */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button
          className="md:hidden text-xl font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Cart Items */}
      <div
        className={`flex flex-col gap-4 ${
          menuOpen ? "block" : "md:block"
        }`}
      >
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
            <h1 className="text-3xl font-semibold text-gray-700">
              Your Cart is Empty
            </h1>
            <p className="text-gray-500 mt-2">Add items to see them here.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center md:justify-between bg-white p-4 rounded shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-20 w-20 object-contain rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="text-gray-600 text-sm">
                    Size: {item.size || "-"} | Color: {item.color || "-"}
                  </div>
                  <div className="text-green-700">
                    ₹{item.price} x {item.quantity}
                  </div>
                </div>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <div className="font-bold">₹{item.price * item.quantity}</div>
                <button
                  className="text-red-600 mt-2"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Total & WhatsApp */}
      {cart.length > 0 && (
        <div className="mt-6 text-right flex flex-col md:flex-row md:justify-between gap-3 items-center">
          <div className="text-xl font-bold">Total: ₹{total}</div>
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-4 py-2 rounded border border-gray-400"
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <a
              className="px-4 py-2 rounded bg-green-600 text-white"
              target="_blank"
              rel="noreferrer"
              href={`https://wa.me/917904559113?text=${waCartText}`}
            >
              Order via WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Custom Order Form */}
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Custom Order Form</h2>

        <input
          type="text"
          placeholder="Enter design / description"
          className="w-full p-2 mb-3 border rounded"
          value={customDesign}
          onChange={(e) => setCustomDesign(e.target.value)}
        />

        <input
          type="text"
          placeholder="Color"
          className="w-full p-2 mb-3 border rounded"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
        />

        <input
          type="text"
          placeholder="Size"
          className="w-full p-2 mb-3 border rounded"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
        />

        <input
          type="text"
          placeholder="Model / Type"
          className="w-full p-2 mb-3 border rounded"
          value={customModel}
          onChange={(e) => setCustomModel(e.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          className="w-full p-2 mb-3 border rounded"
          value={customQty}
          onChange={(e) => setCustomQty(e.target.value)}
        />

        <button
          className="w-full bg-green-600 text-white py-2 rounded"
          onClick={handleCustomOrder}
        >
          Order Custom Product via WhatsApp
        </button>
      </div>
    </div>
  );
}
