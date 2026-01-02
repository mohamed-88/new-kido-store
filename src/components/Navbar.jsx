import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Truck, Bell, 
  Settings, X, ShieldCheck, LogOut, CheckCircle2
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const Navbar = ({ setIsCartOpen }) => {
  const { cartItems, searchQuery, setSearchQuery, notifications, markAllAsRead } = useContext(ShopContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsSettingOpen(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-4 py-3 font-bold">
      <div className="max-w-7xl mx-auto flex items-center justify-between" dir="ltr">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">K</div>
          <span className="text-xl font-black dark:text-white tracking-tighter uppercase hidden sm:block">
            Kido <span className="text-indigo-600">Store</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end flex-1">
          
          {/* Search */}
          <div className={`relative flex items-center transition-all ${isSearchOpen ? 'bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl flex-1 max-w-[200px]' : ''}`}>
            {isSearchOpen && (
              <input 
                type="text" 
                placeholder="بگەڕێ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-[16px] dark:text-white text-right pr-2 w-full origin-right transform scale-[0.87] focus:ring-0" 
                dir="rtl"
                autoFocus
              />
            )}
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if(isSearchOpen) setSearchQuery("");
              }} 
              className="p-2 text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={22} />}
            </button>
          </div>

          {/* --- ئایکۆنێ چاودێریکردنا ئۆردەری (Track Order) --- */}
          <Link 
            to="/track-order" 
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
            title="چاودێریکردنا بارستەی"
          >
            <Truck size={22} />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSettingOpen(false); }} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition">
              <Bell size={22} />
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 z-[110]" dir="rtl">
                <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center text-xs text-gray-400">
                  <span>ئاگەدارییەکان</span>
                  <button onClick={() => markAllAsRead()} className="text-indigo-600">هەمی خواندن</button>
                </div>
                <div className="max-h-60 overflow-y-auto p-4 text-center dark:text-gray-300 text-xs">
                  {notifications.length > 0 ? notifications.map(n => <div key={n.id} className="text-right py-2 border-b dark:border-slate-800">{n.message}</div>) : "چ نینە"}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl active:scale-90 transition-transform">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-900">{cartCount}</span>}
          </button>

          {/* Settings Menu */}
          <div className="relative">
            <button onClick={() => { setIsSettingOpen(!isSettingOpen); setIsNotifOpen(false); }} className={`p-2 rounded-xl transition ${isSettingOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>
              <Settings size={22} />
            </button>
            {isSettingOpen && (
              <div className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 py-3 z-[110]" dir="rtl">
                {isAdmin ? (
                  <>
                    <Link to="/admin" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm">
                      <ShieldCheck size={18} className="text-indigo-600" /> پانێڵێ ئەدمینی
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm">
                      <LogOut size={18} /> دەرکەتن (Logout)
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm">
                    <ShieldCheck size={18} className="text-indigo-600" /> چوونەژوورێ (Admin)
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {(isSettingOpen || isNotifOpen) && <div className="fixed inset-0 z-10" onClick={() => {setIsSettingOpen(false); setIsNotifOpen(false)}}></div>}
    </nav>
  );
};

export default Navbar;