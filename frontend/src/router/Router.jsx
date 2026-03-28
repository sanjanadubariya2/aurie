import React from "react";
import { useApp } from "../context/AppContext";

// PAGE IMPORTS
import Home from "../pages/Home";
import CartPage from "../pages/CartPage";
import TransactionPage from "../pages/TransactionPage";
import AccountPage from "../pages/AccountPage";
import Personalized from "../pages/Personalized";
import About from "../pages/About";
import SearchResults from "../pages/SearchResults";
import ProductDetail from "../pages/ProductDetail";
import CategoryPage from "../pages/CategoryPage";
import OrderTrack from "../pages/OrderTrack";
import CheckoutAddress from "../pages/CheckoutAddress";
import AuthPage from "../pages/AuthPage";
import VerifyEmail from "../pages/VerifyEmail";
import PhoneVerification from "../pages/PhoneVerification";

export default function Router() {
  const { route } = useApp();

  // --------- Dynamic Routes ----------
  if (route.startsWith("product:"))
    return <ProductDetail id={route.split(":")[1]} />;

  if (route.startsWith("category:"))
    return <CategoryPage cat={route.split(":")[1]} />;

  if (route.startsWith("order:"))
    return <OrderTrack id={route.split(":")[1]} />;

  if (route.startsWith("search:"))
    return <SearchResults q={route.split(":")[1]} />;

  if (route.startsWith("verify:")) {
    const userId = route.split(":")[1];
    return <VerifyEmail userId={userId} />;
  }

  // --------- Static Routes ----------
  switch (route) {
    case "home":
      return <Home />;

    case "cart":
      return <CartPage />;

    case "checkout":
      return <CheckoutAddress />;

    case "transaction":
      return <TransactionPage />;

    case "account":
      return <AccountPage />;

    case "personalized":
      return <Personalized />;

    case "about":
      return <About />;

    case "phone-verify":
      return <PhoneVerification />;

    case "login":
      return <AuthPage />;

    case "signup":
      return <AuthPage />;

    default:
      return <Home />;
  }
}
