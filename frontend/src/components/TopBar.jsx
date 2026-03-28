import React, { useEffect, useState } from "react";

export default function TopBar() {
  const texts = [
    "Welcome to Aurie ✨",
    "25% OFF this Winter Season ❄️",
    "Free Shipping Above ₹999 🚚"
  ];

  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setI((x) => (x + 1) % texts.length),
      3000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="
      w-full 
      overflow-x-hidden 
      flex justify-center 
      bg-gradient-to-r from-purple-100 via-white to-pink-100 
      text-purple-700 
      text-sm font-semibold 
      py-2 px-2
      whitespace-nowrap   /* ❗Fix long text */
    ">
      <div className="max-w-6xl text-center">
        {texts[i]}
      </div>
    </div>
  );
}
