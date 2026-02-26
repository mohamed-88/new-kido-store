import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Plus, Timer } from 'lucide-react';

const Home = () => {
  const { products, isInWishlist, toggleWishlist, loading } = useContext(ShopContext);
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].reverse(); 
  }, [products]);

  const getTimeLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-10 px-2" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-md w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-4" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2">
        {sortedProducts.map((product) => {
          const timeLeft = getTimeLeft(product.expiryDate);
          const hasActiveDiscount = timeLeft !== null && product.discount > 0;
          
          // --- چارەسەریا وێنەی ---
          // ئەگەر ڕەنگەک هاتە هەلبژارتن، وێنەیێ وی ڕەنگی نیشان بدە، ئەگەر نە وێنەیێ ئێکەم یێ گشتی
          const currentImg = selectedImages[product.id] || (product.images && product.images[0]) || product.image || "https://via.placeholder.com/300";

          const newPrice = hasActiveDiscount 
            ? product.price - (product.price * product.discount / 100) 
            : product.price;

          return (
            <div key={product.id} className="flex flex-col group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
              
              <div className="relative aspect-square overflow-hidden cursor-pointer bg-slate-50" onClick={() => navigate(`/product/${product.id}`)}>
                <img 
                  src={currentImg} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
                />
                
                {hasActiveDiscount && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg z-10">
                    %{product.discount} داشکاندن
                  </div>
                )}
                
                {hasActiveDiscount && (
                  <div className="absolute bottom-2 inset-x-2 bg-black/50 backdrop-blur-md text-white text-[10px] py-1.5 rounded-xl flex items-center justify-center gap-1 font-mono z-10" dir='ltr'>
                    <Timer size={12} className="text-orange-400 animate-pulse" />
                    <span>{timeLeft.hours}h</span>:<span>{timeLeft.minutes}m</span>:<span>{timeLeft.seconds}s</span>
                  </div>
                )}

                <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-2 left-2 p-2 rounded-full bg-white/60 dark:bg-black/20 backdrop-blur-md z-10">
                  <Heart size={16} className={`${isInWishlist?.(product.id) ? "fill-red-500 text-red-500" : "text-slate-800 dark:text-white"}`} />
                </button>
              </div>

              <div className="p-3 space-y-2">
                <div className="text-right leading-tight">
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold text-[13px] truncate">{product.name}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-0.5 h-4">{product.description || "هیچ وەسفەک نینە"}</p>
                </div>

                {/* ڕەنگێن بەرهەمی دگەل لۆجیکێ نوو یێ وێنەی */}
                <div className="flex flex-wrap gap-1.5 py-0.5">
                  {product.colors?.map((colorName, idx) => (
                    <button 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation();
                        // لۆجیکێ نوو: ئەگەر وێنەیێ وی ڕەنگی هەبیت د colorImages دا، وی نیشان بدە
                        if (product.colorImages && product.colorImages[colorName]) {
                          setSelectedImages(prev => ({ ...prev, [product.id]: product.colorImages[colorName][0] }));
                        }
                      }}
                      className="w-4 h-4 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm transition-transform active:scale-75"
                      style={{ backgroundColor: product.colorCodes?.[colorName] || colorName }}
                      title={colorName}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col text-right">
                    {hasActiveDiscount ? (
                      <>
                        <p className="text-red-600 dark:text-red-400 font-black text-sm leading-none">{Number(newPrice).toLocaleString()} <span className="text-[8px]">IQD</span></p>
                        <p className="text-slate-400 line-through text-[9px] mt-1 italic opacity-70">{Number(product.price).toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{Number(product.price).toLocaleString()} <span className="text-[9px]">IQD</span></p>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} className="bg-slate-900 dark:bg-indigo-600 text-white p-2 rounded-lg transition-all active:scale-90"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {(!products || products.length === 0) && !loading && (
        <div className="py-40 text-center text-slate-400 opacity-30">
          <ShoppingBag size={40} className="mx-auto mb-2" />
          <p>هیچ بەرهەم نینن</p>
        </div>
      )}
    </div>
  );
};

export default Home;



// import React, { useContext } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import { useNavigate } from 'react-router-dom';
// import { ShoppingBag, Heart } from 'lucide-react';

// const Home = () => {
//   const { products, isInWishlist, toggleWishlist, loading } = useContext(ShopContext);
//   const navigate = useNavigate();
//   console.log("بەرهەمێ یەکێ:", products[0]);

//   // --- ١. پشکا Skeleton Loading (دەمێ داتا بار دبن) ---
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-slate-950 p-2">
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
//           {[...Array(10)].map((_, i) => (
//             <div key={i} className="flex flex-col gap-2">
//               <div className="aspect-square bg-gray-100 dark:bg-slate-900 rounded-xl animate-pulse" />
//               <div className="h-4 bg-gray-100 dark:bg-slate-900 rounded w-3/4 self-end animate-pulse" />
//               <div className="h-4 bg-gray-100 dark:bg-slate-900 rounded w-1/2 self-end animate-pulse" />
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      
//       {/* Grid یێ بەرهەمان */}
//       <div className="p-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
//         {products && products.map((product) => (
//           <div key={product.id} className="flex flex-col group">
            
//             {/* وێنەیێ بەرهەمی */}
//             <div 
//               className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-900 rounded-2xl cursor-pointer shadow-sm border dark:border-slate-800"
//               onClick={() => navigate(`/product/${product.id}`)}
//             >
//               <img 
//                   src={
//                     product.image && product.image !== "" 
//                       ? product.image 
//                       : (product.images && product.images.length > 0 ? product.images[0] : null)
//                   } 
//                   alt={product.name}
//                   loading="lazy"
//                   onError={(e) => { 
//                     e.target.onerror = null; // ڕێگری ل زڤڕینا بێ دوماهیک دکەت
//                     e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; 
//                   }}
//                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//             </div>

//             {/* زانیاریێن بەرهەمی */}
//             <div className="py-3 px-1 text-right" dir="rtl">
//               <div className="flex justify-between items-start gap-2">
//                 <h3 className="text-gray-900 dark:text-gray-100 font-bold text-sm md:text-base leading-tight truncate flex-1">
//                   {product.name}
//                 </h3>
                
//                 {/* دوکمەیا Wishlist ب شێوازەکێ کو Infinite Loop دروست نەکەت */}
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation(); // ڕێگری ل چوونە ناو لاپەڕێ بەرهەمی دکەت
//                     if (typeof toggleWishlist === 'function') {
//                       toggleWishlist(product);
//                     }
//                   }} 
//                   className="shrink-0 pt-0.5 outline-none"
//                 >
//                   <Heart 
//                     size={20} 
//                     className={`transition-all duration-300 ${
//                       isInWishlist && isInWishlist(product.id) 
//                         ? "fill-red-500 text-red-500 scale-110" 
//                         : "text-gray-300 dark:text-gray-600 hover:text-red-400"
//                     }`} 
//                   />
//                 </button>
//               </div>
              
//               <div className="flex items-center justify-between mt-2.5">
//                 <p className="text-indigo-600 dark:text-indigo-400 font-black text-base md:text-lg">
//                   {/* پشکنین دکەین کا قیمت یێ هەی و یێ دروستە */}
//                   {(Number(product.price) || 0).toLocaleString()} <span className="text-[10px] font-bold">IQD</span>
//                 </p>
                
//                 <button 
//                   onClick={() => navigate(`/product/${product.id}`)}
//                   className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group/btn"
//                 >
//                   <ShoppingBag size={18} className="text-gray-600 dark:text-gray-400 group-hover/btn:text-indigo-600" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ئەگەر لیستا بەرهەمان یا ڤالا بیت */}
//       {(!products || products.length === 0) && (
//         <div className="py-32 text-center flex flex-col items-center gap-4">
//           <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
//             <ShoppingBag size={40} className="text-gray-200 dark:text-gray-700" />
//           </div>
//           <p className="text-gray-400 font-medium italic">چ بەرهەم نەهاتنە دیتن</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;