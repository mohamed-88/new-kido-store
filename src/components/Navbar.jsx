import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Truck, Bell, Settings, X, ShieldCheck, LogOut, User, Heart, LayoutDashboard } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const Navbar = ({ setIsCartOpen }) => {
  const { 
    getCartCount, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    markAllAsRead, 
    user, 
    dbUserData, 
    logout,
    wishlist 
  } = useContext(ShopContext);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const cartCount = getCartCount();
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const wishlistCount = wishlist?.length || 0;

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('isAdmin');
      setIsSettingOpen(false);
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ وێنەیێ یوزەری ب شێوەیەکێ پاراستی
  const userPhoto = dbUserData?.photoURL || user?.photoURL;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b dark:border-slate-800 px-4 py-2 md:py-3 font-bold">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo - هەر جاران دیارە */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">K</div>
          <span className="text-xl font-black dark:text-white tracking-tighter uppercase hidden sm:block">
            Kido <span className="text-indigo-600">Store</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">

          {/* Actions - تەنێ د دێسکتۆپێ دا دیارن */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center relative">
              {isSearchOpen && (
                <input 
                  type="text" 
                  placeholder="بگەڕێ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-100 dark:bg-slate-800 outline-none px-4 py-2 rounded-xl text-sm dark:text-white text-right w-40 border border-transparent focus:border-indigo-500" 
                  dir="rtl" autoFocus
                />
              )}
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
                {isSearchOpen ? <X size={20} /> : <Search size={22} />}
              </button>
            </div>

            <Link to="/track" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
              <Truck size={22} />
            </Link>

            <Link to="/wishlist" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl relative">
              <Heart size={22} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
            </Link>
          </div>

          {/* Notifications - (د موبایل و دێسکتۆپێ دا هەر دێ مینیت) */}
          <div className="relative">
            <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSettingOpen(false); setIsUserMenuOpen(false); }} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl relative active:scale-90">
              <Bell size={22} />
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 z-[110]" dir="rtl">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-black dark:text-white">ئاگەدارییەکان</span>
                  <button onClick={() => { markAllAsRead(); setIsNotifOpen(false); }} className="text-indigo-600 font-bold">هەمی خواندن</button>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  {notifications?.length > 0 ? notifications.map(n => (
                    <div key={n.id} className="p-3 text-right text-[11px] dark:text-gray-300 border-b dark:border-slate-800 last:border-0">{n.message}</div>
                  )) : <div className="py-8 text-center text-gray-400 text-xs font-medium">چ ئاگەداری نینن</div>}
                </div>
              </div>
            )}
          </div>

          {/* Cart - تەنێ د دێسکتۆپێ دا دیارە */}
          <button onClick={() => setIsCartOpen(true)} className="hidden md:flex relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">{cartCount}</span>}
          </button>

          {/* Settings - تەنێ د دێسکتۆپێ دا دیارە */}
          <div className="hidden md:block relative">
            <button onClick={() => { setIsSettingOpen(!isSettingOpen); setIsNotifOpen(false); setIsUserMenuOpen(false); }} 
              className={`p-2 rounded-xl transition ${isSettingOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
              <Settings size={22} />
            </button>
            {isSettingOpen && (
              <div className="absolute top-12 right-0 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 py-2 z-[110]" dir="rtl">
                {isAdmin ? (
                  <>
                    <Link to="/admin" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
                      <LayoutDashboard size={18} className="text-amber-500" /> پانێڵێ ئەدمینی
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold transition text-right">
                      <LogOut size={18} /> دەرکەفتن
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
                    <ShieldCheck size={18} className="text-indigo-600" /> چوونەژوورێ ئەدمین
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Account - تەنێ د دێسکتۆپێ دا دیارە */}
          <div className="hidden md:block relative ml-1">
            <button onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); setIsSettingOpen(false); }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all shadow-sm active:scale-95 ${isUserMenuOpen ? 'border-indigo-600' : 'border-transparent bg-gray-100 dark:bg-slate-800 hover:border-indigo-600'}`}>
              {userPhoto ? (
                <img src={userPhoto} className="w-full h-full object-cover" alt="User" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} className="text-gray-500" />
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-12 right-0 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 py-2 z-[110]" dir="rtl">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b dark:border-slate-800 mb-1 text-right">
                      <p className="text-[12px] font-black dark:text-white truncate">{dbUserData?.displayName || user.displayName || "کڕیار"}</p>
                      <p className="text-[10px] text-gray-500 truncate font-medium">{user.email}</p>
                    </div>
                    <Link to="/userprofile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
                      <User size={18} className="text-indigo-500" /> پڕۆفایلێ من
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold transition text-right">
                      <LogOut size={18} /> چوونەدەر
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
                    <User size={18} className="text-indigo-600" /> دروستکرنا هژمارێ
                  </Link>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      {(isSettingOpen || isNotifOpen || isUserMenuOpen) && (
        <div className="fixed inset-0 z-[100]" onClick={() => {setIsSettingOpen(false); setIsNotifOpen(false); setIsUserMenuOpen(false);}}></div>
      )}
    </nav>
  );
};

