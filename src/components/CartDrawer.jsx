import React, { useContext } from 'react';
import { ShopContext } from '../ShopContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300" dir="rtl">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-black dark:text-white leading-none text-lg">سەبەتەیا تە</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{cartItems.length} پارچە تێدانە</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
            <X size={24} className="dark:text-white" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-black">سەبەتەیا تە ڤالایە!</p>
              <button onClick={onClose} className="mt-4 text-indigo-600 font-bold text-sm">دەست ب کڕینێ بکە</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative w-20 h-24 flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover rounded-2xl shadow-sm" alt="" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-black dark:text-white text-sm line-clamp-1">{item.name}</h4>
                    <button onClick={() => deleteFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-indigo-600 font-black text-sm mt-1">{item.price?.toLocaleString()} IQD</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border dark:border-slate-700">
                      <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition"><Minus size={14} className="dark:text-white"/></button>
                      <span className="font-black dark:text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(item)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition"><Plus size={14} className="dark:text-white"/></button>
                    </div>
                    <span className="font-black text-xs dark:text-gray-400">{(item.price * item.quantity).toLocaleString()} IQD</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold text-sm">
                <span>کۆمێ گشتی:</span>
                <span>{subtotal.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between text-indigo-600 font-black text-xl">
                <span>پوختە:</span>
                <span>{subtotal.toLocaleString()} IQD</span>
              </div>
            </div>
            <button 
              onClick={() => { navigate('/checkout'); onClose(); }}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95"
            >
              پشتڕاستکرنا کڕینێ <ArrowLeft size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;