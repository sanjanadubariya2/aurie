import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

export default function Flash() {
  const { flash } = useApp();
  if (!flash) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="fixed top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded shadow-lg"
      >
        {flash}
      </motion.div>
    </AnimatePresence>
  );
}
