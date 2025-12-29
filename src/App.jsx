import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';

// Components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import { ShopContext } from './context/ShopContext';

function App() {
  const { darkMode } = useContext(ShopContext);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  // لۆجیکێ پاراستنا ئەدمینی - هەر جارەک لاپەڕە هاتە گوهۆڕین دێ پشکنینێ کەت
  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAdmin') === 'true');
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Navbar یا نوی کو مە پێکڤە چێکری */}
      <Navbar setIsCartOpen={setIsCartOpen} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* لاپەڕێ لۆگینێ: دێ setIsAuthenticated بۆ فرێکەین دا کو دەستبەجێ ئەدمینی ڤەکەت */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          
          {/* پاراستنا ئەدمینی: ئەگەر لۆگین نەبیت دێ چیتە Login */}
          <Route 
            path="/admin" 
            element={isAuthenticated ? <Admin /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <footer className="py-10 text-center border-t dark:border-slate-800 mt-20">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">© 2025 KIDO STORE</p>
      </footer>
    </div>
  );
}

export default App;