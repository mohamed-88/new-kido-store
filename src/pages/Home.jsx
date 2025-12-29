import React, { useState, useContext, useEffect, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { 
  ShoppingBag, X, Timer, CheckCircle2, 
  ShoppingCart, ChevronRight, ChevronLeft, Star, Tag, Search
} from 'lucide-react';

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(expiryDate) - new Date();
    if (difference <= 0) return null;
    return {
      H: Math.floor((difference / (1000 * 60 * 60)) % 24),
      M: Math.floor((difference / 1000 / 60) % 60),
      S: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (!remaining) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 bg-red-500/90 backdrop-blur-md text-white px-2 py-1.5 rounded-xl font-mono text-[10px] font-black shadow-lg animate-pulse">
      <Timer size={12} />
      <span>{timeLeft.H.toString().padStart(2, '0')}:{timeLeft.M.toString().padStart(2, '0')}:{timeLeft.S.toString().padStart(2, '0')}</span>
    </div>
  );
};

const Home = () => {
  // وەرگرتنا searchQuery ژ کۆنتێکستی چونکە د ناڤ Navbar دایە
  const { products, addToCart, updateProduct, searchQuery } = useContext(ShopContext);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getDiscountedPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    if (d <= 0) return p;
    return p - (p * (d / 100));
  };

  // فلتەرکرنا بەرهەمان ل دویڤ سێرچا د ناڤ Navbar دا
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let items = [...products].reverse();
    
    if (searchQuery && searchQuery.trim() !== "") {
      items = items.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return items;
  }, [products, searchQuery]);

  const allGalleryImages = useMemo(() => {
    if (!selectedProduct) return [];
    let imgs = [];
    if (selectedColor && selectedProduct.colorImages?.[selectedColor]) {
      imgs = [...(Array.isArray(selectedProduct.colorImages[selectedColor]) ? selectedProduct.colorImages[selectedColor] : [selectedProduct.colorImages[selectedColor]])];
    }
    const generalImages = selectedProduct.images || [];
    const finalGallery = [...imgs, ...generalImages];
    return finalGallery.length > 0 ? finalGallery : [selectedProduct.image];
  }, [selectedProduct, selectedColor]);

  useEffect(() => {
    if (selectedProduct) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setActiveImgIndex(0);
    setError("");
  };

  const handleAddToCart = () => {
    if (selectedProduct.sizes?.length > 0 && !selectedSize) {
      setError("تکایە سایز هەڵبژێرە");
      return;
    }
    
    const isExpired = selectedProduct.expiryDate && new Date(selectedProduct.expiryDate) < new Date();
    const currentDiscount = isExpired ? 0 : selectedProduct.discount;

    const cartItem = {
      id: `${selectedProduct.id}-${selectedColor}-${selectedSize}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: getDiscountedPrice(selectedProduct.price, currentDiscount),
      selectedSize: selectedSize,
      selectedColor: selectedColor || "Default",
      image: allGalleryImages[activeImgIndex] || selectedProduct.image,
      quantity: 1
    };
    addToCart(cartItem);
    setSelectedProduct(null);
  };

  return (
    <div className="pb-24 px-4 md:px-8 max-w-[1500px] mx-auto font-sans text-right" dir="rtl">
      
      {/* Hero Header - بێ سێرچ بار چونکە چوو بۆ ناڤبارێ */}
      <div className={`py-12 text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-4xl md:text-5xl font-black dark:text-white mb-4 tracking-tighter italic">KIDDO <span className="text-indigo-600">COLLECTION</span></h1>
        <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-lg shadow-indigo-500/50"></div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
        {filteredProducts.map((product, index) => {
          const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();
          const currentDiscount = isExpired ? 0 : product.discount;
          const hasDiscount = currentDiscount > 0;
          const finalPrice = getDiscountedPrice(product.price, currentDiscount);

          return (
            <div 
              key={product.id} 
              onClick={() => handleOpenModal(product)} 
              style={{ transitionDelay: `${index * 50}ms` }}
              className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-slate-800 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 cursor-pointer relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              {/* Image Container - 1:1 Aspect Ratio */}
              <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-800">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  {hasDiscount && (
                    <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-xl animate-bounce">
                      <Tag size={12} /> %{currentDiscount} داشکاندن
                    </div>
                  )}
                  {hasDiscount && product.expiryDate && (
                    <CountdownTimer 
                      expiryDate={product.expiryDate} 
                      onExpire={() => updateProduct(product.id, { discount: 0 })} 
                    />
                  )}
                </div>
                
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
                
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl text-yellow-500 shadow-sm">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-black text-lg dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                  <p className="text-[11px] text-gray-400 font-bold line-clamp-2 leading-relaxed h-8 mt-1">
                    {product.description || "هیچ وەسفەک نەیێ زێدەکرینە بۆ ڤی بەرهەمی"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {product.colors?.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: c.toLowerCase() }}></div>
                    ))}
                  </div>
                  {product.sizes?.length > 0 && (
                    <span className="text-[9px] font-black text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      +{product.sizes.length} سایز
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col text-right">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through font-bold decoration-red-400">
                        {Number(product.price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {finalPrice.toLocaleString()} <span className="text-[10px] opacity-60 uppercase">Iqd</span>
                    </span>
                  </div>
                  <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg transition-all group-hover:rotate-[360deg] duration-700">
                    <ShoppingCart size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search Result */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-32 animate-in fade-in duration-500">
          <div className="bg-gray-100 dark:bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="font-black dark:text-white text-2xl mb-2">چ بەرهەم نەهاتنە دیتن!</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">ب ناڤەکێ دی تاقی بکە</p>
        </div>
      )}

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-t-[3rem] md:rounded-[4rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in duration-300">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 z-[600] p-3 bg-white dark:bg-slate-800 shadow-2xl rounded-full dark:text-white hover:rotate-90 transition-all">
              <X size={24} />
            </button>

            {/* SLIDER */}
            <div className="md:w-1/2 relative h-[40vh] md:h-auto bg-gray-100 dark:bg-slate-800">
              <img src={allGalleryImages[activeImgIndex]} className="w-full h-full object-cover" />
              {allGalleryImages.length > 1 && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={(e) => {e.stopPropagation(); setActiveImgIndex(prev => prev === 0 ? allGalleryImages.length - 1 : prev - 1)}} className="p-4 bg-white/60 backdrop-blur-md rounded-full text-indigo-900 hover:bg-white transition-all shadow-lg"><ChevronRight size={24} /></button>
                  <button onClick={(e) => {e.stopPropagation(); setActiveImgIndex(prev => (prev + 1) % allGalleryImages.length)}} className="p-4 bg-white/60 backdrop-blur-md rounded-full text-indigo-900 hover:bg-white transition-all shadow-lg"><ChevronLeft size={24} /></button>
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="md:w-1/2 p-8 md:p-14 overflow-y-auto">
              <div className="mb-8 text-right">
                <h2 className="text-3xl font-black dark:text-white mb-4 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 justify-end">
                   <span className="text-4xl font-black text-indigo-600">
                    {getDiscountedPrice(selectedProduct.price, (selectedProduct.expiryDate && new Date(selectedProduct.expiryDate) < new Date() ? 0 : selectedProduct.discount)).toLocaleString()} <span className="text-sm">IQD</span>
                  </span>
                  {(selectedProduct.discount > 0 && !(selectedProduct.expiryDate && new Date(selectedProduct.expiryDate) < new Date())) && (
                    <span className="text-lg text-gray-400 line-through font-bold opacity-50">
                      {Number(selectedProduct.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-10 text-right">
                {selectedProduct.colors?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">ڕەنگێ بەردەست</p>
                    <div className="flex flex-wrap gap-4 justify-end">
                      {selectedProduct.colors.map(color => {
                        const codes = { Red:'#ef4444', Blue:'#3b82f6', Black:'#000000', White:'#ffffff', Pink:'#ec4899', Gray:'#6b7280', Navy:'#1e3a8a', Green:'#22c55e' };
                        return (
                          <button key={color} onClick={() => { setSelectedColor(color); setActiveImgIndex(0); }} className={`w-14 h-14 rounded-[1.5rem] border-4 transition-all flex items-center justify-center ${selectedColor === color ? 'border-indigo-600 scale-110 shadow-xl' : 'border-transparent shadow-sm'}`} style={{ backgroundColor: codes[color] || color.toLowerCase() }}>
                            {selectedColor === color && <CheckCircle2 size={24} className={color === 'White' ? 'text-black' : 'text-white'} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedProduct.sizes?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      {error && <span className="text-xs text-red-500 font-black animate-bounce">{error}</span>}
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">سایزێ هەلبژێرە</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => {setSelectedSize(size); setError("");}} className={`py-4 rounded-[1.5rem] border-2 font-black text-sm transition-all ${selectedSize === size ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'border-gray-100 dark:border-slate-800 dark:text-white hover:border-indigo-200'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleAddToCart} className="w-full mt-12 bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 active:scale-95 transition-all">
                <ShoppingBag size={24} /> زێدەکرن بۆ سەلێ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;