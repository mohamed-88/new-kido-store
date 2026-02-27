import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'; 
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, products, addToCart, removeFromCart, deleteFromCart } = useContext(ShopContext);
  const navigate = useNavigate();

  // حیسابکرنا کۆمێ گشتی
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleRemove = (item) => {
    deleteFromCart(item.cartId);
  };

  const handleDecrease = (item) => {
    removeFromCart(item.cartId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex" dir="rtl">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300">
          
          {/* Header */}
          <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
              <div className="relative">
                <ShoppingBag size={24} className="text-indigo-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cartItems.length}
                </span>
              </div>
              سەبەتە
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400">
                  <ShoppingBag size={40} />
                </div>
                <p className="text-gray-500 font-bold">سەبەتەیا تە یا بەتاڵە</p>
                <button onClick={onClose} className="text-indigo-600 font-black text-sm">بەردەوام بە د کڕینێ دا</button>
              </div>
            ) : (
              cartItems.map((item) => {
                // ✨ لۆجیکێ چارەسەرکرنا وێنەی:
                // ١. ل بەرهەمێن سەرەکی بگەڕە. ٢. ئەگەر لیستا وێنەیان هەبوو یێ ئێکێ وەرگرە. ٣. ئەگەر نا وێنەیێ وێ بگرە.
                const originalProduct = products.find(p => p.id === item.id);
                const productImage = originalProduct?.images?.[0] || originalProduct?.image || item.image || item.images?.[0];

                return (
                  <div key={item.cartId} className="flex gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* وێنەیێ بەرهەمی */}
                    <div className="w-20 h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                      <img 
                        src={productImage} 
                        className="w-full h-full object-cover" 
                        alt={item.name}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} 
                      />
                    </div>
                    
                    {/* زانیارییێن بەرهەمی */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2 text-right">
                          <h3 className="font-black text-sm dark:text-white line-clamp-1">{item.name}</h3>
                          <button onClick={() => handleRemove(item)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">
                          سایز: <span className="text-indigo-500">{item.selectedSize || "Standard"}</span>
                          {item.selectedColor && ` / ڕەنگ: ${item.selectedColor}`}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                         <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                           {(item.price * item.quantity).toLocaleString()} IQD
                         </span>
                         
                         {/* کۆنترۆلا زێدەکرن و کێمکرنێ */}
                         <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-xl px-1">
                           <button onClick={() => handleDecrease(item)} className="p-2 text-gray-500 hover:text-red-500">
                             <Minus size={14} strokeWidth={3} />
                           </button>
                           <span className="w-8 text-center text-sm font-black dark:text-white">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="p-2 text-gray-500 hover:text-indigo-600">
                             <Plus size={14} strokeWidth={3} />
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cartItems.length > 0 && (
             <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-400">کۆیێ گشتی:</span>
                  <div className="text-right">
                    <span className="block font-black text-2xl text-slate-900 dark:text-white leading-none">
                      {total.toLocaleString()} IQD
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">بێی بهایێ گەهاندنێ</span>
                  </div>
                </div>
                <button 
                  onClick={() => { onClose(); navigate('/checkout'); }} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[1.5rem] font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
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