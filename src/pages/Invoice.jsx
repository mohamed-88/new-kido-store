import React, { useRef } from 'react';
import { Download, Share2, Printer, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';

const Invoice = ({ orderDetails }) => {
  const invoiceRef = useRef();

  // فۆنکشنا پاشکەفتکرن وەک وێنە
  const downloadInvoice = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { 
      scale: 3, // بۆ هندێ کوالێتی زۆر بەرز بیت
      useCORS: true,
      backgroundColor: "#ffffff"
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Invoice-${orderDetails.orderId}.png`;
    link.click();
  };

  if (!orderDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-10 flex flex-col items-center">
      
      {/* Container - ئەڤ پشکە دێ بیتە وێنە */}
      <div 
        ref={invoiceRef}
        className="bg-white w-full max-w-[500px] p-10 rounded-[3rem] shadow-2xl border-t-[15px] border-indigo-600 text-slate-900"
        dir="rtl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg shadow-indigo-200">K</div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">KIDO STORY</h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mt-1">OFFICIAL PURCHASE INVOICE</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <span className="bg-green-100 text-green-600 px-6 py-1.5 rounded-full text-xs font-black border border-green-200">
            داخوازی هاتیە تۆمارکرن
          </span>
        </div>

        {/* Order Meta */}
        <div className="grid grid-cols-2 gap-4 mb-10 bg-gray-50 p-5 rounded-3xl border border-dashed border-gray-200">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">کۆدێ واسلێ</p>
            <p className="font-black text-indigo-600 tracking-wider">#{orderDetails.orderId}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">ڕێکەفت</p>
            <p className="font-bold text-sm text-slate-700">
              {new Date(orderDetails.date).toLocaleDateString('ku-IQ')}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-10 px-2 text-right">
          <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">زانیاریێن کڕیاری</h3>
          <p className="font-black text-xl mb-1">{orderDetails.customer.name}</p>
          <p className="text-sm text-slate-500 font-bold">{orderDetails.customer.phone}</p>
          <p className="text-sm text-slate-500">{orderDetails.customer.city}, {orderDetails.customer.address}</p>
        </div>

        {/* Items List */}
        <div className="mb-10 text-right">
          <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">لیستا پارچان</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white border-b border-gray-100 pb-3">
                <div className="flex flex-col">
                  <span className="font-black text-sm">{item.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">قەبارە: {item.size} | ڕەنگ: {item.color}</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm">{(item.price * item.quantity).toLocaleString()} IQD</p>
                  <p className="text-[10px] text-gray-400 font-bold">ژمارە: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex justify-between items-center shadow-xl mb-10">
          <div className="text-right">
            <p className="text-[10px] opacity-60 font-bold uppercase mb-1">کۆمێ گشتی دگەل گەهاندنێ</p>
            <p className="text-2xl font-black">{(orderDetails.total + 5000).toLocaleString()} <span className="text-xs">IQD</span></p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <Printer size={24} />
          </div>
        </div>

        {/* Footer QR */}
        <div className="text-center pt-6 border-t border-gray-100">
          <div className="w-24 h-24 bg-gray-50 p-3 rounded-3xl mx-auto mb-4 border border-gray-100 flex items-center justify-center">
             <div className="w-full h-full bg-slate-200 rounded-lg animate-pulse"></div> {/* جهێ QR کۆدی */}
          </div>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">Thank you for shopping at KIDO</p>
        </div>
      </div>

      {/* Buttons - ئەڤە د وێنەی دا دەرناکەڤن */}
      <div className="mt-10 flex flex-col md:flex-row gap-4 w-full max-w-[500px]">
        <button 
          onClick={downloadInvoice}
          className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <Download size={20} /> پاشکەفتکرن وەک وێنە (PNG)
        </button>
        
        <Link 
          to="/" 
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-5 rounded-2xl font-black flex items-center justify-center border dark:border-slate-800 shadow-sm hover:bg-gray-50 transition"
        >
          <Home size={20} />
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-400 font-bold animate-bounce text-center">
        تکایە وێنەی پاشکەفت بکە و بۆ مە بنێرە ل واتسئەپێ
      </p>
    </div>
  );
};

export default Invoice;