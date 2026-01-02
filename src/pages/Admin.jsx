import React, { useState, useRef, useContext } from 'react';
import { 
  Plus, Trash2, Edit2, X, Image as ImageIcon, Calendar,
  Save, Ruler, Palette, UploadCloud, Images, Package, List, CheckCircle, Clock, ChevronDown, Printer, MapPin, Phone, User, Loader2, Type, FileText
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const Admin = () => {
  const { products, addProduct, deleteProduct, updateProduct, orders, updateOrderStatus, deleteOrder } = useContext(ShopContext);
  
  const [activeTab, setActiveTab] = useState('products'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const galleryInputRef = useRef(null);
  const colorImagesInputRef = useRef(null);
  const [activeColorForImages, setActiveColorForImages] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: '', price: '', discount: '0', expiryDate: '', description: '', 
    sizes: [], colors: [], images: [], colorImages: {} 
  });

  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState({ name: "", code: "#888888" });

  const clothesSizes = ["0-3M", "3-6M", "6-12M", "1-2Y", "3-4Y", "5-6Y", "S", "M", "L", "XL"];
  const readyColors = [
    { name: 'Red', code: '#ef4444' }, { name: 'Blue', code: '#3b82f6' }, 
    { name: 'Black', code: '#000000' }, { name: 'White', code: '#ffffff' }
  ];

  const allSizes = Array.from(new Set([...clothesSizes, ...formData.sizes]));
  
  const allColors = [...readyColors];
  formData.colors.forEach(cName => {
    if (!allColors.find(rc => rc.name === cName)) {
      allColors.push({ name: cName, code: "#888888" });
    }
  });

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || "",
      category: p.category || "",
      price: p.price || "",
      discount: p.discount || "0",
      expiryDate: p.expiryDate || "",
      description: p.description || "",
      sizes: p.sizes || [],
      colors: p.colors || [],
      images: p.images || [p.image],
      colorImages: p.colorImages || {}
    });
    setIsModalOpen(true);
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Print Order</title><style>body{direction:rtl;font-family:Tahoma;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:right;}</style></head><body><h2>ئۆردەر: ${order.orderId}</h2><p>کڕیار: ${order.customerName}</p><table><thead><tr><th>بەرهەم</th><th>سایز</th><th>ڕەنگ</th><th>دانە</th><th>بها</th></tr></thead><tbody>${order.items.map(i=>`<tr><td>${i.name}</td><td>${i.selectedSize}</td><td>${i.selectedColor}</td><td>${i.quantity}</td><td>${i.price}</td></tr>`).join('')}</tbody></table><h3>کۆم: ${order.totalPrice} IQD</h3></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', discount: '0', expiryDate: '', description: '', sizes: [], colors: [], images: [], colorImages: {} });
    setActiveColorForImages(null);
  };

  const handleColorImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && activeColorForImages) {
      const remainingSlots = 10 - (formData.colorImages[activeColorForImages]?.length || 0);
      const filesToProcess = files.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => {
            const currentImages = prev.colorImages[activeColorForImages] || [];
            return {
              ...prev,
              colorImages: {
                ...prev.colorImages,
                [activeColorForImages]: [...currentImages, reader.result].slice(0, 10)
              }
            };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 text-right overflow-x-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-indigo-600 font-black">
            <h1 className="text-xl">کۆنترۆلا دوکانێ</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg"><Plus /></button>
          </div>
          <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>بەرهەم ({products.length})</button>
            <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-gray-500'}`}>کڕینەکان ({orders.length})</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-slate-800 flex gap-4 items-center">
                <img src={p.images?.[0] || p.image} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-black text-sm dark:text-white truncate w-40">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-indigo-600 font-bold text-xs">{p.price?.toLocaleString()} IQD</p>
                    {p.discount > 0 && <span className="text-red-500 text-[10px] font-black">%{p.discount}-</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
    {orders && orders.length > 0 ? (
      orders.slice().reverse().map(order => (
        <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black dark:text-white flex items-center gap-2 text-sm"><User size={14}/> {order.customerName}</h3>
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1"><Phone size={12}/> {order.phone}</p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1"><MapPin size={12}/> {order.city}, {order.address}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePrint(order)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-indigo-600"><Printer size={18}/></button>
              
              {/* ڕاستڤەکرنا ئەڤی دوگمەی ل خوارێ */}
              <button 
                onClick={() => {
                  if(window.confirm('ئەرێ تو دڵنیایی دێ ئەڤی ئۆردەری ژێببەی؟')) {
                    deleteOrder(order.id);
                  }
                }} 
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
          
          <div className="border-t dark:border-slate-800 py-3 space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/40 p-2 rounded-xl">
                <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 text-[10px] dark:text-gray-300">
                  <p className="font-black">{item.name}</p>
                  <p className="opacity-70">{item.selectedSize} | {item.selectedColor} | x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-slate-800">
            <p className="font-black text-indigo-600 text-sm">{order.totalPrice?.toLocaleString()} IQD</p>
            <select 
              value={order.status} 
              onChange={(e) => updateOrderStatus(order.id, Number(e.target.value))} 
              className="bg-gray-100 dark:bg-slate-800 text-[10px] p-2 rounded-xl dark:text-white outline-none"
            >
              <option value={1}>📦 چاوەڕێ</option>
              <option value={2}>🚚 ل ڕێیێ</option>
              <option value={3}>✅ گەهشت</option>
            </select>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-20 text-gray-400 font-bold">چ ئۆردەر نینن</div>
    )}
  </div>
)}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto overflow-x-hidden rounded-none sm:rounded-[3rem] p-4 sm:p-10 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full dark:text-white z-10"><X size={20}/></button>
            <h2 className="text-lg sm:text-xl font-black dark:text-white mb-6 sm:mb-8 border-r-4 border-indigo-600 pr-4">{editingId ? 'دەستکارییا بەرهەمی' : 'زێدەکرنا بەرهەمی'}</h2>

            <form onSubmit={async (e) => {
              e.preventDefault(); setIsSubmitting(true);
              const finalData = { ...formData, price: Number(formData.price), discount: Number(formData.discount), image: formData.images[0] || "" };
              if(editingId) await updateProduct(editingId, finalData);
              else await addProduct({...finalData, createdAt: new Date().toISOString()});
              setIsSubmitting(false); closeModal();
            }} className="space-y-6 sm:space-y-8 max-w-full">
              
              <div className="space-y-4">
                <label className="text-xs font-black dark:text-white flex items-center gap-2"><Images size={16}/> وێنەیێن بەرهەمی</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border dark:border-slate-700 flex-shrink-0">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx)=>idx!==i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => galleryInputRef.current.click()} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 flex-shrink-0"><Plus/></button>
                </div>
                <input type="file" ref={galleryInputRef} multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  files.forEach(file => {
                    const r = new FileReader(); r.onloadend = () => setFormData(p=>({...p, images: [...p.images, r.result]})); r.readAsDataURL(file);
                  });
                }} className="hidden" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black mr-2 dark:text-gray-400 italic">ناڤێ بەرهەمی</label>
                  <input required type="text" className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black mr-2 dark:text-gray-400 italic">بها</label>
                    <input required type="number" className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black mr-2 dark:text-gray-400 italic">داشکاندن %</label>
                    <input type="number" className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none text-red-500 font-bold" value={formData.discount} onChange={e=>setFormData({...formData, discount:e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black mr-2 dark:text-gray-400 italic flex items-center gap-2"><Calendar size={14}/> مێژوو (Date)</label>
                <input type="date" className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate:e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black mr-2 dark:text-gray-400 italic">شیکارکرنا بەرهەمی (Description)</label>
                <textarea rows="3" className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
              </div>

              {/* Sizes Section */}
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]">
                <label className="text-xs font-black dark:text-white flex items-center gap-2"><Ruler size={16}/> سایز</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {allSizes.map(s => (
                    <div key={s} className="relative group">
                      <button type="button" onClick={() => setFormData(p=>({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter(x=>x!==s) : [...p.sizes, s] }))} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${formData.sizes.includes(s) ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 dark:text-gray-400'}`}>
                        {s}
                      </button>
                      {!clothesSizes.includes(s) && (
                        <button type="button" onClick={() => setFormData(p=>({...p, sizes: p.sizes.filter(x=>x!==s)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="زێدەکرنا سایزێ دەستی..." className="flex-1 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 dark:text-white outline-none text-[10px] sm:text-xs" value={customSize} onChange={e=>setCustomSize(e.target.value)} />
                  <button type="button" onClick={()=>{if(customSize){setFormData(p=>({...p, sizes:[...p.sizes, customSize]})); setCustomSize("")}}} className="bg-slate-900 text-white px-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs">Add</button>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]">
                <label className="text-xs font-black dark:text-white flex items-center gap-2"><Palette size={16}/> ڕەنگ</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {allColors.map(c => (
                    <div key={c.name} className="relative group">
                      <button type="button" onClick={() => setFormData(p=>({ ...p, colors: p.colors.includes(c.name) ? p.colors.filter(x=>x!==c.name) : [...p.colors, c.name] }))} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-2 transition-all ${formData.colors.includes(c.name) ? 'ring-2 ring-indigo-600 bg-white' : 'bg-white dark:bg-slate-700 dark:text-gray-400'}`}>
                        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border" style={{backgroundColor: c.code}}></span> {c.name}
                      </button>
                      {!readyColors.find(rc => rc.name === c.name) && (
                        <button type="button" onClick={() => setFormData(p=>({...p, colors: p.colors.filter(x=>x!==c.name)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {formData.colors.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <label className="text-[10px] font-black dark:text-gray-400 italic">وێنەیێن ڕەنگان (هەر ڕەنگەک 10 وێنە):</label>
                    <div className="grid grid-cols-1 gap-3">
                      {formData.colors.map(cName => (
                        <div key={cName} className="bg-white dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{backgroundColor: allColors.find(ac=>ac.name===cName)?.code || '#888'}}></span> {cName}
                            </span>
                            <button type="button" onClick={() => { setActiveColorForImages(cName); colorImagesInputRef.current.click(); }} className="text-[8px] sm:text-[9px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg flex items-center gap-1">
                              <UploadCloud size={10}/> ({formData.colorImages[cName]?.length || 0}/10)
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {formData.colorImages[cName]?.map((img, idx) => (
                              <div key={idx} className="relative w-8 h-8 rounded-md overflow-hidden border flex-shrink-0">
                                <img src={img} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFormData(p => ({
                                  ...p,
                                  colorImages: { ...p.colorImages, [cName]: p.colorImages[cName].filter((_, i) => i !== idx) }
                                }))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"><X size={6}/></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <input type="file" ref={colorImagesInputRef} multiple accept="image/*" onChange={handleColorImageUpload} className="hidden" />

                <div className="flex gap-2">
                  <input type="text" placeholder="ناڤێ ڕەنگی..." className="flex-1 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 dark:text-white outline-none text-[10px] sm:text-xs" value={customColor.name} onChange={e=>setCustomColor({...customColor, name:e.target.value})} />
                  <button type="button" onClick={()=>{if(customColor.name){setFormData(p=>({...p, colors:[...p.colors, customColor.name]})); setCustomColor({name:"", code:"#888888"})}}} className="bg-slate-900 text-white px-3 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs">Add</button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 sm:py-5 rounded-xl sm:rounded-[2rem] bg-indigo-600 text-white font-black shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 text-sm sm:text-base">
                {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={20}/> پاشکەفتکرنا هەمی گوهۆڕینان</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;