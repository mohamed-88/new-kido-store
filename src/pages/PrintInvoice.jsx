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