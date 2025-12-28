import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Bell, Settings, Truck, Search, 
  Home, LayoutGrid, Moon, Sun, Monitor, ShieldCheck, X
} from 'lucide-react';
// بانگکرنا ShopContext ل جهێ useCart
import { ShopContext } from '../ShopContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  // وەرگرتنا داتایان ژ ShopContext
  const { cartItems } = useContext(ShopContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const location = useLocation();

  // لۆجیکێ دارک مۆد
  useEffect(() => {
    const root = window.document.documentElement;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else if (theme === 'light') {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      } else {
        if (darkQuery.matches) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    const listener = () => { if (theme === 'system') applyTheme(); };
    darkQuery.addEventListener('change', listener);
    return () => darkQuery.removeEventListener('change', listener);
  }, [theme]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 z-[100] px-4 md:px-6 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white hidden sm:block">
              KIDO <span className="text-indigo-600">STORE</span>
            </span>
          </Link>

          {/* 2. Search */}
          <div className="hidden lg:flex flex-1 justify-center px-10">
            <div className="relative w-full max-w-[400px]">
              <input 
                type="text" 
                placeholder="ل چ دگەری؟..." 
                className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none dark:text-white transition-all text-right"
                dir="rtl"
              />
              <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* 3. Actions (RTL) */}
          <div className="flex items-center gap-1 md:gap-2" dir="rtl">
            
            {/* Setting Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingOpen(!isSettingOpen);
                }}
                className={`p-2.5 rounded-xl transition-all ${isSettingOpen ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              >
                <Settings size={22} />
              </button>

              {isSettingOpen && (
                <div 
                  className="absolute left-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-3 z-[110] animate-in fade-in zoom-in duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-right tracking-widest">ڕێکخستنێن ئەپلیکەیشنێ</p>
                  
                  <Link 
                    to="/admin" 
                    onClick={() => setIsSettingOpen(false)} 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition"
                  >
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <span className="font-bold text-sm">پەنەلا ئەدمینی</span>
                  </Link>

                  <div className="h-[1px] bg-gray-100 dark:bg-slate-700 my-1"></div>
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-right tracking-widest">ڕەنگێ سایتێ</p>
                  
                  <div className="grid grid-cols-3 gap-1 px-2">
                    <ThemeBtn active={theme==='light'} onClick={() => setTheme('light')} icon={<Sun size={16}/>} />
                    <ThemeBtn active={theme==='dark'} onClick={() => setTheme('dark')} icon={<Moon size={16}/>} />
                    <ThemeBtn active={theme==='system'} onClick={() => setTheme('system')} icon={<Monitor size={16}/>} />
                  </div>
                </div>
              )}
            </div>

            <IconButton icon={<Bell size={22} />} count={0} />
            
            <Link to="/track-order" className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition">
              <Truck size={22} />
            </Link>

            {/* دوگمەیا سەبەتێ */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 text-white px-4 py-2.5 rounded-2xl hover:opacity-90 transition active:scale-95 shadow-sm"
            >
              <ShoppingBag size={20} />
              <span className="font-bold text-sm hidden sm:block">{cartItems.length}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* باکگراوند بۆ گرتنا سێتیتنگێ */}
      {isSettingOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsSettingOpen(false)}></div>}

      {/* بانگکرنا پارچەیا سەبەتێ */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <div className="h-16"></div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 z-[100] flex items-center justify-around pb-1" dir="rtl">
        <MobileTab to="/" active={isActive('/')} icon={<Home size={22} />} label="سەرەکی" />
        <MobileTab to="/categories" active={isActive('/categories')} icon={<LayoutGrid size={22} />} label="بەشەکان" />
        <MobileTab to="/track-order" active={isActive('/track-order')} icon={<Truck size={22} />} label="ئۆردەر" />
        <button 
          onClick={() => setIsSettingOpen(!isSettingOpen)} 
          className={`flex flex-col items-center gap-1 ${isSettingOpen ? 'text-indigo-600' : 'text-gray-400'}`}
        >
           <Settings size={22} />
           <span className="text-[10px] font-bold">Setting</span>
        </button>
      </div>
    </>
  );
};

// Components یارمەتیدەر
const IconButton = ({ icon, count }) => (
  <button className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition relative">
    {icon}
    {count > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
  </button>
);

const ThemeBtn = ({ active, onClick, icon }) => (
  <button 
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }} 
    className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
      active 
      ? 'bg-indigo-600 text-white shadow-md scale-105' 
      : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    {icon}
  </button>
);

const MobileTab = ({ to, active, icon, label }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-105' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);

export default Navbar;