import React, { useContext } from 'react';
import { ShopContext } from '../ShopContext'; // دڵنیابە ڕێکە ڕاستە
import { X, Plus, Minus, Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart, clearCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- فۆنکشنەک بۆ پشکنینێ (Debugging) ---
  const handleRemove = (item) => {
    console.log("Dozinawa (Trying to remove):", { id: item.id, size: item.size });
    // لێرە سایز ئەگەر نەبیت، دکەینە null یان undefined وەک Context
    deleteFromCart(item.id, item.size);
  };

  // --- فۆنکشنەک بۆ فۆرماتکرنا (پاککرنا) سەبەتێ ب زۆرێ ---
  const handleForceReset = () => {
    if(window.confirm("ئەرێ تو دڵنیای تە دڤێت سەبەتێ پاقژ بکەی؟")) {
      localStorage.removeItem('cartItems');
      window.location.reload();
    }
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
            
            <div className="flex gap-2">
              {/* دوگمەیا پاقژکرنێ (Debug Button) */}
              <button onClick={handleForceReset} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200" title="سەبەتێ سفر بکە">
                 <RefreshCw size={14} /> پاقژکرن
              </button>
              <button onClick={onClose}><X size={24} /></button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-center mt-10 text-gray-500">سەبەتە بەتاڵە</p>
            ) : (
              cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border">
                  <img src={item.image} className="w-20 h-24 object-cover rounded-lg" alt="" />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm dark:text-white">{item.name}</h3>
                      
                      {/* نیشاندانا سایزی: ئەگەر دیار نەبیت دێ نڤیسیت: سایز نینە */}
                      <p className="text-xs text-gray-500 mt-1">
                        سایز: <span className="text-indigo-600 font-bold">{item.size || "نینە (Undefined)"}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                       <span className="font-bold">{(item.price * item.quantity).toLocaleString()} IQD</span>
                       
                       <div className="flex items-center bg-white border rounded-lg">
                         {/* Minus */}
                         <button 
                           onClick={() => removeFromCart(item.id, item.size)} 
                           className="p-1 px-2 hover:bg-gray-100 text-red-500"
                         >-</button>
                         
                         <span className="px-2 text-sm font-bold">{item.quantity}</span>
                         
                         {/* Plus */}
                         <button 
                           onClick={() => addToCart(item)} 
                           className="p-1 px-2 hover:bg-gray-100 text-green-600"
                         >+</button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 self-start">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
             <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-bold">کۆم:</span>
                  <span className="font-black text-xl">{total.toLocaleString()} IQD</span>
                </div>
                <button onClick={() => navigate('/checkout')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
                  Checkout
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;