import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { ref, push, set, onValue, remove, update } from "firebase/database";
import { Package, PlusCircle, ClipboardList, Trash2, CheckCircle, Image as ImageIcon, X, Printer, User, Phone, MapPin } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const IMGBB_API_KEY = "b80030e939e2b484e3526bfaf9849efa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // بۆ هەلبژارتنا ئۆردەری

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Invoice',
  });

  // --- ١. خواندنا داتایان ژ Firebase ---
  useEffect(() => {
    const prodRef = ref(db, 'products');
    onValue(prodRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.entries(data).map(([id, val]) => ({ id, ...val })).reverse());
      } else { setProducts([]); }
    });

    const ordRef = ref(db, 'orders');
    onValue(ordRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrders(Object.entries(data).map(([id, val]) => ({ id, ...val })).reverse());
      } else { setOrders([]); }
    });
  }, []);

  // --- ٢. لۆجیکێ زێدەکرنا بەرهەمی ---
  const AddProductForm = () => {
    const [formData, setFormData] = useState({ name: '', price: '', category: 'جلوبەرگ', desc: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleUpload = async (e) => {
      e.preventDefault();
      if (selectedFiles.length === 0) return alert("تکایە وێنەیەک هەڵبژێرە");
      setLoading(true);

      try {
        let imageUrls = [];
        for (const file of selectedFiles) {
          const form = new FormData();
          form.append("image", file);
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: form });
          const result = await res.json();
          imageUrls.push(result.data.url);
        }

        const newRef = push(ref(db, 'products'));
        await set(newRef, { ...formData, img: imageUrls[0], allImages: imageUrls, createdAt: Date.now() });

        alert("✅ بەرهەم زێدە بوو");
        setFormData({ name: '', price: '', category: 'جلوبەرگ', desc: '' });
        setSelectedFiles([]);
        setActiveTab('products');
      } catch (err) { alert("❌ کێشەیەک ڕوویدا"); }
      setLoading(false);
    };

    return (
      <form onSubmit={handleUpload} className="space-y-4 max-w-2xl mx-auto">
        <input type="text" placeholder="ناڤێ بەرهەمی" className="w-full p-3 border rounded-xl outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="بها (IQD)" className="p-3 border rounded-xl" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <select className="p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option>جلوبەرگ</option><option>پێلاڤ</option><option>ئێکسسوارات</option>
          </select>
        </div>
        <textarea placeholder="وەسفێ بەرهەمی" rows="3" className="w-full p-3 border rounded-xl" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
        <div className="border-2 border-dashed p-6 rounded-xl text-center bg-gray-50">
          <input type="file" multiple id="imgs" className="hidden" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
          <label htmlFor="imgs" className="cursor-pointer flex flex-col items-center gap-2">
            <ImageIcon className="text-indigo-500" />
            <span className="font-medium">هەڵبژاردنی وێنەکان ({selectedFiles.length})</span>
          </label>
        </div>
        <button disabled={loading} className="w-full py-3 rounded-xl text-white font-bold bg-indigo-600">
          {loading ? "⏳ ل حالێ بارکرنێ دایە..." : "🚀 بەڵاڤکرنا بەرهەمی"}
        </button>
      </form>
    );
  };

  // --- ٣. لۆجیکێ لیستەیا بەرهەمان ---
  const ProductsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p.id} className="p-4 border rounded-2xl flex items-center gap-4 bg-white">
          <img src={p.img} className="w-20 h-20 object-cover rounded-xl border" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">{p.name}</h4>
            <p className="text-indigo-600 font-semibold">{p.price} IQD</p>
          </div>
          <button onClick={() => confirm("دڵنیایی؟") && remove(ref(db, `products/${p.id}`))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );

  // --- ٤. لۆجیکێ ئۆردەران دگەل وەسڵێ ---
  const OrdersList = () => (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="p-5 border rounded-2xl bg-white flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div>
            <p className="font-bold text-indigo-700">ئۆردەر ID: #{o.id?.slice(-6)}</p>
            <p className="text-sm font-bold text-gray-600">کڕیار: {o.customerName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedOrder(o)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex gap-1 items-center hover:bg-indigo-100 border border-indigo-200">
              <Printer size={18}/> نیشاندان و وەسڵ
            </button>
            <button onClick={() => update(ref(db, `orders/${o.id}`), { status: 'پەسەندکرا ✅' })} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><CheckCircle size={20}/></button>
            <button onClick={() => confirm("دڵنیایی؟") && remove(ref(db, `orders/${o.id}`))} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={20}/></button>
          </div>
        </div>
      ))}

      {/* مۆدالێ وەسڵێ (Invoice Modal) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative">
            
            {/* Control Buttons (نەهێتە پرێنت کرن) */}
            <div className="sticky top-0 bg-white/80 backdrop-blur p-4 border-b flex justify-between items-center z-10">
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50"><X size={20}/></button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg">
                <Printer size={18} /> پرێنت کرن
              </button>
            </div>

            {/* Invoice Content (پشکا پرێنتێ) */}
            <div ref={componentRef} className="p-10 text-right">
                <style>{`@media print { body { direction: rtl; } .no-print { display: none; } }`}</style>
                
                <div className="flex justify-between items-start mb-10 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-600 mb-2">وەسڵێ کڕینێ</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm italic">Order ID: #{selectedOrder.id?.slice(-8)}</p>
                    </div>
                    <div className="text-left font-bold text-slate-400">مێژوو: {new Date().toLocaleDateString('ku-IQ')}</div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="space-y-3 bg-slate-50 p-6 rounded-3xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><User size={14}/> زانیارییێن کڕیاری</h3>
                        <p className="text-xl font-black">{selectedOrder.customerName}</p>
                        <p className="flex items-center gap-2 font-bold text-slate-600"><Phone size={14}/> {selectedOrder.phone}</p>
                        <p className="flex items-center gap-2 font-bold text-slate-600"><MapPin size={14}/> {selectedOrder.address}</p>
                    </div>
                    <div className="space-y-2 text-left bg-indigo-50 p-6 rounded-3xl flex flex-col justify-center">
                        <div className="flex justify-between font-bold"><span>بهایێ گشتی:</span> <span>{selectedOrder.totalAmount?.toLocaleString()} IQD</span></div>
                        <div className="flex justify-between text-red-500 font-bold"><span>داشکاندن:</span> <span>{selectedOrder.discount || 0}%</span></div>
                        <div className="h-px bg-indigo-200 my-2"></div>
                        <div className="flex justify-between text-2xl font-black text-indigo-600"><span>کۆیێ گشتی:</span> <span>{selectedOrder.finalAmount?.toLocaleString()} IQD</span></div>
                    </div>
                </div>

                <table className="w-full text-right mb-10">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-4 rounded-r-2xl font-black">بەرهەم</th>
                            <th className="p-4 text-center font-black">ڕەنگ / سایز</th>
                            <th className="p-4 text-center font-black">دانە</th>
                            <th className="p-4 rounded-l-2xl text-left font-black">بها</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {selectedOrder.items?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-4 font-bold">{item.name}</td>
                                <td className="p-4 text-center font-medium">{item.color} / {item.size}</td>
                                <td className="p-4 text-center font-black">x{item.quantity}</td>
                                <td className="p-4 text-left font-black text-indigo-600">{item.price?.toLocaleString()} IQD</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-20 flex justify-between pt-10 border-t border-dashed">
                    <div className="w-40 h-px bg-slate-300 relative"><span className="absolute -bottom-6 right-0 left-0 text-center text-[10px] font-bold text-slate-400 uppercase">واژوویا فرۆشیاری</span></div>
                    <div className="w-40 h-px bg-slate-300 relative"><span className="absolute -bottom-6 right-0 left-0 text-center text-[10px] font-bold text-slate-400 uppercase">واژوویا کڕیاری</span></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8" dir="rtl">
      <header className="flex justify-between items-center mb-10 border-b pb-6">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">🛠️ پەنەلا ئەدمینی</h1>
        <div className="text-sm bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-bold tracking-tighter">Admin Dashboard v2.5</div>
      </header>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'products', icon: <Package size={18}/>, label: 'بەرهەمەکان' },
          { id: 'add', icon: <PlusCircle size={18}/>, label: 'زێدەکرن' },
          { id: 'orders', icon: <ClipboardList size={18}/>, label: 'ئۆردەرەکان' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold ${activeTab === tab.id ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="transition-all">
        {activeTab === 'products' && <ProductsList />}
        {activeTab === 'add' && <AddProductForm />}
        {activeTab === 'orders' && <OrdersList />}
      </div>
    </div>
  );
};

export default AdminDashboard;