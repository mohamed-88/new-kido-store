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

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    city: 'Duhok',
    address: ''
  });

  // ۱. حسابکرنا نرخێ گشتی (پشتی داشکاندنا هەر بەرهەمەکی)
  const subtotal = getCartAmount();
  
  // ۲. حسابکرنا بڕێ پارەیێ کێمکری ب رێکا Promo Code (ناڤێ ڤێ هاتە ڕاستکرن)
  const discountAmountFromPromo = (subtotal * appliedDiscount) / 100;
  
  // ۳. کۆژمێ دوماهیێ
  const finalTotalPrice = subtotal - discountAmountFromPromo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("سەبەتا تە یا ڤالایە!");

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
      status: 1
    };

    const result = await addOrder(orderData);
    if (result.success) {
      setOrderId(result.orderId);
      setIsOrdered(true);
      clearCart(); 
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
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold">سوپاس بۆ کڕینا تە. ئوردەرا تە دێ د زوترین دەم دا گەهیت.</p>
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

            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all mt-4">
              پشتڕاستکرنا ئوردەری
            </button>
          </form>
        </div>

        {/* لایێ چەپێ: پڕۆمۆ کۆد و کورتیا سەبەتێ */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h3 className="font-black dark:text-white mb-4 flex items-center gap-2 text-sm">
              <Ticket size={18} className="text-indigo-500" /> کۆدێ داشکاندنێ
            </h3>
            
            <div className="relative flex gap-2">
              <input 
                type="text" 
                placeholder="کۆدی لێرە بنووسە..." 
                className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none text-xs font-bold border dark:border-slate-700"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => applyPromoCode(promoInput)}
                className="bg-slate-900 dark:bg-white dark:text-black text-white px-4 rounded-xl text-xs font-black active:scale-95 transition-all"
              >
                بکاربینە
              </button>
            </div>

            {promoError && <p className="text-[10px] text-red-500 font-bold mt-2 mr-2">{promoError}</p>}
            
            {activePromoCode && (
              <div className="mt-3 flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-[10px] font-black text-green-700 dark:text-green-400">کۆدێ ({activePromoCode}) هاتە کاراکردن</span>
                </div>
                <button onClick={removePromoCode} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h3 className="font-black dark:text-white mb-6">کورتیا داخوازیێ</h3>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
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

              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <p className="font-bold italic">داشکاندنا کۆدی (%{appliedDiscount}):</p>
                  <p className="font-bold">-{discountAmountFromPromo.toLocaleString()} IQD</p>
                </div>
              )}

              <div className="pt-3 border-t dark:border-slate-800 flex justify-between items-center">
                <p className="font-black dark:text-white">کۆژمێ دوماهیێ:</p>
                <p className="text-2xl font-black text-indigo-600 drop-shadow-sm">
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