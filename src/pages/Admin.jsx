import React, { useState, useRef, useContext } from 'react';
import { 
  Plus, Trash2, Edit2, X, Image as ImageIcon, 
  Package, Clock, Truck, CheckCircle, Hash, Tag
} from 'lucide-react';
import { ShopContext } from '../ShopContext';

const Admin = () => {
  const { products, addProduct, deleteProduct, updateProduct, orders, updateOrderStatus } = useContext(ShopContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    discount: '0',
    expiryDate: '',
    description: ''
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSelectedImages(prev => [...prev, reader.result]);
      };
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      alert("پێدڤییە ل کێمترین وێنەیەکێ دابنی!");
      return;
    }

    const productData = {
      ...formData,
      expiryDate: formData.expiryDate || "",
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      stock: Number(formData.stock),
      image: selectedImages[0],
      allImages: selectedImages,
    };

    if (editingId) {
      const existingProduct = products.find(p => p.id === editingId);
      updateProduct(editingId, { 
        ...productData, 
        orderCode: existingProduct?.orderCode || `KID-${Math.floor(1000 + Math.random() * 9000)}` 
      });
    } else {
      addProduct({ 
        ...productData, 
        id: Date.now(), 
        orderCode: `KID-${Math.floor(1000 + Math.random() * 9000)}` 
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      discount: product.discount,
      expiryDate: product.expiryDate || '',
      description: product.description || ''
    });
    setSelectedImages(product.allImages || [product.image]);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: '', stock: '', discount: '0', expiryDate: '', description: '' });
    setSelectedImages([]);
    setEditingId(null);
  };

  const statusConfig = {
    1: { label: 'ل چاوەڕوانیێ', color: 'bg-amber-100 text-amber-600', icon: <Clock size={14} /> },
    2: { label: 'ل ڕێیێ یە', color: 'bg-blue-100 text-blue-600', icon: <Truck size={14} /> },
    3: { label: 'گەهشت', color: 'bg-green-100 text-green-600', icon: <CheckCircle size={14} /> }
  };

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-slate-950 min-h-screen text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic tracking-tighter uppercase">Kido Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">بڕێوەبرنا بەرهەم و ئۆردەرێن کۆگایێ</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
        >
          <Plus size={22} /> زێدەکرنا کالا
        </button>
      </div>

      {/* 1. پشکا تەیبلا کۆگایێ */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 overflow-hidden shadow-sm mb-12">
        <div className="p-6 border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="font-black dark:text-white flex items-center gap-2">
            <Package size={20} className="text-indigo-600" /> لیستا کۆگایێ 
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-slate-800/30 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-5">بەرهەم</th>
                <th className="px-6 py-5 text-center">کۆدێ ناساندنێ</th>
                <th className="px-6 py-5 text-center">قیمەت</th>
                <th className="px-6 py-5 text-center">داشکاندن</th>
                <th className="px-6 py-5 text-left">کردار</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover border dark:border-slate-700" alt="" />
                    <span className="font-black dark:text-white text-sm">{p.name}</span>
                  </td>
                  
                  {/* ل ڤێرێ کۆدێ KID هاتیە د مابەینا ناڤ و قیمەتی دا */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 font-mono">
                      {p.orderCode || 'KID-XXXX'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center font-black dark:text-white text-sm">
                    {p.price?.toLocaleString()} <span className="text-[10px] text-gray-400">IQD</span>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    {p.discount > 0 ? (
                      <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 px-2 py-1 rounded-md text-[10px] font-black">
                        %{p.discount}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(p)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition"><Edit2 size={18} /></button>
                      <button onClick={() => { if(window.confirm('ئەرێ تو پشتڕاستی ژ ژێبرنا ڤی بەرهەمی؟')) deleteProduct(p.id) }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. پشکا ئۆردەران */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b dark:border-slate-800 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-800/50">
          <Truck className="text-indigo-600" size={20} />
          <h2 className="font-black dark:text-white">داخوازییێن کڕیاران</h2>
        </div>
        <div className="p-6 space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-gray-50 dark:bg-slate-800/40 rounded-[2.5rem] border dark:border-slate-800 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">
                    <Hash size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm dark:text-white">{order.customer?.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold tracking-wider">{order.orderId} • {order.customer?.phone}</p>
                  </div>
                </div>
                
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 ${statusConfig[order.status]?.color}`}>
                  {statusConfig[order.status]?.icon} {statusConfig[order.status]?.label}
                </div>

                <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-800 shadow-inner">
                  {[1, 2, 3].map((s) => (
                    <button 
                      key={s}
                      onClick={() => updateOrderStatus(order.orderId, s)} 
                      className={`p-2 rounded-lg transition-all ${order.status === s ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                      {statusConfig[s].icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-white/40 dark:bg-slate-800/40 p-3 rounded-2xl border dark:border-slate-700/50">
                      <img src={item.image} className="w-10 h-12 rounded-lg object-cover" alt="" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black dark:text-white">{item.name} <span className="text-indigo-500 italic">x{item.quantity}</span></span>
                          <span className="text-[10px] font-black text-indigo-600">{(item.price * item.quantity).toLocaleString()} IQD</span>
                        </div>
                        {/* ل ڤێرێ سایز و ڕەنگ بۆ ئەدمینی دیار دبن */}
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md font-black dark:text-gray-300 uppercase">سایز: {item.size || 'N/A'}</span>
                          {item.color && <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md font-black dark:text-gray-300">ڕەنگ: {item.color}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-between bg-white dark:bg-slate-900 p-5 rounded-[2rem] border dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400">کۆمێ گشتی:</span>
                    <span className="text-xl font-black text-indigo-600 tracking-tighter">{order.total?.toLocaleString()} IQD</span>
                  </div>
                  <div className="space-y-1 text-right border-t dark:border-slate-800 pt-3">
                    <p className="text-[10px] font-black dark:text-gray-400 flex items-center gap-1 justify-end">
                      {order.customer?.city} <MapPin size={10} />
                    </p>
                    <p className="text-[11px] font-bold dark:text-white">{order.customer?.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 px-8">
              <h2 className="text-xl font-black dark:text-white">{editingId ? 'دەستکارییا بەرهەمی' : 'زێدەکرنا کالا نوی'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition dark:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div onClick={() => fileInputRef.current.click()} className="w-full h-56 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/30 transition-all group">
                  <ImageIcon size={40} className="text-gray-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">بارکرنا وێنەیان</span>
                  <input type="file" multiple ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border dark:border-slate-700 group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <InputGroup label="ناڤێ بەرهەمی" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} isRequired={true} />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="قیمەت" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} isRequired={true} />
                  <InputGroup label="کۆگا" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} isRequired={true} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="داشکاندن (%)" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                  <InputGroup label="دوماهیک هاتنا داشکاندنێ" type="datetime-local" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
                <InputGroup label="پۆلێن (Category)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 active:scale-95">
                  {editingId ? 'پاشکەفتکرنا گوهۆڕینان' : 'تۆمارکرنا بەرهەمی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MapPin = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

const InputGroup = ({ label, type = "text", value, onChange, isRequired = false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-2">{label} {isRequired && "*"}</label>
    <input 
      type={type} value={value} onChange={onChange} required={isRequired} 
      className="w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600/20 rounded-2xl py-4 px-5 text-sm font-bold dark:text-white outline-none transition-all" 
    />
  </div>
);

export default Admin;