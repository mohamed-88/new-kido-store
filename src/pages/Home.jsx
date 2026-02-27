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