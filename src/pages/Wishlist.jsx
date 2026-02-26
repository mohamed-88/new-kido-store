import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { ShoppingCart, Trash2, Heart, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, products, toggleWishlist } = useContext(ShopContext);
  const navigate = useNavigate();

  // فلتەرکرنا بەرهەمێن د دلی دا
  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 text-right" dir="rtl">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b dark:border-slate-800">
        <h1 className="text-xl font-black dark:text-white">بەرهەمێن پاراستی</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl dark:text-white transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-full text-gray-300">
              <Heart size={50} />
            </div>
            <p className="text-gray-400 font-bold italic">تە چ بەرهەم نەپاراستینە</p>
            <button 
              onClick={() => navigate('/')}
              className="text-indigo-600 font-black text-sm underline"
            >
              بچۆ ناڤ بەرهەمان
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoriteProducts.map(product => {
              const hasDiscount = Number(product.discount) > 0;
              const finalPrice = hasDiscount 
                ? product.price - (product.price * (product.discount / 100)) 
                : product.price;

              return (
                <div key={product.id} className="flex gap-4 bg-gray-50 dark:bg-slate-900 p-3 rounded-[2rem] border dark:border-slate-800 shadow-sm relative transition-all">
                  
                  {/* وێنەیێ بەرهەمی */}
                  <div 
                    className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img src={product.images?.[0] || product.image} className="w-full h-full object-cover" alt={product.name} />
                  </div>

                  {/* زانیاری */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-black text-sm dark:text-white truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-indigo-600 font-black text-sm">{finalPrice.toLocaleString()} IQD</span>
                        {hasDiscount && <span className="text-[10px] text-gray-400 line-through">%{product.discount}-</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* ئەڤ دوکمە دێ ئێکسەر کڕیاری بەتە لاپەڕێ بەرهەمی */}
                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 bg-indigo-600 text-white text-[10px] py-2.5 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                      >
                        <ShoppingCart size={14}/> زێدەکرن بۆ سەبەتێ
                      </button>

                      {/* دوکمەیا لادانێ ژ Wishlist */}
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="p-2.5 text-red-500 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl hover:bg-red-50 transition-colors active:scale-90"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;