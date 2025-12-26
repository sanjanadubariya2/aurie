import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');
    
    if (token && storedAdmin) {
      setIsLoggedIn(true);
      setAdminUser(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLoginSuccess = (admin) => {
    setAdminUser(admin);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsLoggedIn(false);
    setAdminUser(null);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE6EB] via-[#FFF5F8] to-[#FFECEF] font-['Fredoka']">
      {isLoggedIn ? (
        <>
          <Header 
            adminName={adminUser?.name || 'Admin'} 
            onLogout={handleLogout}
          />
          
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

          {/* Content */}
          <div className="flex justify-center">
            <div className="w-full max-w-7xl px-4 py-6">
              <main>
                {renderPage()}
              </main>
            </div>
          </div>
        </>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
