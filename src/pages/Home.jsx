import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { X, Plus, Timer, Check, Tag, Clock, Share, Info } from 'lucide-react'; // Share و Info زێدەکرن

// --- ١. تایمەر و سکێلیتۆن (وەک خۆیە) ---
const DiscountTimer = ({ expiryDate, onExpire }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    if (difference <= 0) return null;
    return {
      d: Math.floor(difference / (1000 * 60 * 60 * 24)),
      h: Math.floor((difference / (1000 * 60 * 60)) % 24),
      m: Math.floor((difference / 1000 / 60) % 60),
      s: Math.floor((difference / 1000) % 60),
    };
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining && onExpire) { clearInterval(timer); onExpire(); }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);
  if (!timeLeft) return null;
  return <span className="font-black">{timeLeft.d} {timeLeft.h}:{timeLeft.m}:{timeLeft.s}</span>;
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-slate-800">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-950 overflow-hidden">
        <div className="aspect-[2/3] w-full bg-gray-100 dark:bg-slate-900 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-2 w-3/4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// --- ٢. سڵایدەرێ وێنەیان (iPhone Style) ---
const TouchGallery = ({ images = [], productName, aspectRatio = "aspect-[2/3]" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const allImages = useMemo(() => images.filter(img => img && typeof img === 'string'), [images]);
  
  useEffect(() => { setCurrentIndex(0); }, [images]);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (distance > 50 && currentIndex < allImages.length - 1) setCurrentIndex(prev => prev + 1);
    else if (distance < -50 && currentIndex > 0) setCurrentIndex(prev => prev - 1);
    touchStartX.current = null;
  };

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-gray-50 dark:bg-slate-900 touch-pan-y`}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, direction: 'ltr' }}>
        {allImages.map((img, i) => (
          <img key={i} src={img} className="h-full w-full flex-shrink-0 object-cover" alt="" />
        ))}
      </div>
      {allImages.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-20">
          {allImages.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const { products, addToCart, searchQuery } = useContext(ShopContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products && products.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let items = [...products].reverse();
    if (searchQuery?.trim()) {
      items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  }, [products, searchQuery]);

  const displayImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedColor && selectedProduct.colorImages?.[selectedColor]) {
      return selectedProduct.colorImages[selectedColor];
    }
    return [selectedProduct.image, ...(selectedProduct.images || [])];
  }, [selectedProduct, selectedColor]);

  // فۆنکشنا Share ب ستایلێ iPhone
  const handleShare = async () => {
    const shareData = {
      title: selectedProduct.name,
      text: `سەیری ئەڤ بەرهەمە بکە: ${selectedProduct.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) { console.log(err); }
  };

  return (
    <div className="mx-auto max-w-[1600px] pb-32" dir="rtl">
      {isLoading ? <SkeletonGrid /> : (
        <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-slate-800 border-b dark:border-slate-800">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative bg-white dark:bg-slate-950 overflow-hidden group" onClick={() => setSelectedProduct(product)}>
              <TouchGallery images={[product.image, ...(product.images || [])]} productName={product.name} />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                <h3 className="text-[10px] font-bold text-white truncate opacity-90">{product.name}</h3>
                <p className="text-sm font-black text-yellow-400 mt-0.5">{Number(product.price).toLocaleString()} IQD</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[3000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <button onClick={() => { setSelectedProduct(null); setError(""); setSelectedSize(""); setSelectedColor(""); }} className="p-2 dark:text-white bg-gray-100 dark:bg-slate-800 rounded-full active:scale-90 transition-all">
              <X size={24} />
            </button>
            <span className="text-[11px] font-black uppercase tracking-widest dark:text-white">Product Details</span>
            <button onClick={handleShare} className="p-2 dark:text-white bg-gray-100 dark:bg-slate-800 rounded-full active:scale-90 transition-all">
              {copied ? <Check size={20} className="text-green-500" /> : <Share size={20} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <TouchGallery images={displayImages} productName={selectedProduct.name} aspectRatio="aspect-square" />
            
            <div className="p-8 space-y-10 text-right">
              <div className="space-y-2">
                <h2 className="text-3xl font-black dark:text-white tracking-tighter">{selectedProduct.name}</h2>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 italic">{Number(selectedProduct.price).toLocaleString()} <small className="text-xs not-italic">IQD</small></p>
              </div>

              {/* --- بەشێ Description (نوو) --- */}
              {selectedProduct.description && (
                <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-[2rem] border dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">شیکارکرنا بەرهەمی</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* ڕەنگ و سایز */}
              {selectedProduct.colors?.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ڕەنگێن بەردەست</span>
                  <div className="flex flex-wrap gap-4">
                    {selectedProduct.colors.map(c => (
                      <button key={c} onClick={() => { setSelectedColor(c); setError(""); }} 
                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === c ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-950 scale-110 shadow-lg' : 'border-gray-200 dark:border-slate-800'}`} 
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.sizes?.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سایزێ هەلبژێرە</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(s => (
                      <button key={s} onClick={() => { setSelectedSize(s); setError(""); }}
                        className={`text-xs font-black px-8 py-4 border-2 rounded-2xl transition-all ${selectedSize === s ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xl' : 'border-gray-200 dark:border-slate-800 dark:text-white'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Button */}
          <div className="p-6 border-t dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
            <div className="max-w-md mx-auto relative">
              {error && <p className="absolute -top-10 inset-x-0 text-center text-red-500 text-[11px] font-black bg-red-50 dark:bg-red-900/20 py-1 rounded-full">{error}</p>}
              <button onClick={() => {
                if (selectedProduct.sizes?.length > 0 && !selectedSize) return setError("تکایە سایزی هەلبژێرە");
                if (selectedProduct.colors?.length > 0 && !selectedColor) return setError("تکایە ڕەنگی هەلبژێرە");
                addToCart({ ...selectedProduct, selectedSize, selectedColor, quantity: 1 });
                setSelectedProduct(null);
              }} className="w-full h-16 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] shadow-2xl shadow-indigo-500/40 active:scale-[0.97] transition-all">
                Add to Shopping Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;




// import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import { X, Plus, Timer, Check, Tag, Clock, Share2 } from 'lucide-react';

// // --- ١. فەنکشنا تایمەرێ لایڤ ---
// const DiscountTimer = ({ expiryDate, onExpire }) => {
//   const calculateTimeLeft = () => {
//     const difference = +new Date(expiryDate) - +new Date();
//     if (difference <= 0) return null;
//     return {
//       d: Math.floor(difference / (1000 * 60 * 60 * 24)),
//       h: Math.floor((difference / (1000 * 60 * 60)) % 24),
//       m: Math.floor((difference / 1000 / 60) % 60),
//       s: Math.floor((difference / 1000) % 60),
//     };
//   };

//   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const remaining = calculateTimeLeft();
//       setTimeLeft(remaining);
//       if (!remaining && onExpire) {
//         clearInterval(timer);
//         onExpire(); // نووکرنەڤەیا شاشێ دەمێ کات ب سەر دچیت
//       }
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [expiryDate, onExpire]);

//   if (!timeLeft) return null;

//   return (
//     <span className="font-black">
//       {timeLeft.d} {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
//     </span>
//   );
// };

// // --- ٢. سکرینێ بارکرنێ (YouTube Style Skeleton) ---
// const SkeletonGrid = () => (
//   <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-slate-800">
//     {[1, 2, 3, 4, 5, 6].map((i) => (
//       <div key={i} className="bg-white dark:bg-slate-950 overflow-hidden">
//         <div className="aspect-[2/3] w-full bg-gray-100 dark:bg-slate-900 animate-pulse" />
//         <div className="p-4 space-y-3">
//           <div className="h-2 w-3/4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
//           <div className="h-3 w-1/2 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // --- ٣. سڵایدەرێ وێنەیان (iPhone Style Swipe) ---
// const TouchGallery = ({ images = [], productName, aspectRatio = "aspect-[2/3]" }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const touchStartX = useRef(null);
//   const touchEndX = useRef(null);
//   const allImages = useMemo(() => images.filter(Boolean), [images]);

//   const handleTouchStart = (e) => {
//     touchStartX.current = e.targetTouches[0].clientX;
//   };

//   const handleTouchMove = (e) => {
//     touchEndX.current = e.targetTouches[0].clientX;
//   };

//   const handleTouchEnd = () => {
//     if (!touchStartX.current || !touchEndX.current) return;
//     const distance = touchStartX.current - touchEndX.current;
//     const isLeftSwipe = distance > 50;
//     const isRightSwipe = distance < -50;

//     if (isLeftSwipe && currentIndex < allImages.length - 1) {
//       setCurrentIndex(prev => prev + 1);
//     } else if (isRightSwipe && currentIndex > 0) {
//       setCurrentIndex(prev => prev - 1);
//     }

//     touchStartX.current = null;
//     touchEndX.current = null;
//   };

//   return (
//     <div className={`relative ${aspectRatio} w-full overflow-hidden bg-gray-50 dark:bg-slate-900 touch-pan-y`}
//       onTouchStart={handleTouchStart} 
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}>
      
//       <div className="flex h-full w-full transition-transform duration-500 ease-out"
//         style={{ transform: `translateX(${currentIndex * 100}%)` }}>
//         {allImages.map((img, i) => (
//           <img key={i} src={img} loading="lazy" className="h-full w-full flex-shrink-0 object-cover" alt={productName} />
//         ))}
//       </div>

//       {/* Indicators (iPhone Style) */}
//       {allImages.length > 1 && (
//         <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-20">
//           {allImages.map((_, i) => (
//             <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const Home = () => {
//   const { products, addToCart, searchQuery } = useContext(ShopContext);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedColor, setSelectedColor] = useState("");
//   const [error, setError] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (products && products.length > 0) {
//       const timer = setTimeout(() => setIsLoading(false), 1200);
//       return () => clearTimeout(timer);
//     }
//   }, [products]);

//   const filteredProducts = useMemo(() => {
//     if (!products) return [];
//     let items = [...products].reverse();
//     if (searchQuery?.trim()) {
//       items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
//     }
//     return items;
//   }, [products, searchQuery]);

//   const handleShare = async () => {
//     try {
//       if (navigator.share) {
//         await navigator.share({ title: selectedProduct.name, url: window.location.href });
//       } else {
//         throw new Error();
//       }
//     } catch {
//       await navigator.clipboard.writeText(window.location.href);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-[1600px] pb-32" dir="rtl">
      
//       {isLoading ? (
//         <SkeletonGrid />
//       ) : (
//         <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-slate-800 border-b dark:border-slate-800">
//           {filteredProducts.map((product) => {
//             const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
//             const activeDiscount = isExpired ? 0 : (Number(product.discount) || 0);
//             const originalPrice = Number(product.price) || 0;
//             const finalPrice = originalPrice - (originalPrice * (activeDiscount / 100));

//             return (
//               <div key={product.id} className="relative bg-white dark:bg-slate-950 overflow-hidden group">
//                 <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
//                   <TouchGallery images={[product.image, ...(product.images || [])]} productName={product.name} />
//                 </div>
                
//                 {activeDiscount > 0 && (
//                   <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
//                     <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-sm shadow-lg flex items-center gap-1">
//                       <Tag size={10} /> %{activeDiscount} OFF
//                     </div>
//                     {product.expiryDate && (
//                       <div className="bg-black/60 backdrop-blur-md text-white text-[8px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 animate-pulse border border-white/10">
//                         <Clock size={8} className="text-red-400" />
//                         <DiscountTimer expiryDate={product.expiryDate} />
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-white pointer-events-none">
//                   <h3 className="text-[10px] font-bold uppercase truncate opacity-80 mb-1 tracking-tight">{product.name}</h3>
//                   <div className="flex items-end gap-2">
//                     <span className="text-sm font-black italic text-yellow-400 drop-shadow-sm">
//                       {finalPrice.toLocaleString()} <small className="text-[8px] not-italic opacity-70">IQD</small>
//                     </span>
//                     {activeDiscount > 0 && (
//                       <span className="text-[9px] text-gray-400 line-through opacity-60 mb-0.5 italic">
//                         {originalPrice.toLocaleString()}
//                       </span>
//                     )}
//                   </div>
//                 </div>
                
//                 <button onClick={() => setSelectedProduct(product)} className="absolute top-3 left-3 h-8 w-8 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center active:scale-90 transition-all">
//                   <Plus size={16} />
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {selectedProduct && (
//         <div className="fixed inset-0 z-[3000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500">
//           <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
//             <button onClick={() => { setSelectedProduct(null); setError(""); setSelectedSize(""); setSelectedColor(""); }} className="p-2 dark:text-white">
//               <X size={28} />
//             </button>
//             <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white text-center flex-1">Product Details</span>
//             <div className="w-10" />
//           </div>

//           <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
//             <TouchGallery images={[selectedProduct.image, ...(selectedProduct.images || [])]} productName={selectedProduct.name} aspectRatio="aspect-square" />
//             <div className="p-8 space-y-10 text-right">
//               <div className="space-y-4">
//                 <h2 className="text-3xl font-black dark:text-white uppercase leading-none tracking-tighter">{selectedProduct.name}</h2>
                
//                 {(() => {
//                   const isExpired = selectedProduct.expiryDate ? new Date(selectedProduct.expiryDate) < new Date() : false;
//                   const activeDiscount = isExpired ? 0 : (Number(selectedProduct.discount) || 0);
//                   const originalPrice = Number(selectedProduct.price) || 0;
//                   const finalPrice = originalPrice - (originalPrice * (activeDiscount / 100));

//                   return (
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-4">
//                         <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
//                           {finalPrice.toLocaleString()} <small className="text-sm">IQD</small>
//                         </span>
//                         {activeDiscount > 0 && (
//                           <span className="text-lg text-gray-400 line-through font-bold">
//                             {originalPrice.toLocaleString()}
//                           </span>
//                         )}
//                       </div>

//                       {activeDiscount > 0 && selectedProduct.expiryDate && (
//                         <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-3 rounded-2xl text-xs border border-red-100 dark:border-red-900/30">
//                           <Timer size={14} className="animate-pulse" />
//                           <span className="font-bold">داشکاندن ب دوماهی دهێت ل:</span>
//                           <DiscountTimer 
//                             expiryDate={selectedProduct.expiryDate} 
//                             onExpire={() => setSelectedProduct({...selectedProduct})} 
//                           />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })()}
//               </div>

//               <div className="space-y-2 border-t pt-6 dark:border-slate-800">
//                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</span>
//                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
//                   {selectedProduct.description || "High-quality material with modern design."}
//                 </p>
//               </div>

//               {selectedProduct.colors?.length > 0 && (
//                 <div className="space-y-4">
//                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Colors</span>
//                   <div className="flex flex-wrap gap-4">
//                     {selectedProduct.colors.map(c => (
//                       <button key={c} onClick={() => setSelectedColor(c)} 
//                         className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === c ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent shadow-sm'}`} 
//                         style={{ backgroundColor: c }} />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedProduct.sizes?.length > 0 && (
//                 <div className="space-y-4">
//                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Size</span>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedProduct.sizes.map(s => (
//                       <button key={s} onClick={() => { setSelectedSize(s); setError(""); }}
//                         className={`text-xs font-black px-8 py-4 border-2 transition-all ${selectedSize === s ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-lg' : 'border-gray-200 dark:border-slate-800 dark:text-white'}`}>
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-row-reverse gap-3">
//             <button onClick={handleShare} className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-gray-300 rounded-2xl active:scale-90 transition-all flex-shrink-0">
//               {copied ? <Check size={24} className="text-green-500" /> : <Share2 size={24} />}
//             </button>

//             <div className="flex-1 relative">
//               {error && <p className="absolute -top-8 right-0 text-red-500 text-[10px] font-black animate-pulse">{error}</p>}
//               <button onClick={() => {
//                 if (selectedProduct.sizes?.length > 0 && !selectedSize) return setError("Select Size");
//                 addToCart({ ...selectedProduct, selectedSize, selectedColor, quantity: 1 });
//                 setSelectedProduct(null);
//                 setSelectedSize("");
//               }} className="w-full h-16 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl active:scale-[0.98] transition-all">
//                 Add to Shopping Bag
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;