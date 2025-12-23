import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

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
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsLoggedIn(false);
    setAdminUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE6EB] via-[#FFF5F8] to-[#FFECEF] font-['Fredoka']">
      {isLoggedIn ? (
        <>
          <Header 
            adminName={adminUser?.name || 'Admin'} 
            onLogout={handleLogout}
          />
          <div className="flex justify-center">
            <div className="w-full max-w-6xl px-4 py-6">
              <main>
                <OrdersPage />
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
