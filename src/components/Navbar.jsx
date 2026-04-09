import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function Navbar({ setCurrentPage, cartCount = 0, auth, isAdmin = false, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setCurrentPage("home");
            setMenuOpen(false);
          }}
        >
          <img src={logo} alt="Limras" className="h-12 w-12 object-contain rounded-full" />
          <div className="leading-tight">
            <div className="text-lg font-bold">Limras</div>
            <div className="text-sm text-green-700">Pardha Mall</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-base font-medium">
            <button onClick={() => setCurrentPage("home")} className="hover:text-green-700">
              Home
            </button>
            <button onClick={() => setCurrentPage("order")} className="hover:text-green-700">
              Order
            </button>
            <button onClick={() => setCurrentPage("contact")} className="hover:text-green-700">
              Contact
            </button>
          </div>

          <button onClick={() => setCurrentPage("cart")} className="relative text-2xl" aria-label="Open cart">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button onClick={() => setCurrentPage("admin")} className="hidden md:inline-flex bg-black hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm">
              Admin
            </button>
          )}

          <button
            onClick={() => (auth ? onLogout?.() : setCurrentPage("login"))}
            className="hidden md:inline-flex bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-lg text-sm"
          >
            {auth ? "Logout" : "Login"}
          </button>

          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "X" : "?"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-4 pb-4 flex flex-col gap-3 items-end">
          <button
            onClick={() => {
              setCurrentPage("home");
              setMenuOpen(false);
            }}
            className="text-base font-medium py-2 hover:text-green-700 text-right"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentPage("order");
              setMenuOpen(false);
            }}
            className="text-base font-medium py-2 hover:text-green-700 text-right"
          >
            Order
          </button>
          <button
            onClick={() => {
              setCurrentPage("contact");
              setMenuOpen(false);
            }}
            className="text-base font-medium py-2 hover:text-green-700 text-right"
          >
            Contact
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentPage("admin");
                setMenuOpen(false);
              }}
              className="text-base font-medium py-2 hover:text-green-700 text-right"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => {
              if (auth) {
                onLogout?.();
              } else {
                setCurrentPage("login");
              }
              setMenuOpen(false);
            }}
            className="text-base font-medium py-2 hover:text-green-700 text-right"
          >
            {auth ? "Logout" : "Login"}
          </button>
        </div>
      )}
    </nav>
  );
}
