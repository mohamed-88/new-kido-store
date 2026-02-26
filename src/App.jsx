import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import UserLogin from './pages/UserLogin';
import UserProfile from './pages/UserProfile';
import Orders from './pages/Orders';
import LoginAdmin from './pages/LoginAdmin';

// Components
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav'; // Import کرنا نوو
import CartDrawer from './components/CartDrawer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAdmin') === 'true');
  }, [location]);

  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 flex flex-col font-bold font-sans" dir="lrt">
      
      {!isAdminPage && <Navbar setIsCartOpen={setIsCartOpen} />}

      <main className={`flex-grow w-full max-w-7xl mx-auto ${!isAdminPage ? 'pb-24 md:pb-10 px-0 md:px-4' : ''}`}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<LoginAdmin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/admin" element={
              (localStorage.getItem('isAdmin') === 'true' || isAuthenticated) 
              ? <Admin /> 
              : <Navigate to="/admin-login" replace />
            } />
          </Routes>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {!isAdminPage && <MobileNav setIsCartOpen={setIsCartOpen} />}

      {!isAdminPage && (
        <footer className="hidden md:block py-10 text-center border-t dark:border-slate-800">
          <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">© 2026 Kido Store</p>
        </footer>
      )}
    </div>
  );
}

export default App;



// import React, { useState, useEffect, useContext } from 'react';
// import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// import { Home as HomeIcon, Heart, ShoppingBag, User, Truck } from 'lucide-react';

// // Pages
// import Home from './pages/Home';
// import Admin from './pages/Admin';
// import Login from './pages/Login';
// import OrderTracking from './pages/OrderTracking';
// import Checkout from './pages/Checkout';
// import ProductDetails from './pages/ProductDetails';
// import Wishlist from './pages/Wishlist';
// import UserLogin from './pages/UserLogin';
// import UserProfile from './pages/UserProfile';
// import Orders from './pages/Orders';


// // Components
// import Navbar from './components/Navbar';
// import CartDrawer from './components/CartDrawer';
// import { ShopContext } from './context/ShopContext';

// function App() {
//   const { wishlist, getCartCount, user } = useContext(ShopContext); // بکارئینانا ستەیتێن دروست
//   const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAdmin') === 'true');
//   const [isCartOpen, setIsCartOpen] = useState(false);
  
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     setIsAuthenticated(localStorage.getItem('isAdmin') === 'true');
//   }, [location]);

//   // ئایا لاپەڕە یێ ئەدمینی یە؟
//   const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

//   // ئەژمارکرنا کالایێن د سەبەتێ دا
//   const cartCount = getCartCount();

//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 flex flex-col font-bold">
      
//       {/* ١. ناڤبارا سەرەکی */}
//       {!isAdminPage && <Navbar setIsCartOpen={setIsCartOpen} />}

//       {/* ٢. بەشێ ناوەڕۆکێ (Main Content) */}
//       <main className={`flex-grow w-full max-w-7xl mx-auto ${!isAdminPage ? 'pb-24 md:pb-10 px-0 md:px-4' : ''}`}>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/track" element={<OrderTracking />} />
//           <Route path="/checkout" element={<Checkout />} />
//           <Route path="/product/:id" element={<ProductDetails />} />
//           <Route path="/wishlist" element={<Wishlist />} />
//           <Route path="/userlogin" element={<UserLogin />} />
//           <Route path="/userprofile" element={<UserProfile />} />
//           <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
//           <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/login" replace />} />
//           <Route path='/orders' element={<Orders />} />
//         </Routes>
//       </main>

//       <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

//       {/* ٣. فۆتەر (Desktop Only) */}
//       {!isAdminPage && (
//         <footer className="hidden md:block py-10 text-center border-t dark:border-slate-800">
//           <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">© 2026 Kido Store</p>
//         </footer>
//       )}

//       {/* ٤. مۆبایل بۆتۆم ناڤ (Bottom Navigation) */}
//       {!isAdminPage && (
//         <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t dark:border-slate-800 px-6 py-3 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          
//           {/* Home */}
//           <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
//             <HomeIcon size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
//             <span className="text-[10px] font-black">سەرەکی</span>
//           </button>

//           {/* Wishlist */}
//           <button onClick={() => navigate('/wishlist')} className={`flex flex-col items-center gap-1 relative transition-all ${location.pathname === '/wishlist' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
//             <Heart size={22} strokeWidth={location.pathname === '/wishlist' ? 2.5 : 2} />
//             {wishlist.length > 0 && (
//               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-900">
//                 {wishlist.length}
//               </span>
//             )}
//             <span className="text-[10px] font-black">حەزژێکرن</span>
//           </button>

//           {/* Cart Center Button */}
//           <div className="relative">
//             <button 
//               onClick={() => setIsCartOpen(true)}
//               className="flex flex-col items-center justify-center -mt-14 bg-indigo-600 w-16 h-16 rounded-full text-white shadow-xl shadow-indigo-300 dark:shadow-none border-[6px] border-white dark:border-slate-950 active:scale-90 transition-all"
//             >
//               <ShoppingBag size={26} />
//               {cartCount > 0 && (
//                 <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-950 animate-bounce">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//             <span className="text-[10px] font-black text-gray-400 block text-center mt-1">سەبەتە</span>
//           </div>

//           {/* Order Tracking - من ل ڤێرە ئایکۆن گوهۆڕی بۆ Truck */}
//           <button onClick={() => navigate('/track')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/track' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
//             <Truck size={22} strokeWidth={location.pathname === '/track' ? 2.5 : 2} />
//             <span className="text-[10px] font-black">دووڤچوون</span>
//           </button>

//           {/* Profile */}
//           <button onClick={() => navigate('/userprofile')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/userprofile' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
//             <div className={`w-6 h-6 rounded-full border-2 overflow-hidden ${location.pathname === '/userprofile' ? 'border-indigo-600' : 'border-gray-400'}`}>
//               {user?.photoURL ? (
//                 <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
//               ) : (
//                 <User size={18} className="m-auto" />
//               )}
//             </div>
//             <span className="text-[10px] font-black">هژمار</span>
//           </button>

//         </div>
//       )}
//     </div>
//   );
// }

// export default App;