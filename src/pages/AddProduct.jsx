import React, { useState, useRef } from 'react';
import { X, Save, Ruler, Palette, UploadCloud, Images, Loader2, Plus } from 'lucide-react';

const AddProduct = ({ closeModal, onSave, editingProduct }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const galleryInputRef = useRef(null);
  const colorImagesInputRef = useRef(null);
  const [activeColorForImages, setActiveColorForImages] = useState(null);

  // لۆجیکێ فۆرمێ: پشتڕاست دەبین کو هەمی پارامیتەر حازرن بۆ ئیدیتێ
  const [formData, setFormData] = useState(editingProduct || {
    name: '', price: '', discount: '0', expiryDate: '', description: '', 
    sizes: [], colors: [], images: [], 
    colorImages: {}, 
    colorCodes: {} 
  });

  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState({ name: "", code: "#888888" });

  const clothesSizes = ["0-3M", "3-6M", "6-12M", "1-2Y", "3-4Y", "S", "M", "L", "XL"];
  const readyColors = [
    { name: 'Red', code: '#ef4444' }, { name: 'Blue', code: '#3b82f6' }, 
    { name: 'Black', code: '#000000' }, { name: 'White', code: '#ffffff' }
  ];

  // --- فۆنکشنا زیرەکانە بۆ بچووککرنا وێنەی (Compression) ---
  const compressImage = (file, quality = 0.5) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
      };
    });
  };

  const allSizes = Array.from(new Set([...clothesSizes, ...(formData?.sizes || [])]));
  const allColors = [...readyColors];
  
  (formData?.colors || []).forEach(cName => {
    if (!allColors.find(rc => rc.name === cName)) {
      allColors.push({ 
        name: cName, 
        code: (formData?.colorCodes && formData?.colorCodes[cName]) ? formData.colorCodes[cName] : "#888888" 
      });
    }
  });

  const handleColorImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && activeColorForImages) {
      for (const file of files) {
        const compressed = await compressImage(file, 0.4);
        setFormData(prev => ({
          ...prev,
          colorImages: { 
            ...(prev.colorImages || {}), 
            [activeColorForImages]: [...((prev.colorImages && prev.colorImages[activeColorForImages]) || []), compressed].slice(0, 5) 
          }
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      return alert("تکایە وێنەیەکێ گشتی یێ بەرهەمی زێدە بکە!");
    }
    setIsSubmitting(true);
    try {
      const dataString = JSON.stringify(formData);
      const sizeInMB = (dataString.length / (1024 * 1024));
      if (sizeInMB > 1.0) {
        alert(`قەبارێ داتای زۆر مەزنە (${sizeInMB.toFixed(2)}MB). وێنەیان کێم بکە.`);
        setIsSubmitting(false);
        return;
      }
      await onSave(formData);
      alert("بەرهەم ب سەرکەفتی هاتە پاشکەفتکرن!");
      closeModal();
    } catch (error) {
      console.error("Save Error:", error);
      alert("کێشەیەک د پاشکەفتکرنێ دا هەبوو: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative">
        <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full dark:text-white hover:bg-red-50 transition-colors"><X size={20}/></button>
        <h2 className="text-xl font-black dark:text-white mb-8 border-r-4 border-indigo-600 pr-4 italic text-right">زێدەکرنا بەرهەمی</h2>

        <form onSubmit={handleSubmit} className="space-y-8 text-right">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {(formData?.images || []).map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-50"><img src={img} className="w-full h-full object-cover" alt="" /></div>
              ))}
              <button type="button" onClick={() => galleryInputRef.current.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all"><Plus/></button>
            </div>
            <input type="file" ref={galleryInputRef} multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files);
              for (const file of files) {
                const compressed = await compressImage(file, 0.6);
                setFormData(p => ({ ...p, images: [...(p.images || []), compressed] }));
              }
            }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="ناڤێ بەرهەمی" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
            <input required type="number" placeholder="بها (IQD)" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black mr-2 text-slate-400 uppercase">داشکاندن %</label>
              <input type="number" placeholder="%" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-red-500 font-bold outline-none border-2 border-transparent focus:border-red-500" value={formData.discount} onChange={e=>setFormData({...formData, discount:e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black mr-2 text-slate-400 uppercase italic">مێژوو</label>
              <div className="flex w-full pl-12 sm:pl-0 relative group">
                {!formData.expiryDate && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none flex items-center gap-2">
                    <span>مێژوویێ هەڵبژێره...</span>
                  </div>
                )}
                <input type="datetime-local" className="w-full h-[56px] px-4 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none" style={{ color: formData.expiryDate ? '#4f46e5' : 'transparent', colorScheme: 'light' }} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-[10px] font-black mr-2 text-slate-400 uppercase">وەسف (Description)</label>
            <textarea rows="2" placeholder="وەسفێ بەرهەمی بنڤێسە..." className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-4">
            <div className="flex flex-wrap gap-2">
              {allSizes.map(s => (
                <button key={s} type="button" onClick={() => setFormData(p=>({ ...p, sizes: (p.sizes || []).includes(s) ? p.sizes.filter(x=>x!==s) : [...(p.sizes || []), s] }))} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.sizes?.includes(s) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-700 dark:text-gray-300'}`}>{s}</button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input type="text" placeholder="سایزەکێ دی..." className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs outline-none border dark:border-slate-600" value={customSize} onChange={e=>setCustomSize(e.target.value)} />
              <button type="button" onClick={()=>{if(customSize){setFormData(p=>({...p, sizes:[...(p.sizes || []), customSize]})); setCustomSize("")}}} className="bg-slate-900 dark:bg-indigo-600 text-white px-6 rounded-xl text-xs font-bold hover:opacity-90 transition-all">Add</button>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              {allColors.map(c => (
                <button key={c.name} type="button" onClick={() => setFormData(p=>({ ...p, colors: (p.colors || []).includes(c.name) ? p.colors.filter(x=>x!==c.name) : [...(p.colors || []), c.name] }))} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${formData.colors?.includes(c.name) ? 'ring-2 ring-indigo-600 bg-white shadow-md' : 'bg-white dark:bg-slate-700 dark:text-gray-300'}`}>
                  <span className="w-3 h-3 rounded-full border" style={{backgroundColor: c.code}}></span> {c.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border dark:border-slate-700">
              <input type="text" placeholder="ناڤێ ڕەنگی..." className="flex-1 bg-transparent outline-none text-xs dark:text-white px-2" value={customColor.name} onChange={e => setCustomColor({ ...customColor, name: e.target.value })} />
              <input type="color" className="w-10 h-10 rounded-xl cursor-pointer" value={customColor.code} onChange={e => setCustomColor({ ...customColor, code: e.target.value })} />
              <button type="button" onClick={() => { if (customColor.name) { setFormData(p => ({ ...p, colors: [...(p.colors || []), customColor.name], colorCodes: { ...(p.colorCodes || {}), [customColor.name]: customColor.code } })); setCustomColor({ name: "", code: "#888888" }); } }} className="bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">Add</button>
            </div>
            <div className="space-y-4 mt-4">
              {(formData?.colors || []).map(cName => (
                <div key={cName} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <span className="text-xs font-bold flex items-center gap-2 dark:text-white"><span className="w-3 h-3 rounded-full" style={{backgroundColor: allColors.find(ac=>ac.name===cName)?.code || '#888'}}></span> {cName}</span>
                  <button type="button" onClick={() => { setActiveColorForImages(cName); colorImagesInputRef.current.click(); }} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-lg font-bold">Add Images ({(formData?.colorImages?.[cName]?.length) || 0})</button>
                </div>
              ))}
            </div>
            <input type="file" ref={colorImagesInputRef} multiple className="hidden" accept="image/*" onChange={handleColorImageUpload} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={20}/> پاشکەفتکرن</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;



// import React, { useState, useRef } from 'react';
// import { X, Save, Ruler, Palette, UploadCloud, Images, Loader2, Plus } from 'lucide-react';

// const AddProduct = ({ closeModal, onSave, editingProduct }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const galleryInputRef = useRef(null);
//   const colorImagesInputRef = useRef(null);
//   const [activeColorForImages, setActiveColorForImages] = useState(null);

//   // لۆجیکێ فۆرمێ: پشتڕاست دەبین کو هەمی پارامیتەر حازرن بۆ ئیدیتێ
//   const [formData, setFormData] = useState(editingProduct || {
//     name: '', price: '', discount: '0', expiryDate: '', description: '', 
//     sizes: [], colors: [], images: [], 
//     colorImages: {}, 
//     colorCodes: {} 
//   });

//   const [customSize, setCustomSize] = useState("");
//   const [customColor, setCustomColor] = useState({ name: "", code: "#888888" });

//   const clothesSizes = ["0-3M", "3-6M", "6-12M", "1-2Y", "3-4Y", "S", "M", "L", "XL"];
//   const readyColors = [
//     { name: 'Red', code: '#ef4444' }, { name: 'Blue', code: '#3b82f6' }, 
//     { name: 'Black', code: '#000000' }, { name: 'White', code: '#ffffff' }
//   ];

//   // لێرە پێناسەکرنا allSizes و allColors بۆ چارەسەریا ReferenceError
//   // پشتڕاستکرن کو sizes و colors هەمیشە Array بن
//   const allSizes = Array.from(new Set([...clothesSizes, ...(formData?.sizes || [])]));
//   const allColors = [...readyColors];
  
//   (formData?.colors || []).forEach(cName => {
//     if (!allColors.find(rc => rc.name === cName)) {
//       allColors.push({ 
//         name: cName, 
//         code: (formData?.colorCodes && formData?.colorCodes[cName]) ? formData.colorCodes[cName] : "#888888" 
//       });
//     }
//   });

//   const handleColorImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0 && activeColorForImages) {
//       files.forEach(file => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setFormData(prev => ({
//             ...prev,
//             colorImages: { 
//               ...(prev.colorImages || {}), 
//               [activeColorForImages]: [...((prev.colorImages && prev.colorImages[activeColorForImages]) || []), reader.result].slice(0, 10) 
//             }
//           }));
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
  
//   // ١. پشکنینا وێنەیان
//   if (!formData.images || formData.images.length === 0) {
//     return alert("تکایە وێنەیەکێ گشتی یێ بەرهەمی زێدە بکە!");
//   }

//   setIsSubmitting(true);

//   try {
//     // ٢. هنارتنا داتایان و چاڤەڕێکرنا وەڵامی
//     await onSave(formData);
    
//     // ئەگەر گەهشتە ڤێرێ واتا ب سەرکەفتی خلاس بوو
//     alert("بەرهەم ب سەرکەفتی هاتە پاشکەفتکرن!");
//     closeModal(); // داخستنا پەنجەرێ ب شێوەیەکێ ئۆتۆماتیکی
//   } catch (error) {
//     console.error("Save Error:", error);
//     alert("کێشەیەک د پاشکەفتکرنێ دا هەبوو: " + error.message);
//   } finally {
//     // ٣. د هەر حالەتەکێ دا (سەرکەفتن یان شکەستن) زڤڕینێ ڕاوەستینە
//     setIsSubmitting(false);
//   }
// };

//   return (
//     <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-hidden" dir="rtl">
//       <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative">
//         <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full dark:text-white hover:bg-red-50 transition-colors"><X size={20}/></button>
//         <h2 className="text-xl font-black dark:text-white mb-8 border-r-4 border-indigo-600 pr-4 italic">زێدەکرنا بەرهەمی</h2>

//         <form onSubmit={handleSubmit} className="space-y-8 text-right">
//           {/* وێنەیێن گشتی */}
//           <div className="space-y-4">
//             <div className="flex flex-wrap gap-3">
//               {(formData?.images || []).map((img, i) => (
//                 <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-50"><img src={img} className="w-full h-full object-cover" alt="" /></div>
//               ))}
//               <button type="button" onClick={() => galleryInputRef.current.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all"><Plus/></button>
//             </div>
//             <input type="file" ref={galleryInputRef} multiple className="hidden" onChange={(e) => Array.from(e.target.files).forEach(file => { const r = new FileReader(); r.onloadend = () => setFormData(p=>({...p, images: [...(p.images || []), r.result]})); r.readAsDataURL(file); })} />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <input required placeholder="ناڤێ بەرهەمی" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} />
//             <input required type="number" placeholder="بها (IQD)" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
//             <div className="space-y-2">
//               <label className="text-[10px] font-black mr-2 text-slate-400 uppercase">داشکاندن %</label>
//               <input type="number" placeholder="%" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-red-500 font-bold outline-none border-2 border-transparent focus:border-red-500" value={formData.discount} onChange={e=>setFormData({...formData, discount:e.target.value})} />
//             </div>
//             <div className="space-y-2">
//   <label className="text-[10px] font-black mr-2 text-slate-400 uppercase italic">مێژوو</label>
  
//   <div className="flex w-full pl-12 sm:pl-0 relative group">
//     {!formData.expiryDate && (
//       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none flex items-center gap-2">
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
//         <span>مێژوویێ هەڵبژێره...</span>
//       </div>
//     )}

//     <input 
//       type="datetime-local" 
//       className="w-full h-[56px] px-4 rounded-2xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
//       style={{
//         color: formData.expiryDate ? '#4f46e5' : 'transparent', // نڤیسین دێ بیتە شین (Indigo) دا کو ڕەش نەبیت
//         colorScheme: 'light', // 👈 ئەڤە گرنگترین هێڵە: ڕێگریێ ل ڕەشبوونا برۆسەری دکەت
//       }}
//       value={formData.expiryDate} 
//       onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
//     />
//   </div>
// </div>
//           </div>

//           <div className="space-y-2 mt-4">
//             <label className="text-[10px] font-black mr-2 text-slate-400 uppercase">وەسف (Description)</label>
//             <textarea rows="2" placeholder="وەسفێ بەرهەمی بنڤێسە..." className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
//           </div>

//           {/* سایز */}
//           <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-4">
//             <div className="flex flex-wrap gap-2">
//               {allSizes.map(s => (
//                 <button key={s} type="button" onClick={() => setFormData(p=>({ ...p, sizes: (p.sizes || []).includes(s) ? p.sizes.filter(x=>x!==s) : [...(p.sizes || []), s] }))} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.sizes?.includes(s) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-700 dark:text-gray-300'}`}>{s}</button>
//               ))}
//             </div>
//             <div className="flex gap-2 mt-4">
//               <input 
//                 type="text" 
//                 placeholder="سایزەکێ دی..." 
//                 className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs outline-none border dark:border-slate-600" 
//                 value={customSize} 
//                 onChange={e=>setCustomSize(e.target.value)} 
//               />
//               <button 
//                 type="button" 
//                 onClick={()=>{if(customSize){setFormData(p=>({...p, sizes:[...(p.sizes || []), customSize]})); setCustomSize("")}}} 
//                 className="bg-slate-900 dark:bg-indigo-600 text-white px-6 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
//               >
//                 Add
//               </button>
//             </div>
//           </div>

//           {/* ڕەنگ و وێنەیێن تایبەت */}
//           <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-4">
//             <div className="flex flex-wrap gap-3 mb-4">
//               {allColors.map(c => (
//                 <button key={c.name} type="button" onClick={() => setFormData(p=>({ ...p, colors: (p.colors || []).includes(c.name) ? p.colors.filter(x=>x!==c.name) : [...(p.colors || []), c.name] }))} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${formData.colors?.includes(c.name) ? 'ring-2 ring-indigo-600 bg-white shadow-md' : 'bg-white dark:bg-slate-700 dark:text-gray-300'}`}>
//                   <span className="w-3 h-3 rounded-full border" style={{backgroundColor: c.code}}></span> {c.name}
//                 </button>
//               ))}
//             </div>

//             <div className="flex gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border dark:border-slate-700">
//               <input type="text" placeholder="ناڤێ ڕەنگی..." className="flex-1 bg-transparent outline-none text-xs dark:text-white px-2" value={customColor.name} onChange={e => setCustomColor({ ...customColor, name: e.target.value })} />
//               <input type="color" className="w-10 h-10 rounded-xl cursor-pointer" value={customColor.code} onChange={e => setCustomColor({ ...customColor, code: e.target.value })} />
//               <button 
//                 type="button" 
//                 onClick={() => { 
//                   if (customColor.name) { 
//                     setFormData(p => ({ 
//                       ...p, 
//                       colors: [...(p.colors || []), customColor.name],
//                       colorCodes: { ...(p.colorCodes || {}), [customColor.name]: customColor.code } 
//                     })); 
//                     setCustomColor({ name: "", code: "#888888" }); 
//                   } 
//                 }} 
//                 className="bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black"
//               >
//                 Add
//               </button>
//             </div>

//             <div className="space-y-4 mt-4">
//               {(formData?.colors || []).map(cName => (
//                 <div key={cName} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex justify-between items-center shadow-sm">
//                   <span className="text-xs font-bold flex items-center gap-2 dark:text-white">
//                     <span className="w-3 h-3 rounded-full" style={{backgroundColor: allColors.find(ac=>ac.name===cName)?.code || '#888'}}></span> {cName}
//                   </span>
//                   <button type="button" onClick={() => { setActiveColorForImages(cName); colorImagesInputRef.current.click(); }} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-colors">
//                     Add Images ({(formData?.colorImages?.[cName]?.length) || 0})
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <input type="file" ref={colorImagesInputRef} multiple className="hidden" accept="image/*" onChange={handleColorImageUpload} />
//           </div>

//           <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
//             {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={20}/> پاشکەفتکرن</>}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProduct;