import React, { Suspense, lazy } from "react";
import { AppProvider } from "./context/AppContext";

const TopBar = lazy(() => import("./components/TopBar"));
const Navbar = lazy(() => import("./components/Navbar"));
const Router = lazy(() => import("./router/Router"));
const Footer = lazy(() => import("./components/Footer"));

function LoadingFallback() {
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFE6EB",
      fontFamily: "sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#E05B75" }}>🕯️ Aurie Candles</h2>
        <p style={{ color: "#999" }}>Loading...</p>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF0F5" }}>
        <TopBar />
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div style={{ width: "100%", maxWidth: "1280px", padding: "0 16px" }}>
            <main style={{ marginTop: "16px" }}>
              <Router />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Suspense>
  );
}
