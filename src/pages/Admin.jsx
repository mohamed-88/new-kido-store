import React, { useState, useRef, useContext } from 'react';
import { 
  Plus, Trash2, Edit2, X, Image as ImageIcon, Calendar,
  Save, Ruler, Palette, UploadCloud, Images, Package, List, CheckCircle, Clock, ChevronDown, Printer, MapPin, Phone, User
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';



const Admin = () => {
  const { products, addProduct, deleteProduct, updateProduct, orders, updateOrderStatus, deleteOrder } = useContext(ShopContext);
  
  const [activeTab, setActiveTab] = useState('products'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const galleryInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', category: '', price: '', discount: '0', expiryDate: '', description: '', 
    sizes: [], colors: [], images: [], colorImages: {} 
  });

  const clothesSizes = ["0-3M", "3-6M", "6-12M", "1-2Y", "3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y", "13-14Y", "15-16Y", "S", "M", "L", "XL"];
  const shoesSizes = Array.from({ length: 16 }, (_, i) => (i + 20).toString());

  const readyColors = [
    { name: 'Red', code: '#ef4444' }, { name: 'Blue', code: '#3b82f6' }, 
    { name: 'Black', code: '#000000' }, { name: 'White', code: '#ffffff' }, 
    { name: 'Pink', code: '#ec4899' }, { name: 'Gray', code: '#6b7280' },
    { name: 'Green', code: '#22c55e' }, { name: 'Navy', code: '#1e3a8a' }
  ];

  // --- فۆنکشنا چاپکرنا وەسڵێ ---
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: right;">${item.name} <br/> <small>سایز: ${item.selectedSize} | ڕەنگ: ${item.selectedColor}</small></td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: left;">${(item.price * item.quantity).toLocaleString()} IQD</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #ccc; width: 80mm; margin: auto;">
        <h2 style="text-align: center; margin-bottom: 5px;">KIDDO SHOP</h2>
        <p style="text-align: center; font-size: 12px; margin-top: 0;">وەسڵێ کڕینێ</p>
        <hr/>
        <p style="font-size: 14px;"><b>کۆد:</b> ${order.orderId || order.id.slice(0,5)}</p>
        <p style="font-size: 14px;"><b>کڕیار:</b> ${order.customerName}</p>
        <p style="font-size: 14px;"><b>مۆبایل:</b> ${order.phone}</p>
        <p style="font-size: 14px;"><b>ناونیشان:</b> ${order.city} - ${order.address}</p>
        <p style="font-size: 14px;"><b>بەروار:</b> ${order.date || '---'}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="text-align: right; padding: 5px;">بەرهەم</th>
              <th>دانە</th>
              <th style="text-align: left;">قیمەت</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <h3 style="text-align: left; margin-top: 20px;">کۆمێ گشتی: ${order.totalPrice?.toLocaleString()} IQD</h3>
        <p style="text-align: center; font-size: 10px; margin-top: 30px;">سوپاس بۆ کڕینا تە!</p>
      </div>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      reader.readAsDataURL(file);
    });
  };

  const handleColorGalleryChange = (colorName, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          colorImages: { ...(prev.colorImages || {}), [colorName]: [...(prev.colorImages?.[colorName] || []), reader.result] }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSelection = (listName, item) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (prev[listName] || []).includes(item) ? prev[listName].filter(i => i !== item) : [...(prev[listName] || []), item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, price: Number(formData.price), discount: Number(formData.discount), image: formData.images[0] || (Object.values(formData.colorImages || {})[0]?.[0]) || '' };
    if (editingId) await updateProduct(editingId, data);
    else await addProduct({ ...data, createdAt: new Date().toISOString() });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', discount: '0', expiryDate: '', description: '', sizes: [], colors: [], images: [], colorImages: {} });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 text-right font-sans" dir="rtl">
      
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-black dark:text-white text-xl">کۆنترۆلا دوکانێ</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('products')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-gray-500'}`}>
              <Package size={16} /> بەرهەم ({products?.length})
            </button>
            <button onClick={() => setActiveTab('orders')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-gray-500'}`}>
              <List size={16} /> کڕینەکان ({orders?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products?.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-slate-800 flex gap-4 items-center">
                <img src={p.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                <div className="flex-1">
                  <h3 className="font-black dark:text-white text-sm">{p.name}</h3>
                  <p className="text-indigo-600 font-black text-sm">{p.price.toLocaleString()} IQD</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(p.id); setFormData({ ...p, colorImages: p.colorImages || {} }); setIsModalOpen(true); }} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Edit2 size={14}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {orders && orders.length > 0 ? (
              orders.slice().reverse().map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border dark:border-slate-800 shadow-sm">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black dark:text-white text-lg">{order.customerName}</h3>
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 px-2 py-0.5 rounded-lg font-bold">{order.orderId}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-gray-500">
                        <span className="flex items-center gap-2 text-xs font-bold"><Phone size={12} className="text-green-500"/> {order.phone}</span>
                        <span className="flex items-center gap-2 text-xs font-bold"><MapPin size={12} className="text-red-500"/> {order.city} - {order.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePrint(order)} className="p-2.5 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Printer size={18} />
                      </button>
                      <select 
                        value={order.status || 1}
                        onChange={(e) => updateOrderStatus?.(order.id, Number(e.target.value))}
                        className="bg-gray-100 dark:bg-slate-800 dark:text-white text-[10px] font-black py-2.5 px-3 rounded-xl outline-none border-none"
                      >
                        <option value={1}>📦 ل کۆگایێ</option>
                        <option value={2}>🚚 ل ڕێیێ</option>
                        <option value={3}>✅ گەهشت</option>
                      </select>
                      <button onClick={() => { if(window.confirm('ژێببەم؟')) deleteOrder?.(order.id) }} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl items-center border dark:border-slate-800">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover border dark:border-slate-700" />
                        <div className="flex-1">
                          <p className="text-[11px] font-black dark:text-white line-clamp-1">{item.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">سایز: {item.selectedSize} | ڕەنگ: {item.selectedColor}</p>
                        </div>
                        <div className="text-left">
                           <p className="text-[11px] font-black text-indigo-600">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl">
                    <span className="text-xs font-black text-gray-500 flex items-center gap-1"><Clock size={14}/> {order.date}</span>
                    <span className="text-lg font-black dark:text-white">{order.totalPrice?.toLocaleString()} IQD</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30 dark:text-white font-black italic uppercase tracking-widest">No Orders Yet</div>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b pb-4 dark:border-slate-800">
              <h2 className="text-xl font-black dark:text-white">{editingId ? 'دەستکارییا بەرهەمی' : 'زێدەکرنا بەرهەمێ نوو'}</h2>
              <button onClick={closeModal} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full dark:text-white hover:rotate-90 transition-all"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Main Gallery */}
              <div className="space-y-4">
                <label className="text-xs font-black dark:text-white flex items-center gap-2 uppercase tracking-widest underline decoration-indigo-500 underline-offset-8"><Images size={16} /> وێنەیێن سەرەکی</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 dark:border-slate-800">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => galleryInputRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"><Plus size={24} /></button>
                </div>
                <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} multiple className="hidden" accept="image/*" />
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input required type="text" placeholder="ناڤێ بەرهەمی" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-indigo-500" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
                <div className="flex gap-2">
                  <input required type="number" placeholder="قیمەت" className="w-2/3 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} />
                  <input type="number" placeholder="%" className="w-1/3 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none text-red-500 font-bold" value={formData.discount} onChange={e=>setFormData({...formData, discount:e.target.value})} />
                </div>
                <input type="datetime-local" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate:e.target.value})} />
              </div>

              <textarea placeholder="شیکارکرنا بەرهەمی..." rows="2" className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />

              {/* Colors */}
              <div className="space-y-6">
                <label className="text-xs font-black dark:text-white flex items-center gap-2 tracking-widest underline decoration-indigo-500 underline-offset-8"><Palette size={16} /> ڕەنگ و وێنەیێن تایبەت</label>
                <div className="flex flex-wrap gap-3">
                  {readyColors.map(c => (
                    <button type="button" key={c.name} onClick={() => toggleSelection('colors', c.name)} className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all flex items-center gap-2 ${(formData.colors || []).includes(c.name) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-white' : 'border-transparent bg-gray-50 dark:bg-slate-800 opacity-60'}`}>
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: c.code}} /> {c.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {(formData.colors || []).map(colorName => (
                    <div key={colorName} className="p-4 border-2 border-dashed dark:border-slate-800 rounded-[2rem] bg-gray-50/30 dark:bg-slate-900/30">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-[10px] dark:text-white uppercase">وێنەیێن {colorName}</span>
                        <button type="button" onClick={() => document.getElementById(`input-${colorName}`).click()} className="p-1.5 bg-indigo-600 text-white rounded-lg active:scale-90 transition-transform"><UploadCloud size={14}/></button>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {formData.colorImages?.[colorName]?.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden"><img src={img} className="w-full h-full object-cover" /><button type="button" onClick={() => setFormData(prev => ({...prev, colorImages: {...prev.colorImages, [colorName]: prev.colorImages[colorName].filter((_, i) => i !== idx)}}))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={8}/></button></div>
                        ))}
                      </div>
                      <input id={`input-${colorName}`} type="file" multiple className="hidden" onChange={(e) => handleColorGalleryChange(colorName, e)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-6 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem]">
                <label className="text-xs font-black dark:text-white flex items-center gap-2 tracking-widest uppercase"><Ruler size={16}/> سایزێن بەردەست</label>
                <div className="flex flex-wrap gap-2">
                  {clothesSizes.map(s => (
                    <button type="button" key={s} onClick={() => toggleSelection('sizes', s)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${(formData.sizes || []).includes(s) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 dark:text-gray-400 border dark:border-slate-800'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"><Save size={22} /> پاشکەفتکرنا بەرهەمی</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;