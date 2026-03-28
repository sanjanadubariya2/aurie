import { uid } from "./helpers";
import { BASE64_PLACEHOLDERS } from "../assets/placeholders";

const PDF_PRODUCTS = [
  { title: "Festive Candle — Single", price: 69, category: "Festival Candles" },
  { title: "Festive Candle — Double Pack", price: 120, category: "Festival Candles" },
  { title: "Bloom Candle — Premium", price: 499, category: "Bloom Candles" },
  { title: "Aroma Jar Candle", price: 199, category: "Jar Candles" },
  { title: "Whims Twist Candle", price: 200, category: "Whims Collection" },
  { title: "Brew & Glow Classic", price: 300, category: "Brew & Glow" }
];

export const SEEDED = PDF_PRODUCTS.map((p, i) => ({
  id: uid("p_"),
  ...p,
  images: [BASE64_PLACEHOLDERS[i % BASE64_PLACEHOLDERS.length]],
  stock: 20,
  description: p.title
}));
