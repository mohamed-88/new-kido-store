import React, { useState, useContext } from 'react';
import { Search, Truck, Package, CheckCircle2, MapPin, Clock, AlertCircle, XCircle } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const OrderTracking = () => {
  const { orders } = useContext(ShopContext); 
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

    // لێرە پشکنینێ دکەین: ئەرێ کۆدێ KID یێ کڕیار نڤێسی یەکسانە دگەل ئایدی یان KID یێ مە چێکری؟
    const foundOrder = orders.find(o => {
      const generatedKID = `KID-${o.id?.slice(-5).toUpperCase()}`;
      const manualKID = o.orderId?.toString().toUpperCase();
      const inputID = orderId.trim().toUpperCase();
      
      return inputID === manualKID || inputID === generatedKID || inputID === o.id?.toUpperCase();
    });

    if (foundOrder) {
      setSearchResult(foundOrder);
    } else {
      setError('بوورە! ئەڤ کۆدە یێ خەلەتە یان چ داخوازی ب ڤی کۆدی نینن.');
    }
  };

  // لێرە مە هەڤبەندی د ناڤبەرا پەیڤێن ئەدمینی و هەنگاڤێن دیزاینێ دا چێکر
  const getStepLevel = (status) => {
    if (status === 'د ڕێدایە') return 2;
    if (status === 'گەهشتییە') return 3;
    if (status === 'هەڵوەشایە') return -1;
    return 1; // بۆ 'چاڤەڕێیە' یان هەر تشتەکێ دی
  };

  const steps = [
    { id: 1, name: 'ل کۆگایێ یە', desc: 'ئۆردەر هاتیە وەرگرتن و ئامادەیە', icon: <Package />, label: 'چاڤەڕێیە' },
    { id: 2, name: 'ل ڕێیێ یە', desc: 'کۆمپانیا گەهاندنێ ئۆردەر وەرگرت', icon: <Truck />, label: 'د ڕێدایە' },
    { id: 3, name: 'گەهشت', desc: 'بەرهەم ب سەرکەفتی گەهشتە دەستێ تە', icon: <CheckCircle2 />, label: 'گەهشتییە' }
  ];

  const currentLevel = searchResult ? getStepLevel(searchResult.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 md:p-12 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black dark:text-white mb-4 italic tracking-tighter uppercase">Track Your Order</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold">کۆدێ واسلا خۆ بنڤیسە دا بزانی کا کایێ تە ل کیرێ یە</p>
          
          <form onSubmit={handleTrack} className="mt-8 relative max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="مثال: KID-A1B2C"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={`w-full bg-white dark:bg-slate-900 border-2 rounded-3xl py-5 px-8 pr-14 text-lg font-black outline-none transition-all dark:text-white shadow-xl ${error ? 'border-red-500' : 'border-gray-100 dark:border-slate-800 focus:border-indigo-600'}`}
            />
            <Search className="absolute right-5 top-5 text-gray-400" size={24} />
            <button type="submit" className="absolute left-3 top-3 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition">بگەڕی</button>
          </form>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-500 font-bold animate-bounce">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {searchResult && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Status Visualizer */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border dark:border-slate-800 mb-8">
              {searchResult.status === 'هەڵوەشایە' ? (
                <div className="flex flex-col items-center text-red-500 py-4">
                  <XCircle size={60} className="mb-4" />
                  <h3 className="text-xl font-black">ئەڤ ئۆردەرە هاتییە هەڵوەشاندن</h3>
                  <p className="text-sm opacity-70">ببوورە، ئەڤ داخوازییە هاتییە ڕەتکرن.</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                  <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 dark:bg-slate-800 hidden md:block"></div>
                  {steps.map((step) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 ${currentLevel >= step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 opacity-50'}`}>
                        {React.cloneElement(step.icon, { size: 28 })}
                      </div>
                      <h4 className={`mt-4 font-black text-sm ${currentLevel >= step.id ? 'dark:text-white' : 'text-gray-400'}`}>{step.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 text-center font-bold px-4">{step.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <MapPin size={20} />
                  <h3 className="font-black text-sm">زانیاریێن گەهاندنێ</h3>
                </div>
                <p className="text-sm dark:text-white font-bold mb-1">{searchResult.customerName}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{searchResult.address}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <Clock size={20} />
                  <h3 className="font-black text-sm">بارودۆخێ داخوازیێ</h3>
                </div>
                <p className="text-sm dark:text-white font-bold mb-1">
                  بار: {searchResult.status || 'چاڤەڕێیە'}
                </p>
                <p className="text-xs text-gray-400 italic">کۆمێ گشتی: {(searchResult.finalAmount || searchResult.totalPrice)?.toLocaleString()} IQD</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;