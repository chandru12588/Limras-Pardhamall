import React, { useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function Cart({ cart = [], removeFromCart, clearCart, auth }) {
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderError, setOrderError] = useState("");

  const [customerName, setCustomerName] = useState(auth?.user?.name || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const waCartText = encodeURIComponent(
    "Cart Order details:\n" +
      cart
        .map(
          (c, i) =>
            `${i + 1}. ${c.title} - Size: ${c.size || "-"} - Color: ${c.color || "-"} x${c.quantity} - Rs ${
              c.price * c.quantity
            }`,
        )
        .join("\n") +
      `\nTotal: Rs ${total}`,
  );

  const submitOnlineOrder = async () => {
    setOrderError("");
    setOrderSuccess("");

    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setOrderError("Please enter name, phone number, and address.");
      return;
    }

    setOrderLoading(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        note: orderNote,
        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl || item.img || "",
        })),
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Unable to place order.");

      setOrderSuccess(`Order placed successfully. Order ID: ${data?.order?.id || "N/A"}`);
      clearCart?.();
    } catch (err) {
      setOrderError(err.message || "Unable to place order.");
    } finally {
      setOrderLoading(false);
    }
  };

  const [customDesign, setCustomDesign] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customQty, setCustomQty] = useState(1);

  const handleCustomOrder = () => {
    if (!customDesign || !customColor || !customSize || !customModel) {
      alert("Please fill all fields for custom order.");
      return;
    }

    const message = `Custom Order:\nDesign: ${customDesign}\nColor: ${customColor}\nSize: ${customSize}\nModel: ${customModel}\nQuantity: ${customQty}`;
    window.open(`https://wa.me/7904559113?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button className="md:hidden text-xl font-bold" onClick={() => setMenuOpen(!menuOpen)}>
          ?
        </button>
      </div>

      <div className={`flex flex-col gap-4 ${menuOpen ? "block" : "md:block"}`}>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[30vh] text-center gap-4">
            <h1 className="text-3xl font-semibold text-gray-700">Your Cart is Empty</h1>
            <p className="text-gray-500 mt-2">Add items to see them here.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row items-center md:justify-between bg-white p-4 rounded shadow">
              <div className="flex items-center gap-4">
                <img src={item.imageUrl || item.img} alt={item.title} className="h-20 w-20 object-contain rounded" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="text-gray-600 text-sm">
                    Size: {item.size || "-"} | Color: {item.color || "-"}
                  </div>
                  <div className="text-green-700">
                    Rs {item.price} x {item.quantity}
                  </div>
                </div>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <div className="font-bold">Rs {item.price * item.quantity}</div>
                <button className="text-red-600 mt-2" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="mt-2 text-right flex flex-col md:flex-row md:justify-between gap-3 items-center">
          <div className="text-xl font-bold">Total: Rs {total}</div>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded border border-gray-400" onClick={clearCart}>
              Clear Cart
            </button>
            <a className="px-4 py-2 rounded bg-green-600 text-white" target="_blank" rel="noreferrer" href={`https://wa.me/917904559113?text=${waCartText}`}>
              Order via WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Place Online Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="w-full p-2 border rounded" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input className="w-full p-2 border rounded" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
        <textarea className="w-full p-2 border rounded mt-3" rows="3" placeholder="Delivery Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
        <textarea className="w-full p-2 border rounded mt-3" rows="2" placeholder="Order Note (optional)" value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />

        {orderError && <p className="text-red-600 text-sm mt-3">{orderError}</p>}
        {orderSuccess && <p className="text-green-700 text-sm mt-3">{orderSuccess}</p>}

        <button
          className="mt-4 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg"
          onClick={submitOnlineOrder}
          disabled={orderLoading || cart.length === 0}
        >
          {orderLoading ? "Placing Order..." : "Place Online Order"}
        </button>
      </div>

      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Custom Order Form</h2>
        <input type="text" placeholder="Enter design / description" className="w-full p-2 mb-3 border rounded" value={customDesign} onChange={(e) => setCustomDesign(e.target.value)} />
        <input type="text" placeholder="Color" className="w-full p-2 mb-3 border rounded" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
        <input type="text" placeholder="Size" className="w-full p-2 mb-3 border rounded" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
        <input type="text" placeholder="Model / Type" className="w-full p-2 mb-3 border rounded" value={customModel} onChange={(e) => setCustomModel(e.target.value)} />
        <input type="number" min="1" placeholder="Quantity" className="w-full p-2 mb-3 border rounded" value={customQty} onChange={(e) => setCustomQty(e.target.value)} />

        <button className="w-full bg-green-600 text-white py-2 rounded" onClick={handleCustomOrder}>
          Order Custom Product via WhatsApp
        </button>
      </div>
    </div>
  );
}
