import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, set, onValue, remove, update } from "firebase/database";
import { Package, PlusCircle, ClipboardList, Trash2, CheckCircle, Image as ImageIcon, X } from 'lucide-react';

const IMGBB_API_KEY = "b80030e939e2b484e3526bfaf9849efa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ١. خواندنا داتایان ژ Firebase ---
  useEffect(() => {
    // خواندنا بەرهەمان
    const prodRef = ref(db, 'products');
    onValue(prodRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.entries(data).map(([id, val]) => ({ id, ...val })).reverse());
      } else { setProducts([]); }
    });

    // خواندنا ئۆردەران
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
        <input type="text" placeholder="ناڤێ بەرهەمی" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="بها (IQD)" className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <select className="p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option>جلوبەرگ</option><option>پێلاڤ</option><option>ئێکسسوارات</option>
          </select>
        </div>
        <textarea placeholder="وەسفێ بەرهەمی" rows="3" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
        <div className="border-2 border-dashed p-6 rounded-xl text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          <input type="file" multiple id="imgs" className="hidden" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
          <label htmlFor="imgs" className="cursor-pointer flex flex-col items-center gap-2">
            <ImageIcon className="text-indigo-500" />
            <span className="font-medium text-indigo-600">هەڵبژاردنی وێنەکان ({selectedFiles.length})</span>
          </label>
        </div>
        <button disabled={loading} className={`w-full py-3 rounded-xl text-white font-bold ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg transition'}`}>
          {loading ? "⏳ ل حالێ بارکرنێ دایە..." : "🚀 بەڵاڤکرنا بەرهەمی"}
        </button>
      </form>
    );
  };

  // --- ٣. لۆجیکێ لیستەیا بەرهەمان ---
  const ProductsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p.id} className="p-4 border rounded-2xl flex items-center gap-4 bg-white hover:shadow-md transition">
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

  // --- ٤. لۆجیکێ ئۆردەران ---
  const OrdersList = () => (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="p-5 border rounded-2xl bg-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="font-bold text-indigo-700">ئۆردەر ID: {o.order_id}</p>
            <p className="text-sm text-gray-600">حاڵەت: <span className="font-bold">{o.status || 'ل چاوەڕوانی'}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => update(ref(db, `orders/${o.id}`), { status: 'پەسەندکرا ✅' })} className="px-4 py-2 bg-green-500 text-white rounded-xl flex gap-1 items-center hover:bg-green-600 shadow-sm"><CheckCircle size={18}/> پەسەندکرن</button>
            <button onClick={() => remove(ref(db, `orders/${o.id}`))} className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50"><Trash2 size={20}/></button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8" dir="rtl">
      <header className="flex justify-between items-center mb-10 border-b pb-6">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">🛠️ پەنەلا ئەدمینی</h1>
        <div className="text-sm bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-bold">Admin Panel v2.0</div>
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

      <div className="transition-all duration-500">
        {activeTab === 'products' && <ProductsList />}
        {activeTab === 'add' && <AddProductForm />}
        {activeTab === 'orders' && <OrdersList />}
      </div>
    </div>
  );
};

export default AdminDashboard;