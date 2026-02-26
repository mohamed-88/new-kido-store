import React, { useRef } from 'react';
import { X, Printer, Phone, MapPin, Calendar, Package, CreditCard, User } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const OrderDetailsModal = ({ order, closeModal }) => {
  const componentRef = useRef();

  // فەنکشنا پرێنتێ
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Order_${order?.id}`,
  });

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
        
        {/* Header - نەهێتە پرێنت کرن */}
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Package size={24} />
            </div>
            <h2 className="text-xl font-black dark:text-white">وردەکارییێن ئوردەری</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
            >
              <Printer size={18} /> پرێنت کرن
            </button>
            <button 
              onClick={closeModal}
              className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X size={20} className="dark:text-white" />
            </button>
          </div>
        </div>

        {/* بەشێ زانیارییان (ئەو بەشێ پرێنت دبیت) */}
        <div className="flex-1 overflow-y-auto p-8" ref={componentRef}>
          
          {/* ستایلێ تایبەت بۆ پرێنتێ */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page { size: A5; margin: 1cm; }
              body { dir: rtl; font-family: 'Arial', sans-serif; }
              .no-print { display: none; }
            }
          `}} />

          {/* نیشانا وەسڵێ */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black text-indigo-600 mb-2">وەسڵێ کڕینێ</h1>
              <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Order ID: #{order.id}</p>
            </div>
            <div className="text-left font-bold">
              <div className="flex items-center gap-2 justify-end text-slate-700 dark:text-white mb-1">
                <Calendar size={14} />
                <span>{order.date || '2024-01-01'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* زانیارییێن کڕیاری */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                <User size={14} /> زانیارییێن کڕیاری
              </h3>
              <div className="space-y-3">
                <p className="text-lg font-black dark:text-white">{order.customerName}</p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone size={14} />
                  <span className="font-bold">{order.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin size={14} />
                  <span className="font-bold">{order.address}</span>
                </div>
              </div>
            </div>

            {/* کورتیا حسابێ */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="text-xs font-black text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                <CreditCard size={14} /> کورتیا حسابێ
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between font-bold dark:text-white">
                  <span>بهایێ گشتی:</span>
                  <span>{order.totalAmount?.toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold">
                  <span>داشکاندن:</span>
                  <span>{order.discount || 0} %</span>
                </div>
                <div className="h-px bg-indigo-200 dark:bg-indigo-800 my-2"></div>
                <div className="flex justify-between text-xl font-black text-indigo-600 dark:text-indigo-400">
                  <span>کۆیێ گشتی:</span>
                  <span>{order.finalAmount?.toLocaleString()} IQD</span>
                </div>
              </div>
            </div>
          </div>

          {/* لیستا بەرهەمان */}
          <div>
            <h3 className="text-sm font-black dark:text-white mb-4 pr-2 border-r-4 border-indigo-600">لیستا کڕینان</h3>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <th className="p-4 rounded-r-2xl font-black text-xs">بەرهەم</th>
                  <th className="p-4 font-black text-xs text-center">ڕەنگ / سایز</th>
                  <th className="p-4 font-black text-xs text-center">دانە</th>
                  <th className="p-4 rounded-l-2xl font-black text-xs text-left">بها</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="p-4 font-bold dark:text-white">{item.name}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] font-black">{item.size}</span>
                        <span className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: item.colorCode }}></span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold dark:text-white">x{item.quantity}</td>
                    <td className="p-4 text-left font-black text-indigo-600">{item.price?.toLocaleString()} IQD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* واژوو و تێبینی (تەنێ بۆ پرێنتێ) */}
          <div className="hidden print:flex justify-between mt-16 pt-8 border-t border-dashed">
            <div className="text-center w-40">
              <div className="h-px bg-slate-300 mb-2"></div>
              <p className="text-xs font-bold text-slate-500">واژوویا فرۆشیاری</p>
            </div>
            <div className="text-center w-40">
              <div className="h-px bg-slate-300 mb-2"></div>
              <p className="text-xs font-bold text-slate-500">واژوویا کڕیاری</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;