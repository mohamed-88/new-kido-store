import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { ref, push, set } from "firebase/database";
import { X, Trash2, CreditCard, Send, Loader2 } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ name: '', phone: '', city: 'Duhok', address: '' });
  const [receipt, setReceipt] = useState(null);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  // فەنکشنی سەرەکی بۆ ناردنی ئۆردەر
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!receipt) return alert("تکایە وێنەی وەسڵەکە بار بکە!");
    if (cartItems.length === 0) return alert("سەبەتەکەت خاڵییە!");
    
    setLoading(true);

    try {
      // ١. گۆڕینی وێنە بۆ تێکست (Base64) بۆ ئەوەی پێویستمان بە سێرڤەری دەرەکی نەبێت
      const reader = new FileReader();
      reader.readAsDataURL(receipt);
      
      reader.onload = async () => {
        const base64Image = reader.result;

        // ٢. ناردنی هەموو زانیارییەکان بۆ Firebase Realtime Database
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderRef = push(ref(db, 'orders'));
        
        await set(orderRef, {
          orderId,
          customerName: info.name,
          phone: info.phone,
          city: info.city,
          address: info.address,
          items: cartItems,
          totalPrice: total,
          receiptImg: base64Image, // وێنەکە لێرەدا پاشەکەوت دەبێت
          status: "ل چاوەڕوانیێ ⏳",
          createdAt: new Date().toLocaleString('ku-IQ')
        });

        alert(`✅ ئۆردەرەکە بە سەرکەوتوویی نێردرا! ژمارەی ئۆردەر: ${orderId}`);
        clearCart();
        onClose();
        setLoading(false);
      };

      reader.onerror = () => {
        throw new Error("کێشەیەک لە خوێندنەوەی وێنەکەدا هەیە");
      };

    } catch (err) {
      console.error("Error:", err);
      alert("❌ ئیرۆر: " + err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-left" dir="rtl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <CreditCard className="text-indigo-600" /> کۆتاییهێنان بە کڕین
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* List Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 text-right font-kurdish">بەرهەمەکان</h3>
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <img src={item.img} className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-indigo-600 font-bold text-xs">{item.price} IQD</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleOrder} className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-gray-700 text-right">زانیارییەکانی گەیاندن</h3>
            <input type="text" placeholder="ناوی تەمام" required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right" 
              onChange={e => setInfo({...info, name: e.target.value})} />
            
            <input type="tel" placeholder="ژمارەی مۆبایل" required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right"
              onChange={e => setInfo({...info, phone: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-3 text-right">
               <select className="p-3 bg-gray-50 border rounded-xl outline-none" onChange={e => setInfo({...info, city: e.target.value})}>
                  <option value="Duhok">دهۆک</option>
                  <option value="Erbil">هەولێر</option>
                  <option value="Sulemani">سلێمانی</option>
               </select>
               <input type="text" placeholder="ناونیشان" required className="p-3 bg-gray-50 border rounded-xl outline-none text-right"
                 onChange={e => setInfo({...info, address: e.target.value})} />
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
              <input type="file" id="receipt" className="hidden" accept="image/*" onChange={e => setReceipt(e.target.files[0])} />
              <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-full text-white shadow-lg">
                  <Send size={20} className="-rotate-45" />
                </div>
                <span className="text-sm font-bold text-indigo-700">
                  {receipt ? receipt.name : "بارکردنی وێنەی وەسڵ"}
                </span>
              </label>
            </div>

            <div className="bg-gray-900 p-5 rounded-2xl text-white">
              <div className="flex justify-between items-center opacity-80 text-sm mb-1">
                <span>کۆم:</span>
                <span>{cartItems.length} دانە</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black">
                <span>کۆی گشتی:</span>
                <span className="text-yellow-400">{total.toLocaleString()} IQD</span>
              </div>
            </div>

            <button disabled={loading || cartItems.length === 0} className={`w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100'}`}>
              {loading ? <Loader2 className="animate-spin" /> : "پشتڕاستکردنی کڕین 🚀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;