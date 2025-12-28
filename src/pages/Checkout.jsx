import React, { useState, useContext } from 'react';
import { ShopContext } from '../ShopContext';
import { useNavigate } from 'react-router-dom';
import { PackageCheck, MapPin, Phone, User, ShoppingBag } from 'lucide-react';

const Checkout = () => {
  // دڵنیابە addOrder و clearCart د ناڤ ShopContext دا هەمان ناڤن
  const { cartItems, clearCart, addOrder } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'دهۆک',
    address: '',
  });

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
        alert("سەبەتا تە بەتاڵە!");
        return;
    }

    setLoading(true);
    
    const orderId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData = {
      orderId,
      customer: formData,
      items: cartItems, // ل ڤێرێ سایز و ڕەنگ ب ئۆتۆماتیکی دچن
      total,
      status: 1, // بکارئینانا ژمارێ بۆ ستاتوسی (1=پێشوازی، 2=ڕێ، 3=گەهشت) باشترە بۆ ئەدمینی
      date: new Date().toISOString(), // پاراستنی کات ب شێوازێ ستاندارد
    };

    try {
      // ئەڤە ئەو فۆنکشنە یە کو داتایان دگەهینیتە Firebase
      const success = await addOrder(orderData);
      
      if (success) {
        clearCart(); // پاقژکرنا سەبەتێ پشتی سەرکەفتنێ
        alert(`داخوازی ب سەرکەفتنی هاتە تۆمارکرن! کۆدێ تە: ${orderId}`);
        navigate('/'); // یان هەر لاپەڕەکێ تە دڤێت
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("ئاریشەک چێبوو د تۆمارکرنا داخوازیێ دا. هیڤییە دووبارە تاقی بکەڤە.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* فۆڕما زانیارییان */}
        <div className="flex-1 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl font-black dark:text-white mb-8 flex items-center gap-3">
              <PackageCheck className="text-indigo-600" size={28} />
              زانیارییێن گەهاندنێ
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute right-4 top-4 text-gray-400" size={20} />
                <input 
                  type="text" required placeholder="ناڤێ تەمام"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-right"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="relative">
                <Phone className="absolute right-4 top-4 text-gray-400" size={20} />
                <input 
                  type="tel" required placeholder="ژمارا مۆبایلێ"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-right"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute right-4 top-4 text-gray-400" size={20} />
                  <select 
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none text-right"
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="دهۆک">دهۆک</option>
                    <option value="هەولێر">هەولێر</option>
                    <option value="سڵێمانی">سڵێمانی</option>
                    <option value="زاخۆ">زاخۆ</option>
                  </select>
                </div>
                <input 
                  type="text" required placeholder="ناونیشان (گەڕەک / کۆلان)"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-right"
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button 
                type="submit" disabled={loading || cartItems.length === 0}
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:bg-gray-400"
              >
                {loading ? 'ل حالێ تۆمارکرنێ دایه...' : 'پشتڕاستکرنا داخوازیێ'}
              </button>
            </form>
          </div>
        </div>

        {/* پوختەیێ سەبەتێ */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm sticky top-28">
            <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-2">
              <ShoppingBag size={22} className="text-indigo-600" />
              پوختەیێ داخوازیێ
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar mb-6">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 items-center bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <img src={item.image} className="w-16 h-20 object-cover rounded-xl shrink-0" alt={item.name} />
                  <div className="flex-1">
                    <h4 className="text-sm font-black dark:text-white line-clamp-1">{item.name}</h4>
                    <div className="flex gap-2 mt-1">
                      {/* ل ڤێرێ سایز نیشان ددەین، ئەگەر نەبیت دێ بێژیت گشتی */}
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold">
                        سایز: {item.size || 'N/A'}
                      </span>
                      {item.color && (
                        <span className="text-[10px] bg-gray-200 dark:bg-slate-700 dark:text-gray-400 px-2 py-0.5 rounded-md font-bold">
                          {item.color}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-indigo-600 mt-2">
                      {item.quantity} × {item.price?.toLocaleString()} IQD
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>بهایێ گشتی:</span>
                <span>{total.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
                <span className="text-lg font-black dark:text-white">کۆمێ گشتی:</span>
                <span className="text-2xl font-black text-indigo-600">{total.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;