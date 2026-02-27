import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Heart, ShoppingBag, User, Truck } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
// زێدەکرنا فایربەیس
import { db } from '../firebase';
import { doc, onSnapshot } from "firebase/firestore";

const MobileNav = ({ setIsCartOpen }) => {
  const { wishlist, getCartCount, user } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  // ستەیت بۆ وێنەیێ داتابەیسێ
  const [dbUserImg, setDbUserImg] = useState(null);

  // وەرگرتنا وێنەی ڕاستەوخۆ ژ داتابەیسێ
  // وەرگرتنا وێنەی ڕاستەوخۆ ژ Firestore
  useEffect(() => {
    if (user?.uid) {
      // ئاماژەدان ب دۆکیۆمێنتێ یوزەری د کۆلەکشنا "users" دا
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setDbUserImg(userData.profileImg || null);
        }
      }, (error) => {
        console.error("Error fetching user profile image:", error);
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t dark:border-slate-800 px-6 py-3 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      
      {/* Home */}
      <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
        <HomeIcon size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
        <span className="text-[10px] font-black">سەرەکی</span>
      </button>

      {/* Wishlist */}
      <button onClick={() => navigate('/wishlist')} className={`flex flex-col items-center gap-1 relative transition-all ${location.pathname === '/wishlist' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
        <Heart size={22} strokeWidth={location.pathname === '/wishlist' ? 2.5 : 2} />
        {wishlist.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-900">
            {wishlist.length}
          </span>
        )}
        <span className="text-[10px] font-black">حەزژێکرن</span>
      </button>

      {/* Cart Center Button */}
      <div className="relative">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center -mt-14 bg-indigo-600 w-16 h-16 rounded-full text-white shadow-xl shadow-indigo-300 dark:shadow-none border-[6px] border-white dark:border-slate-950 active:scale-90 transition-all"
        >
          <ShoppingBag size={26} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-950 animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
        <span className="text-[10px] font-black text-gray-400 block text-center mt-1">سەبەتە</span>
      </div>

      {/* Order Tracking */}
      <button onClick={() => navigate('/track')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/track' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
        <Truck size={22} strokeWidth={location.pathname === '/track' ? 2.5 : 2} />
        <span className="text-[10px] font-black">دووڤچوون</span>
      </button>

      {/* Profile Section - وێنەیێ نوو ل ڤێرە دیار دبیت */}
      <button onClick={() => navigate('/userprofile')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/userprofile' ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
        <div className={`w-7 h-7 rounded-full border-2 overflow-hidden flex items-center justify-center ${location.pathname === '/userprofile' ? 'border-indigo-600' : 'border-gray-300 dark:border-slate-700'}`}>
          {/* ئەگەر وێنەیێ داتابەیسێ هەبیت، یان وێنەیێ گشتی یێ فایربەیس، ئەگەر نا ئایکۆن */}
          {(dbUserImg || user?.photoURL) ? (
            <img 
              src={dbUserImg || user.photoURL} 
              alt="user" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <User size={18} />
          )}
        </div>
        <span className="text-[10px] font-black">هژمار</span>
      </button>

    </div>
  );
};

export default MobileNav;