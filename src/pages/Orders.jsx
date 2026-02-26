import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { 
  Package, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { user, orders } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ل ڤێرە تەنێ ئۆردەرێن وی کڕیارێ لۆگینبووی نیشان ددەین
  const myOrders = orders?.filter(order => order.email === user?.email) || [];

  useEffect(() => {
    //模擬 بارکرنا داتایان
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Package className="text-slate-300" size={40} />
        </div>
        <h2 className="text-xl font-black">تە لۆگین نەکرییە</h2>
        <button onClick={() => navigate('/login')} className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">چوونەژوورێ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-6 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <ChevronLeft size={24} className="text-slate-600 rotate-180" />
          </button>
          <h1 className="text-2xl font-black dark:text-white">ئۆردەرێن من</h1>
          <div className="w-10"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center shadow-sm border dark:border-slate-800">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-black dark:text-white mb-2">چ ئۆردەر نینن!</h2>
            <p className="text-slate-500 text-sm mb-8">تە هێشتا چ کەرەستە ژ ستۆرێ مە نەکڕینە.</p>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200">دەست ب کڕینێ بکە</button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border dark:border-slate-800 transition-all hover:border-indigo-500/50">
                
                {/* Order Top Info */}
                <div className="flex justify-between items-start mb-4 border-b dark:border-slate-800 pb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">کۆدێ ئۆردەری</p>
                    <p className="font-black text-slate-700 dark:text-slate-200">#{order.id.slice(-8)}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2 ${
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {order.status === 'delivered' ? 'گەهشتییە' : 'یێ دهێت'}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover bg-slate-100" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">دانە: {item.quantity} | قەبارە: {item.size}</p>
                        <div className="flex justify-between items-end mt-2">
                          <p className="font-black text-indigo-600">${item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Price */}
                <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">کۆما گشتی</p>
                    <p className="text-xl font-black dark:text-white">${order.amount}</p>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
                    <ExternalLink size={14} />
                    پێزانینێن پتر
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;