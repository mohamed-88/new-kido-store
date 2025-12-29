import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'; 
import { X, Plus, Minus, Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // ڕاستڤەکرنا فۆنکشنا ژێبرنێ
  const handleRemove = (item) => {
    // د کۆنسۆلێ دا تێست بکە کا ئایا ئایدی و سایز هەمان تشتن یێن د سەبەتێ دا؟
    console.log("Removing Item:", item.id, "Size:", item.size);
    deleteFromCart(item.id, item.size);
  };

  // ڕاستڤەکرنا فۆنکشنا کێمکرنێ
  const handleDecrease = (item) => {
    console.log("Decreasing Item:", item.id, "Size:", item.size);
    removeFromCart(item.id, item.size);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex" dir="rtl">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <ShoppingBag /> سەبەتە ({cartItems.length})
            </h2>
            <button onClick={onClose} className="dark:text-white"><X size={24} /></button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center mt-20">
                <p className="text-gray-500 font-bold">سەبەتە بەتاڵە</p>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                  <img src={item.image} className="w-20 h-24 object-cover rounded-lg" alt="" />
                  
                  <div className="flex-1 flex flex-col justify-between text-right">
                    <div>
                      <h3 className="font-bold text-sm dark:text-white">{item.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-1">
                        سایز: <span className="text-indigo-600 font-bold">{item.size || "Standard"}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                       <span className="font-bold dark:text-white text-sm">{(item.price * item.quantity).toLocaleString()} IQD</span>
                       
                       <div className="flex items-center bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg overflow-hidden">
                         <button 
                           onClick={() => handleDecrease(item)} 
                           className="p-1 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                         ><Minus size={14}/></button>
                         
                         <span className="px-2 text-sm font-bold dark:text-white border-x dark:border-slate-600">{item.quantity}</span>
                         
                         <button 
                           onClick={() => addToCart(item)} 
                           className="p-1 px-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                         ><Plus size={14}/></button>
                       </div>
                    </div>
                  </div>
                  
                  <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 transition-colors self-start">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
             <div className="p-6 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex justify-between mb-4">
                  <span className="font-bold dark:text-white">کۆم:</span>
                  <span className="font-black text-xl text-indigo-600 dark:text-indigo-400">{total.toLocaleString()} IQD</span>
                </div>
                <button 
                  onClick={() => { onClose(); navigate('/checkout'); }} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  تەمامکرنا کڕینێ
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;