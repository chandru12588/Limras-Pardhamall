import React from "react";

export default function Footer(){
  const googleReviewUrl = "https://www.google.com/search?q=limras+pardha+mall+pallavaram&sca_esv=e8481ae40804fa8e&sxsrf=ANbL-n4nFZAa5Qsk486J26W4v4znvVJl_Q%3A1775751510518&source=hp&ei=VtHXaaiwHc2ywcsPs_2wmA8&iflsig=AFdpzrgAAAAAadffZr59lVSbjs_PYoEAVz6mpmKGFvsV&oq=limras&gs_lp=Egdnd3Mtd2l6IgZsaW1yYXMqAggAMgQQIxgnMgQQIxgnMgoQIxjwBRgnGJ4GMhAQLhiABBhDGMcBGIoFGK8BMhQQLhiABBiRAhjHARiKBRiOBRivATIQEC4YgAQYQxjHARiKBRivATIKEAAYgAQYQxiKBTILEC4YgAQYxwEYrwEyChAAGIAEGEMYigUyCxAuGIAEGMcBGK8BSO8YULcEWKYMcAF4AJABAJgBnwGgAeEFqgEDMS41uAEByAEA-AEBmAIHoAL7BagCCsICBxAjGCcY6gLCAgsQABiABBiRAhiKBcICERAuGIAEGJECGNEDGMcBGIoFwgIREC4YgAQYsQMY0QMYgwEYxwHCAgsQLhiABBixAxiDAcICDhAuGIAEGLEDGIMBGIoFwgILEAAYgAQYsQMYigXCAg4QLhiABBixAxjRAxjHAcICFhAuGIAEGLEDGNEDGEMYgwEYxwEYigXCAhAQLhiABBixAxhDGIMBGIoFwgINEAAYgAQYsQMYQxiKBcICEBAuGIAEGNEDGEMYxwEYigXCAhAQABiABBixAxhDGIMBGIoFwgITEC4YgAQYsQMY0QMYQxjHARiKBcICChAuGIAEGEMYigWYAwfxBZLb4JFcqseFkgcDMS42oAezfLIHAzAuNrgH8wXCBwUwLjYuMcgHEoAIAA&sclient=gws-wiz";
  const instagramUrl = "https://www.instagram.com/limras.limras.543/";

  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-xl font-bold text-white">Limras Pardha Mall</h3>
        <p className="text-sm text-gray-300 mt-2">5 A Hassan Basha Street ESSA Pallavaram, Chennai - 6000043</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white">Instagram</a>
          <a href={googleReviewUrl} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white">Google Reviews</a>
          <a href="https://wa.me/917904559113" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white">WhatsApp</a>
        </div>
        <p className="text-gray-400 text-xs mt-6">&copy; {new Date().getFullYear()} Limras Pardha Mall</p>
      </div>
    </footer>
  );
}
