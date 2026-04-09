import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Contact from "./pages/contact";
import Cart from "./pages/cart";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

const LEGACY_ADMIN_EMAIL = "chandru.jerry@gmail.com";

/**
 * App holds cart and page state and passes add/remove handlers.
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [cart, setCart] = useState([]); // items: { id, title, price, img, quantity }
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("limras_auth_token");
    const userRaw = localStorage.getItem("limras_auth_user");
    if (!token || !userRaw) return null;
    try {
      return { token, user: JSON.parse(userRaw) };
    } catch {
      return null;
    }
  });

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
  const handleAuthSuccess = ({ token, user }) => {
    if (!token || !user) return;
    localStorage.setItem("limras_auth_token", token);
    localStorage.setItem("limras_auth_user", JSON.stringify(user));
    setAuth({ token, user });
    setCurrentPage("home");
  };

  const logout = () => {
    localStorage.removeItem("limras_auth_token");
    localStorage.removeItem("limras_auth_user");
    setAuth(null);
  };

  const isAdmin = Boolean(
    auth?.user?.isAdmin
    || auth?.user?.role === "admin"
    || auth?.user?.email?.toLowerCase?.() === LEGACY_ADMIN_EMAIL,
  );

  const pages = {
    home: <Home addToCart={addToCart} />,
    order: <Order addToCart={addToCart} />,
    contact: <Contact />,
    cart: (
      <Cart
        cart={cart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        auth={auth}
      />
    ),
    login: <Login onAuthSuccess={handleAuthSuccess} />,
    admin: isAdmin ? <Admin user={auth?.user} token={auth?.token} /> : <Home addToCart={addToCart} />,
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

      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {auth?.user?.name && (
          <span className="hidden sm:inline-block bg-white/90 px-3 py-2 rounded-lg shadow text-sm">
            {auth.user.name}
          </span>
        )}
        {isAdmin && (
          <button
            onClick={() => setCurrentPage("admin")}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow"
          >
            Admin
          </button>
        )}
        <button
          onClick={() => (auth ? logout() : setCurrentPage("login"))}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow"
        >
          {auth ? "Logout" : "Login"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