export default Navbar;



// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ShoppingBag, Search, Truck, Bell, Settings, X, ShieldCheck, LogOut, User, Heart, LayoutDashboard } from 'lucide-react';
// import { ShopContext } from '../context/ShopContext';

// const Navbar = ({ setIsCartOpen }) => {
//   const { 
//     getCartCount, 
//     searchQuery, 
//     setSearchQuery, 
//     notifications, 
//     markAllAsRead, 
//     user, 
//     dbUserData, // ✅ وەرگرتنا داتایێن Firestore
//     logout,
//     wishlist 
//   } = useContext(ShopContext);

//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [isSettingOpen, setIsSettingOpen] = useState(false);
//   const [isNotifOpen, setIsNotifOpen] = useState(false);
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
//   const navigate = useNavigate();
//   const isAdmin = localStorage.getItem('isAdmin') === 'true';

//   const cartCount = getCartCount();
//   const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
//   const wishlistCount = wishlist?.length || 0;

//   const handleLogout = async () => {
//     try {
//       await logout();
//       localStorage.removeItem('isAdmin');
//       setIsSettingOpen(false);
//       setIsUserMenuOpen(false);
//       navigate('/');
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b dark:border-slate-800 px-4 py-2 md:py-3 font-bold">
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
        
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-2 shrink-0">
//           <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">K</div>
//           <span className="text-xl font-black dark:text-white tracking-tighter uppercase hidden sm:block">
//             Kido <span className="text-indigo-600">Store</span>
//           </span>
//         </Link>

//         <div className="flex items-center gap-1 md:gap-2">
          
//           {/* Actions for Desktop */}
//           <div className="hidden md:flex items-center gap-2">
//             <div className="flex items-center relative">
//               {isSearchOpen && (
//                 <input 
//                   type="text" 
//                   placeholder="بگەڕێ..." 
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="bg-gray-100 dark:bg-slate-800 outline-none px-4 py-2 rounded-xl text-sm dark:text-white text-right w-40 border border-transparent focus:border-indigo-500" 
//                   dir="rtl" autoFocus
//                 />
//               )}
//               <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
//                 {isSearchOpen ? <X size={20} /> : <Search size={22} />}
//               </button>
//             </div>

//             <Link to="/track" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
//               <Truck size={22} />
//             </Link>

//             <Link to="/wishlist" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl relative">
//               <Heart size={22} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
//             </Link>
//           </div>

