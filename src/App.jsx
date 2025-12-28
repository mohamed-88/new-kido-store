import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Settings, ShoppingBag, Bell, Truck, Search, Moon, Sun, LayoutDashboard, Circle } from 'lucide-react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import CartDrawer from './components/CartDrawer';
import { ShopProvider, ShopContext } from './ShopContext';

function AppContent() {
  const { cartItems, notifications, markAllAsRead } = useContext(ShopContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // لۆجیکێ لۆگینێ ئەدمینی
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAdmin') === 'true'
  );

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // کۆنترۆلا دارک مۆد
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-gray-50'}`}>
      
      {/* --- NAV BAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              K
            </div>
            <span className="text-xl font-black dark:text-white tracking-tighter uppercase">
              Kido <span className="text-indigo-600">Story</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex relative w-72">
            <input 
              type="text" 
              placeholder="بگەڕی بۆ جلان..." 
              className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl py-2.5 pr-11 pl-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all text-right"
              dir="rtl"
            />
            <Search className="absolute right-4 top-3 text-gray-400" size={18} />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 md:gap-3">
            
            <Link to="/track" title="چاودێریا داخوازیێ" className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition">
              <Truck size={22} />
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => markAllAsRead?.()}
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Notification Menu */}
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110] overflow-hidden origin-top-right border-gray-100">
              <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <span className="font-black dark:text-white text-xs">ئاگەهداریێن نوی</span>
                {unreadCount > 0 && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
              </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications?.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-xs font-bold">چ ئاگەهداری نینن</div>
                  ) : (
                    notifications?.map((n) => (
                      <div key={n.id} className={`p-4 border-b dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex gap-3 text-right" dir="rtl">
                          <Circle size={8} className={`mt-1.5 flex-shrink-0 ${!n.isRead ? 'text-indigo-600 fill-indigo-600' : 'text-gray-300'}`} />
                          <div>
                            <h4 className="text-xs font-black dark:text-white mb-1">{n.title}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold">{n.message}</p>
                            <span className="text-[9px] text-gray-400 mt-2 block font-mono">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Settings Dropdown */}
            <div className="relative group mr-1">
              <button className="p-2.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl hover:ring-2 hover:ring-indigo-500/20 transition">
                <Settings size={22} />
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] p-2 origin-top-right border-gray-100">
                <div className="p-4 mb-1 text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سێتینگێن گشتی</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm font-bold dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? <Sun size={18} className="text-orange-400"/> : <Moon size={18} className="text-indigo-400"/>}
                    <span dir="rtl">مۆدی {darkMode ? 'ڕۆژ' : 'شەو'}</span>
                  </div>
                </button>
                <div className="h-[1px] bg-gray-100 dark:bg-slate-800 my-2 mx-2"></div>
                <Link to="/admin" className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 rounded-2xl transition-all text-sm font-bold text-indigo-600">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={18} />
                    <span dir="rtl">بڕێوەبرنا دۆکانێ</span>
                  </div>
                </Link>
                {/* دوگمەیا Logout ئەگەر یێ لۆگین بیت */}
                {isAuthenticated && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem('isAdmin');
                      setIsAuthenticated(false);
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 text-red-500 rounded-2xl transition-all text-sm font-bold mt-1"
                  >
                    <span>دەرکەفتن</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          {/* پاراستنا لاپەڕێ ئەدمین */}
          <Route 
            path="/admin" 
            element={isAuthenticated ? <Admin /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <footer className="py-10 text-center border-t dark:border-slate-800 mt-20">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">© 2025 KIDO STORY - All Rights Reserved</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ShopProvider>
      <Router>
        <AppContent />
      </Router>
    </ShopProvider>
  );
}

export default App;