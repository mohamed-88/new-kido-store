import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../ShopContext';
import { ShoppingBag, Eye, X, Timer, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  function calculateTimeLeft() {
    const difference = new Date(expiryDate) - new Date();
    if (difference <= 0) return null;
    return {
      سەعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
      خۆلەک: Math.floor((difference / 1000 / 60) % 60),
      چرکە: Math.floor((difference / 1000) % 60),
    };
  }
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (!remaining) { clearInterval(timer); onExpire(); }
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);
  if (!timeLeft) return null;
  return (
    <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-lg font-mono text-[10px] font-bold animate-pulse">
      <Timer size={12} />
      <span>{timeLeft.سەعات}:{timeLeft.خۆلەک}:{timeLeft.چرکە}</span>
    </div>
  );
};

const Home = () => {
  const { products, addToCart, updateProduct } = useContext(ShopContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");

  const getDiscountedPrice = (price, discount) => {
    const p = Number(price) || 0;
    const d = Number(discount) || 0;
    return p - (p * (d / 100));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("هیڤیە بەری زێدەکرنێ، سایزێ خۆ دەستنیشان بکە!");
      return;
    }
    
    addToCart({ 
      ...selectedProduct, 
      size: selectedSize, 
      color: selectedColor || "Standard", 
      price: getDiscountedPrice(selectedProduct.price, selectedProduct.discount) 
    });
    
    // پاقژکرنا داتایان پشتی زێدەکرنێ
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setError("");
  };

  return (
    <div className="py-6" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 text-right">
        {products.map((product) => {
          const price = Number(product.price);
          const discount = Number(product.discount || 0);
          const hasDiscount = discount > 0;
          const finalPrice = getDiscountedPrice(price, discount);

          return (
            <div key={product.id} className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border dark:border-slate-800 group transition-all hover:shadow-2xl flex flex-col relative">
              
              {hasDiscount && product.expiryDate && (
                <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
                  <CountdownTimer expiryDate={product.expiryDate} onExpire={() => updateProduct(product.id, { discount: 0, expiryDate: null })} />
                  <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> %{discount}-
                  </div>
                </div>
              )}

              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white/90 p-3 rounded-full text-slate-900 shadow-xl"><Eye size={24} /></div>
                </div>
              </div>

              <div className="p-4 md:p-5 flex flex-col flex-1">
                <p className="text-[10px] text-indigo-600 font-black uppercase mb-1">{product.category || 'گشتی'}</p>
                <h3 className="font-black text-sm md:text-base dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                
                {/* نیشاندانا سایزێن بەردەست ل بن ناڤی */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {["S", "M", "L", "XL"].map(s => (
                    <span key={s} className="text-[9px] border dark:border-slate-700 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                      {s}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto">
                  <div className="flex flex-col mb-4">
                    {hasDiscount ? (
                      <>
                        <span className="text-[11px] text-gray-400 line-through decoration-red-500 decoration-2 italic font-bold">{price.toLocaleString()} IQD</span>
                        <span className="font-black text-indigo-600 text-lg">{finalPrice.toLocaleString()} <span className="text-[10px]">IQD</span></span>
                      </>
                    ) : (
                      <span className="font-black dark:text-white text-lg">{price.toLocaleString()} <span className="text-[10px]">IQD</span></span>
                    )}
                  </div>
                  
                  <button onClick={() => setSelectedProduct(product)} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all font-bold text-xs">
                    <ShoppingBag size={16} /> کڕین و دیارکرنا سایزی
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- QUICK VIEW MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button onClick={() => {setSelectedProduct(null); setSelectedSize(""); setError("");}} className="absolute top-4 left-4 z-50 p-2 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-full hover:rotate-90 transition-transform">
              <X size={24} />
            </button>

            <div className="md:w-1/2 bg-gray-50 dark:bg-slate-800 h-64 md:h-auto">
              <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>

            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto text-right">
              <h2 className="text-2xl font-black dark:text-white mb-4">{selectedProduct.name}</h2>
              
              <div className="flex items-center gap-4 mb-6 bg-indigo-50 dark:bg-indigo-500/5 p-4 rounded-3xl w-fit">
                <div className="text-2xl font-black text-indigo-600">
                  {getDiscountedPrice(selectedProduct.price, selectedProduct.discount).toLocaleString()} <span className="text-sm">IQD</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className={`font-black mb-3 text-sm ${error ? 'text-red-500 animate-bounce' : 'dark:text-white'}`}>
                    {error ? error : "سایزێ خۆ هەڵبژێرە (مەجبوری):"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["S", "M", "L", "XL", "XXL"].map(size => (
                      <button key={size} onClick={() => {setSelectedSize(size); setError("");}} className={`px-5 py-2.5 rounded-xl border-2 font-black transition-all ${selectedSize === size ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-100 dark:border-slate-800 dark:text-white hover:border-indigo-300'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="dark:text-white font-black mb-3 text-sm">ڕەنگ:</h4>
                  <div className="flex gap-3">
                    {["Black", "White", "Blue", "Beige"].map(color => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center ${selectedColor === color ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white dark:border-slate-800 shadow-sm'}`} style={{ backgroundColor: color.toLowerCase() }}>
                        {selectedColor === color && <CheckCircle2 size={16} className={color === 'White' ? 'text-black' : 'text-white'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                <ShoppingBag size={24} /> زێدەکرن بۆ سەبەتێ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;