//           {/* Notifications (Mobile & Desktop) */}
//           <div className="relative">
//             <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSettingOpen(false); setIsUserMenuOpen(false); }} 
//               className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl relative active:scale-90">
//               <Bell size={22} />
//               {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
//             </button>
//             {isNotifOpen && (
//               <div className="absolute top-12 right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 z-[110]" dir="rtl">
//                 <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center text-xs">
//                   <span className="font-black dark:text-white">ئاگەدارییەکان</span>
//                   <button onClick={() => { markAllAsRead(); setIsNotifOpen(false); }} className="text-indigo-600 font-bold">هەمی خواندن</button>
//                 </div>
//                 <div className="max-h-60 overflow-y-auto p-2">
//                   {notifications?.length > 0 ? notifications.map(n => (
//                     <div key={n.id} className="p-3 text-right text-[11px] dark:text-gray-300 border-b dark:border-slate-800 last:border-0">{n.message}</div>
//                   )) : <div className="py-8 text-center text-gray-400 text-xs font-medium">چ ئاگەداری نینن</div>}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Cart (Desktop) */}
//           <button onClick={() => setIsCartOpen(true)} className="hidden md:flex relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
//             <ShoppingBag size={22} />
//             {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">{cartCount}</span>}
//           </button>

//           {/* Settings (Admin Entry Only) - Desktop Only */}
//           <div className="hidden md:block relative">
//             <button 
//               onClick={() => { setIsSettingOpen(!isSettingOpen); setIsNotifOpen(false); setIsUserMenuOpen(false); }} 
//               className={`p-2 rounded-xl transition ${isSettingOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
//             >
//               <Settings size={22} />
//             </button>
//             {isSettingOpen && (
//               <div className="absolute top-12 right-0 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 py-2 z-[110]" dir="rtl">
//                 {isAdmin ? (
//                   <>
//                     <Link to="/admin" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
//                       <LayoutDashboard size={18} className="text-amber-500" /> پانێڵێ ئەدمینی
//                     </Link>
//                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold transition text-right">
//                       <LogOut size={18} /> دەرکەفتن
//                     </button>
//                   </>
//                 ) : (
//                   <Link to="/login" onClick={() => setIsSettingOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
//                     <ShieldCheck size={18} className="text-indigo-600" /> چوونەژوورێ ئەدمین
//                   </Link>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* User Account - Desktop Only */}
//           <div className="hidden md:block relative ml-1">
//             <button 
//               onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); setIsSettingOpen(false); }}
//               className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all shadow-sm active:scale-95 ${isUserMenuOpen ? 'border-indigo-600' : 'border-transparent bg-gray-100 dark:bg-slate-800 hover:border-indigo-600'}`}
//             >
//               {user?.photoURL ? (
//                 <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
//               ) : (
//                 <User size={20} className="text-gray-500" />
//               )}
//             </button>

//             {isUserMenuOpen && (
//               <div className="absolute top-12 right-0 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 py-2 z-[110]" dir="rtl">
//                 {user ? (
//                   <>
//                     <div className="px-4 py-3 border-b dark:border-slate-800 mb-1 text-right">
//                       {/* ✅ گوهۆڕینا سەرەکی ل ڤێرەیە */}
//                       <p className="text-[12px] font-black dark:text-white truncate">
//                         {dbUserData?.displayName || user.displayName || "کڕیار"}
//                       </p>
//                       <p className="text-[10px] text-gray-500 truncate font-medium">{user.email}</p>
//                     </div>
//                     <Link to="/userprofile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
//                       <User size={18} className="text-indigo-500" /> پڕۆفایلێ من
//                     </Link>
//                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold transition text-right">
//                       <LogOut size={18} /> چوونەدەر
//                     </button>
//                   </>
//                 ) : (
//                   <Link to="/login" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition">
//                     <User size={18} className="text-indigo-600" /> دروستکرنا هژمارێ
//                   </Link>
//                 )}
//               </div>
//             )}
//           </div>

//         </div>
//       </div>

//       {/* Overlay */}
//       {(isSettingOpen || isNotifOpen || isUserMenuOpen) && (
//         <div className="fixed inset-0 z-[100]" onClick={() => {setIsSettingOpen(false); setIsNotifOpen(false); setIsUserMenuOpen(false);}}></div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;