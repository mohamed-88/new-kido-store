import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag, X, Truck, ShieldCheck, Heart, Timer } from 'lucide-react';

const ProductDetails = () => {
  const { id, productId } = useParams();
  const activeId = id || productId;
  const navigate = useNavigate();
  const { products, addToCart, isInWishlist, toggleWishlist } = useContext(ShopContext);
  
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [now, setNow] = useState(new Date());

  // لایف تایمەر
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (products?.length > 0) {
      const foundProduct = products.find(p => String(p.id) === String(activeId));
      if (foundProduct) {
        setProduct(foundProduct);
        setMainImage(foundProduct.images?.[0] || foundProduct.image || "");
        if (foundProduct.colors?.length > 0) setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [activeId, products]);

  const isExpired = (expiryDate) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < now;
  };

  const getTimeLeft = (expiryDate) => {
    const diff = new Date(expiryDate) - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    if (product?.colorImages?.[colorName]?.length > 0) {
      setMainImage(product.colorImages[colorName][0]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) { alert("تکایە سایزێک هەڵبژێرە"); return; }
    addToCart({ ...product, selectedSize, selectedColor, image: mainImage });
    alert("بەرهەم زێدە بوو بۆ سەبەتێ ✅");
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Loading...</div>;

  const timeLeft = getTimeLeft(product.expiryDate);
  const hasActiveDiscount = timeLeft !== null && product.discount > 0;
  const currentPrice = hasActiveDiscount ? product.price - (product.price * product.discount / 100) : product.price;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20" dir="rtl">
      
      {/* ١. Header - موبایل و کۆمپیوتەر */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center bg-white/10 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-0 md:gap-8 pt-2 md:pt-20">
        
        {/* ٢. بەشێ وێنەیان - Full Width د موبایلێ دا */}
        <div className="w-full relative">
          <button 
            onClick={() => toggleWishlist(product)}
            className="absolute top-4 left-4 z-20 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg"
          >
            <Heart size={22} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
          </button>

          {/* نیشانا داشکاندنێ */}
          {hasActiveDiscount && (
            <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg">
              %{product.discount} OFF
            </div>
          )}

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-gray-50 dark:bg-slate-900 md:rounded-[2.5rem]">
            {(product.colorImages?.[selectedColor] || product.images || [product.image]).map((img, idx) => (
              <div key={idx} className="flex-shrink-0 w-full snap-center aspect-square">
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          {/* تایمەرێ لایف ل ژێر وێنەی */}
          {hasActiveDiscount && (
            <div className="mx-4 mt-[-20px] relative z-30 bg-black/80 backdrop-blur-xl text-white py-3 rounded-2xl flex items-center justify-center gap-3 font-mono border border-white/10 shadow-2xl" dir="ltr">
              <Timer size={18} className="text-orange-400 animate-pulse" />
              <div className="flex gap-2 text-sm font-bold">
                <span>{timeLeft.hours}h</span>:
                <span>{timeLeft.minutes}m</span>:
                <span className="text-orange-400">{timeLeft.seconds}s</span>
              </div>
            </div>
          )}
        </div>

        {/* ٣. زانیاری */}
        <div className="flex flex-col px-5 mt-6 space-y-6">
          <div className="text-right">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase">
              {product.category || 'کۆلێکشنا نوی'}
            </span>
            <h1 className="text-3xl font-black dark:text-white mt-3">{product.name}</h1>
            
            {/* لایف پڕایس */}
            <div className="flex flex-row-reverse items-center gap-3 mt-2">
              <p className="text-3xl font-black text-indigo-600">
                {currentPrice.toLocaleString()} <span className="text-sm">IQD</span>
              </p>
              {hasActiveDiscount && (
                <p className="text-lg text-slate-400 line-through font-bold">
                  {product.price?.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* ڕەنگەکان */}
          {product.colors && (
            <div className="text-right">
              <h3 className="text-xs font-black dark:text-white mb-3 uppercase tracking-wider">ڕەنگ هەڵبژێرە</h3>
              <div className="flex flex-row-reverse gap-3">
                {product.colors.map((color, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === color ? 'border-indigo-600 scale-110' : 'border-transparent opacity-50'}`}
                  >
                    <div className="w-full h-full rounded-full border shadow-inner" style={{ backgroundColor: product.colorCodes?.[color] || color }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* سایزەکان */}
          {product.sizes && (
            <div className="text-right">
              <h3 className="text-xs font-black dark:text-white mb-3 uppercase tracking-wider">قەبارە (Size)</h3>
              <div className="flex flex-row-reverse flex-wrap gap-2">
                {product.sizes.map((size, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 px-6 rounded-xl font-black text-xs transition-all border-2 ${selectedSize === size ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 dark:text-white'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* وەسف */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 text-right">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">وەسفێ بەرهەمی</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-bold">
              {product.description || 'هیچ وەسفێک نینە.'}
            </p>
          </div>

          {/* کڕین */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
          >
            <ShoppingBag size={22}/> زێدەکرن بۆ سەبەتێ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;