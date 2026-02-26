import React, { useState, useContext, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Printer, MapPin, Phone, User, 
  ShieldCheck, Package, ListOrdered, ArrowRight, LogOut, X, CreditCard, Calendar,
  ArrowLeft, Clock, Truck, CheckCircle, XCircle
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import AddProduct from './AddProduct';
import { useReactToPrint } from 'react-to-print';

// ✅ گوهۆڕین بۆ فایەرستۆر
import { getFirestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from '../firebase'; 
import PrintInvoice from './PrintInvoice';

const db = getFirestore(firebaseApp);

const Admin = () => {
  const { products, addProduct, deleteProduct, updateProduct, orders, deleteOrder, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('products'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Order-Invoice`,
    onAfterPrint: () => console.log("Printing Success"),
  });
  
  // ✅ فەنکشنا گوهۆڕینا بارێ ئۆردەری (Firestore Version)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ئاریشەیەک هەبوو د گوهۆڕینا بارێ ئۆردەری دا");
    }
  };

  const statusConfig = {
    'چاڤەڕێیە': { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14}/> },
    'د ڕێدایە': { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Truck size={14}/> },
    'گەهشتییە': { color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle size={14}/> },
    'هەڵوەشایە': { color: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle size={14}/> },
  };

  const handleSaveProduct = async (data) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 text-right font-sans" dir="rtl">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40 p-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-black text-indigo-600 flex items-center gap-2">کۆنترۆلا دوکانێ <ShieldCheck size={20}/></h1>
            <div className="flex gap-2">
                <button onClick={() => {localStorage.removeItem('isAdmin'); if(logout) logout(); navigate('/'); window.location.reload();}} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black flex items-center gap-1">دەرکەفتن<LogOut size={14}/></button>
                <button onClick={() => navigate('/')} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black flex items-center gap-1 dark:text-white">زڤڕین<ArrowLeft size={14}/></button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg flex-shrink-0 active:scale-90 transition-all"><Plus size={20}/></button>
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex-1 text-[10px] font-black uppercase tracking-tighter">
              <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>بەرهەم ({products.length})</button>
              <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>کڕینەکان ({orders.length})</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4">
        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-slate-800 flex gap-4 items-center group hover:shadow-xl transition-all">
                {/* ✅ چاککرنا پیشاندانا وێنەی بۆ حالەتێن رەنگان */}
                <img 
                  src={p.image || (p.colorImages && Object.values(p.colorImages)[0]?.[0])} 
                  className="w-16 h-16 rounded-2xl object-cover border dark:border-slate-700" 
                  alt="" 
                />
                <div className="flex-1">
                  <h3 className="font-black text-sm dark:text-white truncate w-40">{p.name}</h3>
                  <p className="text-indigo-600 font-bold text-xs">{Number(p.price)?.toLocaleString()} IQD</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {setEditingProduct(p); setIsModalOpen(true);}} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => window.confirm('ئەرێ تو پشتڕاستی؟') && deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border dark:border-slate-800 flex flex-wrap justify-between items-center shadow-sm hover:border-indigo-200 transition-all gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                              {order.orderId ? order.orderId : `KID-${order.id?.slice(-5).toUpperCase()}`}
                            </span>
                            <h3 className="font-black dark:text-white text-sm">{order.customerName}</h3>
                            <p className="text-[10px] text-gray-500 font-bold">{order.phone}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select 
                        value={order.status || 'چاڤەڕێیە'} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] font-black px-3 py-2 rounded-xl border outline-none cursor-pointer transition-all ${
                          statusConfig[order.status] ? statusConfig[order.status].color : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}
                      >
                        <option value="چاڤەڕێیە">📦 چاڤەڕێیە</option>
                        <option value="د ڕێدایە">🚚 د ڕێدایە</option>
                        <option value="گەهشتییە">✅ گەهشتییە</option>
                        <option value="هەڵوەشایە">❌ هەڵوەشایە</option>
                      </select>

                        <button onClick={() => setSelectedOrder(order)} className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Printer size={18}/></button>
                        <button onClick={() => window.confirm('ژێببەم؟') && deleteOrder(order.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                    </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal (وەک خۆی مایە، تەنها داتای فایەرستۆر وەردگریت) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
               <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white dark:bg-slate-700 rounded-full dark:text-white shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors">
                 <X size={20}/>
               </button>
               <button onClick={() => handlePrint()} className="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 shadow-lg active:scale-95 transition-all">
                 <Printer size={18}/> پرێنت کرن
               </button>
            </div>

            <div className="p-10 text-right bg-white dark:bg-slate-900 overflow-y-auto" dir="rtl">
                {/* لێرە لۆجیکێ نیشاندانا وەسڵێ (Preview) هەیە 
                   پێدڤی ب گوهۆڕینێ نینە هەتا داتایێن selectedOrder د هەبن
                */}
                <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-6">
                  <div>
                    <h1 className="text-3xl font-black text-indigo-600 mb-2 italic">وەسڵێ کڕینێ</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      ORDER CODE: {selectedOrder.orderId}
                    </p>
                  </div>
                  <div className="text-left font-bold text-slate-400 text-xs">
                    مێژوو: {selectedOrder.date || new Date().toLocaleDateString('ku-IQ')}
                  </div>
                </div>

                {/* زانیاریێن کڕیار */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-lg font-black mb-1 dark:text-white">{selectedOrder.customerName}</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{selectedOrder.phone}</p>
                    <p className="text-xs text-slate-500 mt-2">{selectedOrder.address}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100">
                    <div className="flex justify-between text-xl font-black text-indigo-600 dark:text-indigo-400 italic">
                      <span>کۆیێ گشتی:</span> 
                      <span>{selectedOrder.finalAmount?.toLocaleString()} IQD</span>
                    </div>
                  </div>
                </div>

                {/* خشتەی بەرهەمەکان */}
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 border-b">
                      <th className="p-4">بەرهەم</th>
                      <th className="p-4 text-center">ڕەنگ/سایز</th>
                      <th className="p-4 text-center">دانە</th>
                      <th className="p-4 text-left">بها</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.cartItems || selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b dark:border-slate-800 dark:text-white">
                        <td className="p-4 font-black text-sm">{item.name}</td>
                        <td className="p-4 text-center text-xs">{item.selectedColor || '-'} / {item.selectedSize || '-'}</td>
                        <td className="p-4 text-center font-black">x{item.quantity}</td>
                        <td className="p-4 text-left font-black">{item.price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ لادانی کێشەی "Nothing to Print" */}
      <div style={{ display: 'none' }}>
          <PrintInvoice ref={componentRef} order={selectedOrder} />
      </div>

      {isModalOpen && (
        <AddProduct 
          closeModal={closeModal} 
          onSave={handleSaveProduct} 
          editingProduct={editingProduct} 
        />
      )}
    </div>
  );
};

export default Admin;



// import React, { useState, useContext, useRef } from 'react';
// import { 
//   Plus, Trash2, Edit2, Printer, MapPin, Phone, User, 
//   ShieldCheck, Package, ListOrdered, ArrowRight, LogOut, X, CreditCard, Calendar,
//   ArrowLeft
// } from 'lucide-react';
// import { ShopContext } from '../context/ShopContext';
// import { useNavigate } from 'react-router-dom';
// import AddProduct from './AddProduct';
// import { useReactToPrint } from 'react-to-print';

// const Admin = () => {
//   const { products, addProduct, deleteProduct, updateProduct, orders, deleteOrder, logout } = useContext(ShopContext);
//   const navigate = useNavigate();
  
//   const [activeTab, setActiveTab] = useState('products'); 
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null); // بۆ پیشاندانا وەسڵێ

//   const componentRef = useRef();

//   // لۆجیکێ پرێنتێ
//   const handlePrint = useReactToPrint({
//     content: () => componentRef.current,
//     documentTitle: `Order-Details`,
//   });

//   const handleSaveProduct = async (data) => {
//     if (editingProduct) {
//       await updateProduct(editingProduct.id, data);
//     } else {
//       await addProduct({ ...data, createdAt: new Date().toISOString() });
//     }
//     closeModal();
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingProduct(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 text-right font-sans" dir="rtl">
      
//       {/* Header */}
//       <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40 p-4">
//         <div className="max-w-5xl mx-auto flex flex-col gap-4">
//           <div className="flex justify-between items-center">
//             <h1 className="text-lg font-black text-indigo-600 flex items-center gap-2">کۆنترۆلا دوکانێ <ShieldCheck size={20}/></h1>

//             <div className="flex gap-2">
//                 <button onClick={() => {localStorage.removeItem('isAdmin'); if(logout) logout(); navigate('/'); window.location.reload();}} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black flex items-center gap-1">دەرکەفتن<LogOut size={14}/></button>
//                 <button onClick={() => navigate('/')} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black flex items-center gap-1 dark:text-white">زڤڕین<ArrowLeft size={14}/></button>
//             </div>
//           </div>
          
//           <div className="flex gap-2">
//             <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg flex-shrink-0 active:scale-90 transition-all"><Plus size={20}/></button>
//             <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex-1 text-[10px] font-black uppercase tracking-tighter">
//               <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>بەرهەم ({products.length})</button>
//               <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>کڕینەکان ({orders.length})</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-5xl mx-auto p-4">
//         {activeTab === 'products' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {products.map(p => (
//               <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-slate-800 flex gap-4 items-center group hover:shadow-xl transition-all">
//                 <img src={p.images?.[0] || p.image} className="w-16 h-16 rounded-2xl object-cover border dark:border-slate-700" alt="" />
//                 <div className="flex-1">
//                   <h3 className="font-black text-sm dark:text-white truncate w-40">{p.name}</h3>
//                   <p className="text-indigo-600 font-bold text-xs">{p.price?.toLocaleString()} IQD</p>
//                 </div>
//                 <div className="flex gap-1">
//                   <button onClick={() => {setEditingProduct(p); setIsModalOpen(true);}} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Edit2 size={16}/></button>
//                   <button onClick={() => window.confirm('ئەرێ تو پشتڕاستی؟') && deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {orders?.slice().reverse().map(order => (
//                 <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 flex justify-between items-center shadow-sm hover:border-indigo-200 transition-all">
//                     <div className="flex gap-4 items-center">
//                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
//                            <User size={20}/>
//                         </div>
//                         <div>
//                             <h3 className="font-black dark:text-white text-sm">{order.customerName}</h3>
//                             <p className="text-[11px] text-gray-500 font-bold tracking-widest">{order.phone}</p>
//                             <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><MapPin size={10}/> {order.address || 'لوکەیشن نەهاتیە'}</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-2">
//                         <button onClick={() => setSelectedOrder(order)} className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Printer size={18}/></button>
//                         <button onClick={() => window.confirm('ژێببەم؟') && deleteOrder(order.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
//                     </div>
//                 </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Invoice Modal - ئەڤە پەنجەرەیا وەسڵێ یە */}
//       {selectedOrder && (
//         <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
//           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative">
            
//             {/* Control Bar */}
//             <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-800">
//                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white dark:bg-slate-700 rounded-full dark:text-white shadow-sm"><X size={20}/></button>
//                <button onClick={handlePrint} className="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 shadow-lg transition-all"><Printer size={18}/> پرێنت کرن</button>
//             </div>

//             {/* Content for Printing */}
//             <div ref={componentRef} className="p-10 text-right bg-white" dir="rtl">
//                 <style>{`@media print { body { direction: rtl; } .no-print { display: none; } }`}</style>
//                 <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-6">
//                     <div>
//                         <h1 className="text-3xl font-black text-indigo-600 mb-2 italic">وەسڵێ کڕینێ</h1>
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Order ID: #{selectedOrder.id?.slice(-8)}</p>
//                     </div>
//                     <div className="text-left font-bold text-slate-400 text-xs">مێژوو: {new Date().toLocaleDateString('ku-IQ')}</div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-6 mb-8">
//                     <div className="bg-slate-50 p-6 rounded-[2rem]">
//                         <h3 className="text-[10px] font-black text-slate-400 mb-3 flex items-center gap-2"><User size={12}/> زانیارییێن کڕیاری</h3>
//                         <p className="text-lg font-black mb-1">{selectedOrder.customerName}</p>
//                         <p className="text-sm font-bold text-slate-600 mb-1">{selectedOrder.phone}</p>
//                         <p className="text-xs text-slate-500 font-medium">{selectedOrder.address}</p>
//                     </div>
//                     <div className="bg-indigo-50 p-6 rounded-[2rem] flex flex-col justify-center space-y-2">
//                         <div className="flex justify-between text-xs font-bold text-indigo-400 uppercase"><span>بها:</span> <span>{selectedOrder.totalAmount?.toLocaleString()}</span></div>
//                         <div className="flex justify-between text-xs font-bold text-red-400 uppercase"><span>داشکاندن:</span> <span>{selectedOrder.discount || 0}%</span></div>
//                         <div className="h-px bg-indigo-100 my-1"></div>
//                         <div className="flex justify-between text-xl font-black text-indigo-600 italic"><span>کۆتایی:</span> <span>{selectedOrder.finalAmount?.toLocaleString()} IQD</span></div>
//                     </div>
//                 </div>

//                 <table className="w-full text-right mb-10">
//                     <thead>
//                         <tr className="bg-slate-50 text-[10px] font-black text-slate-400 border-b border-slate-100">
//                             <th className="p-4 rounded-r-2xl">بەرهەم</th>
//                             <th className="p-4 text-center">ڕەنگ / سایز</th>
//                             <th className="p-4 text-center">دانە</th>
//                             <th className="p-4 text-left rounded-l-2xl">بها</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-50">
//                         {selectedOrder.items?.map((item, idx) => (
//                             <tr key={idx}>
//                                 <td className="p-4">
//                                     <div className="font-black text-sm">{item.name}</div>
//                                 </td>
//                                 <td className="p-4 text-center">
//                                     <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
//                                         <span>{item.size}</span>
//                                         <span className="w-2 h-2 rounded-full border" style={{backgroundColor: item.colorCode}}></span>
//                                     </div>
//                                 </td>
//                                 <td className="p-4 text-center font-black">x{item.quantity}</td>
//                                 <td className="p-4 text-left font-black text-indigo-600">{item.price?.toLocaleString()} IQD</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 <div className="mt-20 flex justify-between px-10">
//                    <div className="text-center"><div className="w-32 h-px bg-slate-200 mb-2"></div><p className="text-[10px] font-bold text-slate-300">واژوویا فرۆشیاری</p></div>
//                    <div className="text-center"><div className="w-32 h-px bg-slate-200 mb-2"></div><p className="text-[10px] font-bold text-slate-300">واژوویا کڕیاری</p></div>
//                 </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal for Adding/Editing */}
//       {isModalOpen && (
//         <AddProduct 
//           closeModal={closeModal} 
//           onSave={handleSaveProduct} 
//           editingProduct={editingProduct} 
//         />
//       )}
//     </div>
//   );
// };

// export default Admin;