import React, { useState, useContext } from 'react';
import { Search, Truck, Package, CheckCircle2, MapPin, Clock, AlertCircle } from 'lucide-react';
import { ShopContext } from '../ShopContext';

const OrderTracking = () => {
  const { orders } = useContext(ShopContext); // وەرگرتنا ئۆردەران ژ کۆنتێکستی
  const [orderId, setOrderId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = (e) => {
  e.preventDefault();
  setError('');
  setSearchResult(null);

  if (!orderId.trim()) {
    setError('تکایە کۆدێ واسلا خۆ بنڤیسە');
    return;
  }

  // لێرە ئەم دڵنیا دبین کو لیستا ئۆردەران یا هەی و پاشان ل دویف کۆدێ KID-XXXX دگەڕیێن
  const foundOrder = orders.find(o => 
    o.orderId && o.orderId.toString().toLowerCase() === orderId.trim().toLowerCase()
  );

  if (foundOrder) {
    setSearchResult(foundOrder);
    setError('');
  } else {
    setError('بوورە! ئەڤ کۆدە یێ خەلەتە یان چ داخوازی ب ڤی کۆدی نینن.');
  }
};

  const steps = [
    { id: 1, name: 'ل کۆگایێ یە', desc: 'ئۆردەر هاتیە وەرگرتن و ئامادەیە', icon: <Package /> },
    { id: 2, name: 'ل ڕێیێ یە', desc: 'کۆمپانیا گەهاندنێ ئۆردەر وەرگرت', icon: <Truck /> },
    { id: 3, name: 'گەهشت', desc: 'بەرهەم ب سەرکەفتی گەهشتە دەستێ تە', icon: <CheckCircle2 /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 md:p-12 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black dark:text-white mb-4 italic tracking-tighter uppercase">Track Your Order</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold">کۆدێ واسلا خۆ بنڤیسە دا بزانی کا کایێ تە ل کیرێ یە</p>
          
          <form onSubmit={handleTrack} className="mt-8 relative max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="KID-XXXX"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={`w-full bg-white dark:bg-slate-900 border-2 rounded-3xl py-5 px-8 pr-14 text-lg font-black outline-none transition-all dark:text-white shadow-xl shadow-indigo-500/5 ${error ? 'border-red-500' : 'border-gray-100 dark:border-slate-800 focus:border-indigo-600'}`}
            />
            <Search className="absolute right-5 top-5 text-gray-400" size={24} />
            <button type="submit" className="absolute left-3 top-3 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition">بگەڕی</button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-500 font-bold animate-bounce">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Tracking Result */}
        {searchResult && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Status Visualizer */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border dark:border-slate-800 mb-8">
              <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                
                {/* Connecting Line (Desktop) */}
                <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 dark:bg-slate-800 hidden md:block"></div>
                
                {steps.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 ${searchResult.status >= step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 opacity-50'}`}>
                      {React.cloneElement(step.icon, { size: 28 })}
                    </div>
                    <h4 className={`mt-4 font-black text-sm ${searchResult.status >= step.id ? 'dark:text-white' : 'text-gray-400'}`}>{step.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 text-center font-bold px-4">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <MapPin size={20} />
                  <h3 className="font-black text-sm">زانیاریێن گەهاندنێ</h3>
                </div>
                <p className="text-sm dark:text-white font-bold mb-1">{searchResult.customer?.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{searchResult.customer?.city} - {searchResult.customer?.address}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <Clock size={20} />
                  <h3 className="font-black text-sm">بارودۆخێ داخوازیێ</h3>
                </div>
                <p className="text-sm dark:text-white font-bold mb-1">
                  {searchResult.status === 3 ? 'ب سەرکەفتی گەهشت' : 'د چاوەڕوانیێ دا'}
                </p>
                <p className="text-xs text-gray-400 italic">کۆمێ گشتی: {searchResult.total?.toLocaleString()} IQD</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderTracking;