import React from "react";

export default function Footer(){
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-xl font-bold text-white">Limras Pardha Mall</h3>
        <p className="text-sm text-gray-300 mt-2">5 A Hassan Basha Street ESSA Pallavaram, Chennai - 6000043</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
          <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
          <a href="#" className="text-gray-300 hover:text-white">WhatsApp</a>
        </div>
        <p className="text-gray-400 text-xs mt-6">&copy; {new Date().getFullYear()} Limras Pardha Mall</p>
      </div>
    </footer>
  );
}
