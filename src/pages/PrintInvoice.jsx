import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const PrintInvoice = forwardRef(({ order }, ref) => {
  if (!order) return null;

  const subTotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const deliveryFee = 5000; 

  return (
    <div style={{ display: 'none' }}>
      <div ref={ref} className="p-12 bg-white text-right font-sans" dir="rtl" style={{ width: '210mm', minHeight: '297mm' }}>
        
        {/* Header with Logo */}
        <div className="flex justify-between items-start border-b-8 border-indigo-600 pb-8 mb-10">
          <div className="flex items-center gap-4">
            {/* Logo Box */}
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
              K
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">KIDO <span className="text-indigo-600">STORE</span></h1>
              <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Premium Kids Wear</p>
            </div>
          </div>
          
          <div className="text-left">
            <h2 className="text-3xl font-black text-gray-800 mb-2">وەسڵا فرۆشتنێ</h2>
            <div className="space-y-1 text-sm font-bold text-gray-500">
              <p>کۆدێ داخوازیێ: <span className="text-indigo-600 font-black">#{order.orderId || order.id?.slice(-6).toUpperCase()}</span></p>
              <p>ڕێکەفت: {new Date().toLocaleDateString('ku-IQ')}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="col-span-2 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
            <h3 className="text-indigo-600 font-black text-xs mb-4 uppercase tracking-widest">زانیارییێن کڕیاری</h3>
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900">{order.customerName}</p>
              <p className="text-lg font-bold text-slate-600">{order.phone}</p>
              <p className="text-md text-slate-500">{order.address}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
             <div className="bg-white p-2 rounded-xl mb-3">
                {/* QR Code link to your Instagram or Website */}
                <QRCodeSVG value={`https://www.instagram.com/kido.store/`} size={80} />
             </div>
             <p className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Scan to follow us</p>
          </div>
        </div>

        {/* Table */}
        <div className="mb-12">
          <table className="w-full text-right">
            <thead>
              <tr className="text-indigo-600 border-b-2 border-indigo-100">
                <th className="py-4 font-black text-sm">بەرهەم</th>
                <th className="py-4 text-center font-black text-sm">قەبارە / ڕەنگ</th>
                <th className="py-4 text-center font-black text-sm">بها</th>
                <th className="py-4 text-center font-black text-sm">دانە</th>
                <th className="py-4 text-left font-black text-sm">کۆم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-6">
                    <p className="font-black text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Product ID: {item.id?.slice(0,5)}</p>
                  </td>
                  <td className="py-6 text-center font-bold text-slate-500 uppercase text-xs">
                    {item.selectedSize || item.size || '-'} / {item.selectedColor || item.color || '-'}
                  </td>
                  <td className="py-6 text-center font-bold text-slate-600">{item.price?.toLocaleString()}</td>
                  <td className="py-6 text-center font-black text-slate-800">x{item.quantity}</td>
                  <td className="py-6 text-left font-black text-indigo-600 text-lg">{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total & Summary */}
        <div className="flex justify-end mb-20">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-gray-500 font-bold">
              <span>کۆمێ گشتی:</span>
              <span>{subTotal.toLocaleString()} IQD</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold">
              <span>گەهاندن:</span>
              <span>{deliveryFee.toLocaleString()} IQD</span>
            </div>
            <div className="h-px bg-gray-100 my-2"></div>
            <div className="flex justify-between text-2xl font-black text-indigo-600">
              <span>کۆمێ دوماهیێ:</span>
              <span>{(order.finalAmount || (subTotal + deliveryFee)).toLocaleString()} IQD</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-20 pt-10 border-t border-dashed border-gray-200">
          <div className="text-center">
             <p className="mb-16 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Official Stamp</p>
             <div className="inline-block px-10 py-2 border-2 border-indigo-50 text-indigo-100 rounded-full font-black rotate-12">KIDO STORE OFFICIAL</div>
          </div>
          <div className="text-center">
             <p className="mb-16 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Customer Receipt</p>
             <div className="w-40 h-px bg-gray-200 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintInvoice;



// import React, { forwardRef } from 'react';

// const PrintInvoice = forwardRef(({ order }, ref) => {
//   if (!order) return null;

//   // حیسابکرنا کۆمێ گشتی ئەگەر تێدا نەبیت
//   const subTotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
//   const deliveryFee = 5000; // بهايێ گەهاندنێ ب جێگیری

//   return (
//     <div style={{ display: 'none' }}>
//       <div ref={ref} className="p-10 bg-white text-right font-sans" dir="rtl" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
        
//         {/* Header - سەرێ وەسڵێ */}
//         <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-6 mb-8">
//           <div>
//             <h1 className="text-4xl font-black text-indigo-600">KIDO STORE</h1>
//             <p className="text-gray-500 font-bold mt-1">بۆ جلی زارۆکان و پێدڤیێن وان</p>
//           </div>
//           <div className="text-left">
//             <h2 className="text-2xl font-black text-gray-800">وەسڵا فرۆشتنێ</h2>
//             <p className="text-sm text-gray-500 font-bold mt-1">ژمارە: <span className="text-indigo-600">{order.orderId || order.id?.slice(-6).toUpperCase()}</span></p>
//             <p className="text-sm text-gray-500 font-bold">مێژوو: {new Date().toLocaleDateString('ku-IQ')}</p>
//           </div>
//         </div>

//         {/* Customer Info - زانیاریێن کڕیاری */}
//         <div className="grid grid-cols-2 gap-8 mb-10">
//           <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
//             <h3 className="text-indigo-600 font-black text-sm mb-3 border-b border-indigo-100 pb-2">زانیارییێن کڕیاری</h3>
//             <p className="text-lg font-black text-gray-800 mb-1">{order.customerName}</p>
//             <p className="text-md font-bold text-gray-600 mb-1">{order.phone}</p>
//             <p className="text-sm text-gray-500 leading-relaxed">{order.address}</p>
//           </div>
          
//           <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center">
//             <h3 className="text-indigo-600 font-black text-sm mb-3 border-b border-indigo-200 pb-2">پوختەیا حسابێ</h3>
//             <div className="flex justify-between mb-1">
//               <span className="text-gray-600 font-bold text-sm">کۆمێ کەلوپەلان:</span>
//               <span className="font-black text-gray-800">{subTotal.toLocaleString()} IQD</span>
//             </div>
//             <div className="flex justify-between mb-1">
//               <span className="text-gray-600 font-bold text-sm">بهایێ گەهاندنێ:</span>
//               <span className="font-black text-gray-800">+{deliveryFee.toLocaleString()} IQD</span>
//             </div>
//             <div className="h-px bg-indigo-200 my-2"></div>
//             <div className="flex justify-between text-indigo-600 font-black text-xl">
//               <span>کۆمێ گشتی:</span>
//               <span>{(order.finalAmount || (subTotal + deliveryFee)).toLocaleString()} IQD</span>
//             </div>
//           </div>
//         </div>

//         {/* Items Table - خشتەیێ کەلوپەلان */}
//         <div className="mb-10">
//           <table className="w-full text-right border-collapse">
//             <thead>
//               <tr className="bg-indigo-600 text-white">
//                 <th className="p-4 rounded-tr-2xl border-none">بەرهەم</th>
//                 <th className="p-4 text-center border-none">قەبارە / ڕەنگ</th>
//                 <th className="p-4 text-center border-none">بها</th>
//                 <th className="p-4 text-center border-none">دانە</th>
//                 <th className="p-4 text-left rounded-tl-2xl border-none">کۆم</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 border-b-2 border-gray-200">
//               {(order.items || []).map((item, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50">
//                   <td className="p-4">
//                     <p className="font-black text-gray-800 text-md">{item.name}</p>
//                   </td>
//                   <td className="p-4 text-center font-bold text-gray-500">
//                     {item.selectedSize || item.size || '-'} / {item.selectedColor || item.color || '-'}
//                   </td>
//                   <td className="p-4 text-center font-bold text-gray-600">{item.price?.toLocaleString()} IQD</td>
//                   <td className="p-4 text-center font-black text-gray-800">x{item.quantity}</td>
//                   <td className="p-4 text-left font-black text-indigo-600">{(item.price * item.quantity).toLocaleString()} IQD</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer Notes - تێبینی */}
//         <div className="mt-10 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
//           <p className="text-xs text-yellow-700 font-bold leading-relaxed">
//             * تێبینی: تکایە د دەمێ وەرگرتنی کەلوپەلان دڵنیابە ژ قەبارە و ڕەنگی. گۆڕین و زڤڕاندن تەنێ د ماوێ ٢٤ دەمژمێران دا دبیت ب مەرجەکێ کەرەستە نەهاتبنە بکارئینان.
//           </p>
//         </div>

//         {/* Signatures - واژوو */}
//         <div className="mt-24 flex justify-between px-10">
//           <div className="text-center">
//             <div className="w-48 h-px bg-gray-300 mb-3"></div>
//             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">واژوویا کۆمپانیێ</p>
//           </div>
//           <div className="text-center">
//             <div className="w-48 h-px bg-gray-300 mb-3"></div>
//             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">واژوویا کڕیاری</p>
//           </div>
//         </div>

//         {/* Bottom Contact */}
//         <div className="mt-auto pt-20 text-center text-gray-400 text-[10px] font-bold border-t border-gray-100">
//           <p>Duhok, Kurdistan - Instagram: @kido.store - WhatsApp: +964 XXX XXX XXXX</p>
//           <p className="mt-1 uppercase tracking-[0.3em]">Thank you for choosing KIDO STORE</p>
//         </div>

//       </div>
//     </div>
//   );
// });

// export default PrintInvoice;