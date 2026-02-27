import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { MapPin, Phone, User, Building2, Navigation, CheckCircle, Ticket, X } from 'lucide-react';

const Checkout = () => {
  const { 
    cartItems, 
    clearCart, 
    addOrder, 
    getCartAmount, 
    appliedDiscount, 
    promoError, 
    activePromoCode, 
    applyPromoCode, 
    removePromoCode 
  } = useContext(ShopContext);

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    city: 'Duhok',
    address: ''
  });

  const subtotal = getCartAmount();
  const discountAmountFromPromo = (subtotal * appliedDiscount) / 100;
  const finalTotalPrice = subtotal - discountAmountFromPromo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("سەبەتا تە یا ڤالایە!");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customerName: customer.name,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        items: cartItems,
        subtotal: subtotal,
        promoCodeUsed: activePromoCode || "None",
        promoDiscountPercent: appliedDiscount,
        promoDiscountAmount: discountAmountFromPromo,
        totalPrice: finalTotalPrice,
        status: 1,
        createdAt: new Date().toISOString()
      };

      const result = await addOrder(orderData);
      
      if (result && result.success) {
        setOrderId(result.orderId);
        setIsOrdered(true);
        clearCart();
      } else {
        alert("ئاریشەیەک هەبوو د تۆمارکرنا ئۆردەری دا.");
      }
    } catch (error) {
      alert("ئاریشەیا ئینتەرنێتێ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 text-right" dir="rtl">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-center max-w-md border dark:border-slate-800 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black dark:text-white mb-2">داخوازی هاتە وەرگرتن!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold">سوپاس بۆ کڕینا تە.</p>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-black mb-1">کۆدێ ئوردەرا تە:</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-white tracking-widest">{orderId}</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="mt-8 w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black transition-transform active:scale-95">زڤڕین بۆ سەرەکی</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-10 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* فۆرمێ زانیارییان */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-800">
          <h2 className="text-xl font-black dark:text-white mb-8 flex items-center gap-2">
            <MapPin className="text-indigo-600" /> زانیاریێن گەهاندنێ
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 mr-2 italic">ناڤێ سێ یانی</label>
              <div className="relative">
                <input required type="text" placeholder="موراد احمد علی" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all" 
                  value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <User className="absolute right-4 top-4 text-gray-400" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 mr-2 italic">ژمارا مۆبایلێ</label>
              <div className="relative">
                <input required type="tel" placeholder="0750 XXX XX XX" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all text-left" 
                  value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                <Phone className="absolute right-4 top-4 text-gray-400" size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-2 italic">باژێر</label>
                <div className="relative">
                  <select className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none appearance-none"
                    value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})}>
                    <option value="Duhok">دهۆک</option>
                    <option value="Zaxo">زاخۆ</option>
                    <option value="Semel">سێمێل</option>
                    <option value="Akre">ئاکرێ</option>
                    <option value="Amedi">ئامێدی</option>
                    <option value="Hewler">هەولێر</option>
                    <option value="Zawita">زاویتە</option>
                    <option value="Domiz">دومیز</option>
                  </select>
                  <Building2 className="absolute right-4 top-4 text-gray-400" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-2 italic">گەڕەک / کوڵان</label>
                <div className="relative">
                  <input required type="text" placeholder="ماسیکێ 2" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all" 
                    value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                  <Navigation className="absolute right-4 top-4 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all mt-4 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}>
              {loading ? "چاوەڕێ بە..." : "پشتڕاستکرنا ئوردەری"}
            </button>
          </form>
        </div>

        {/* پڕۆمۆ کۆد و کورتیا سەبەتێ */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h3 className="font-black dark:text-white mb-4 flex items-center gap-2 text-sm">
              <Ticket size={18} className="text-indigo-500" /> کۆدێ داشکاندنێ
            </h3>
            <div className="relative flex gap-2">
              <input type="text" placeholder="کۆدی لێرە بنووسە..." className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none text-xs font-bold border dark:border-slate-700"
                value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
              <button type="button" onClick={() => applyPromoCode(promoInput)} className="bg-slate-900 dark:bg-white dark:text-black text-white px-4 rounded-xl text-xs font-black active:scale-95 transition-all">بکاربینە</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h3 className="font-black dark:text-white mb-6">کورتیا داخوازیێ</h3>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <img 
                    src={item.image && item.image !== "" ? item.image : "https://via.placeholder.com/150"} 
                    className="w-12 h-12 rounded-xl object-cover" 
                    alt="" 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                  />
                  <div className="flex-1">
                    <p className="text-[11px] font-black dark:text-white truncate w-32">{item.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{item.selectedSize} | {item.selectedColor}</p>
                  </div>
                  <p className="text-xs font-black dark:text-white">x{item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <p className="font-bold text-gray-400">کۆمێ گشتی:</p>
                <p className="font-bold dark:text-white">{subtotal.toLocaleString()} IQD</p>
              </div>
              <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-center">
                <p className="font-black dark:text-white">کۆژمێ دوماهیێ:</p>
                <p className="text-2xl font-black text-indigo-600">
                  {finalTotalPrice.toLocaleString()} <small className="text-[10px]">IQD</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;