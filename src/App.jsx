import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Contact from "./pages/contact";
import Cart from "./pages/cart";

/**
 * App holds cart and page state and passes add/remove handlers.
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cart, setCart] = useState([]); // items: { id, title, price, img, quantity }

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        return prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setCart([]);

  const pages = {
    home: <Home addToCart={addToCart} />,
    order: <Order addToCart={addToCart} />,
    contact: <Contact />,
    cart: <Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/src/assets/allah-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <Navbar setCurrentPage={setCurrentPage} cartCount={cart.reduce((s,i)=>s+i.quantity,0)} />

      <main className="flex-1">
        {pages[currentPage] || pages.home}
      </main>

      <Footer />
    </div>
  );
}
