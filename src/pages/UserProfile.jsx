import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShoppingBag, Heart, LogOut, 
  ChevronRight, ShieldCheck, MapPin, PackageX, 
  Camera, CheckCircle2, ArrowRight, Loader2, Info, Phone, AtSign, Trash2
} from 'lucide-react';

import { auth, db, storage, googleProvider } from "../firebase"; // ✅ googleProvider هاتیە ئیمپۆرتکرن
import { 
  updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential, 
  reauthenticateWithPopup // ✅ ئەڤە بۆ Google پێدڤیە
} from "firebase/auth";
import { doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const UserProfile = () => {
  const { user, logout, orders } = useContext(ShopContext);
  const navigate = useNavigate();

  // ... (States and other functions remain the same)
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showOrderMsg, setShowOrderMsg] = useState(false);
  const [showAddressMsg, setShowAddressMsg] = useState(false);
  const [dbUserData, setDbUserData] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDbUserData(data);
        setEditData({ firstName: data.firstName || '', lastName: data.lastName || '' });

        if (!data.firstName && user.displayName) {
          const nameParts = user.displayName.split(' ');
          const firstName = nameParts;
          const lastName = nameParts.slice(1).join(' ') || firstName;
          const updatedData = {
            firstName: firstName,
            lastName: lastName,
            displayName: user.displayName,
            username: user.email.split('@')
          };
          updateDoc(userRef, updatedData);
        }
        
      } else {
        const nameParts = user.displayName ? user.displayName.split(' ') : [user.email.split('@')];
        const firstName = nameParts;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          firstName: firstName,
          lastName: lastName,
          username: user.email.split('@'),
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    }, (error) => {
      console.error("Error fetching user profile:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateName = async () => {
    if (!editData.firstName || !editData.lastName) {
      alert("تکایە هەردوو خانان پڕ بکە");
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        displayName: `${editData.firstName} ${editData.lastName}`
      });
      await updateProfile(auth.currentUser, {
        displayName: `${editData.firstName} ${editData.lastName}`
      });
      setIsEditing(false);
      alert("ناڤ ب سەرکەفتی هاتە گوهۆڕین");
    } catch (error) {
      alert("کێشەیەک هەبوو د گوهۆڕینا ناڤی دا: " + error.message);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files;
    if (!file || !user) return;

    setUploading(true);
    const storageRef = ref(storage, `profile_images/${user.uid}/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      alert("وێنەیێ پڕۆفایلی هاتە گوهۆڕین");
    } catch (error) {
      alert("کێشە د بلندکرنا وێنەی دا: " + error.message);
    } finally {
      setUploading(false);
    }
  };


  // --- ✅ فەنکشنا چارەسەرکری یا سڕینا ئەکاونتی ---
  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmation = window.confirm("ئەرێ تو پشتڕاستی کو دڤێت هەژمارا خۆ بسڕی؟ ئەڤ کارە ناهێتە ڤەگەڕاندن.");
    if (!confirmation) return;

    setDeleting(true);

    try {
      // ١. پشکنین بکە کا بەکارهێنەر ب چ رێکێ هاتیە (Google یان Email)
      const providerId = user.providerData[0].providerId; // ✅ دروست

      if (providerId === 'password') {
        // --- رێکا ١: بۆ بەکارهێنەرێن ئیمەیلی ---
        const password = prompt("بۆ پشتڕاستکرنێ، تکایە پاسۆردێ خۆ بنڤێسە:");
        if (!password) {
          setDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

      } else if (providerId === 'google.com') {
        // --- رێکا ٢: بۆ بەکارهێنەرێن Google ---
        alert("دێ پەنجەرەکا نوو ڤەبیت بۆ دووبارە لۆگینکرنێ ب رێکا Google دا پشتڕاست ببین.");
        await reauthenticateWithPopup(user, googleProvider);

      } else {
        alert("ئەڤ رێکا سڕینێ بۆ جۆرێ هەژمارا تە ناهێتە پشتگیریکرن.");
        setDeleting(false);
        return;
      }

      // ٢. پشتی پشتڕاستکرن سەرکەفتی بوو، داتایان بسڕە
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      alert("هەژمارا تە ب سەرکەفتی هاتە سڕین.");
      logout();
      navigate('/');

    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        alert("پاسۆرد یێ خەلەتە!");
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert("پرۆسە هاتە بەتالکرن ژبەرکو تە پەنجەرە گرت.");
      } else {
        console.error("Delete Account Error:", error);
        alert("کێشەیەک د سڕینا هەژمارێ دا ڕوویدا: " + error.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  // ... (The rest of the component remains the same)
  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <User size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-black dark:text-white mb-2">تۆ لۆگین نەیی</h2>
        <p className="text-gray-500 mb-8 max-w-xs text-sm">ژ کەرەما خۆ لۆگین بە بۆ دیتنا پڕۆفایلی.</p>
        <button onClick={() => navigate('/login')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">Login Now</button>
      </div>
    );
  }

  const userOrders = orders?.filter(o => o.email === user.email) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-6 md:pt-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border dark:border-slate-800 text-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative w-32 h-32 mx-auto mb-5 group">
            <img 
              src={user.photoURL || "https://via.placeholder.com/150"} 
              className={`w-full h-full rounded-[2.5rem] border-4 border-indigo-500 p-1.5 object-cover shadow-2xl transition-all ${uploading ? 'opacity-40' : ''}`} 
              alt="User" 
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[2.5rem]">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
              )}
            <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          
          <h2 className="text-2xl font-black dark:text-white flex items-center justify-center gap-2">
            {user.displayName || "بەکارهێنەر"}
            {user.emailVerified && <CheckCircle2 size={18} className="text-blue-500" />}
          </h2>
          <p className="text-indigo-600 font-bold text-sm tracking-wide mb-2">@{dbUserData?.username || user.email.split('@')}</p>

          <div className="mt-2">
            {isEditing ? (
              <div className="flex flex-col gap-2 max-w-xs mx-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl animate-in fade-in">
                <input 
                  className="p-3 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 dark:bg-slate-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ناڤێ ئێکێ"
                  value={editData.firstName}
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                />
                <input 
                  className="p-3 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 dark:bg-slate-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ناڤێ دووێ"
                  value={editData.lastName}
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                />
                <div className="flex gap-2 justify-center mt-2">
                  <button onClick={handleUpdateName} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg">پاشکەفت بکە</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-5 py-2 rounded-xl font-bold text-xs">بەتال بکە</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mx-auto transition-colors">
                <Info size={12} /> گوهۆڕینا ناڤی
              </button>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border dark:border-slate-800 mb-6">
            <h3 className="text-right text-xs font-black text-gray-400 uppercase mb-4 px-2 tracking-widest">پێزانینێن کەسی</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="First Name" value={dbUserData?.firstName} icon={<User size={16}/>} />
                <InfoItem label="Last Name" value={dbUserData?.lastName} icon={<User size={16}/>} />
                <InfoItem label="Username" value={dbUserData?.username} icon={<AtSign size={16}/>} />
                <InfoItem label="Email" value={user.email} icon={<Mail size={16}/>} />
                <InfoItem label="Phone" value={dbUserData?.phone} icon={<Phone size={16}/>} />
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border dark:border-slate-800 overflow-hidden mb-6" dir='rtl'>
          <MenuButton 
            icon={<ShoppingBag size={20} className="text-blue-500" />} 
            title="داواکاریێن من" 
            desc="دووڤچوونا کڕینێن خۆ بکە"
            onClick={() => userOrders.length === 0 ? setShowOrderMsg(true) : navigate('/orders')} 
          />
          <MenuButton 
            icon={<MapPin size={20} className="text-green-500" />} 
            title="ناڤنیشانێن من" 
            desc="ناڤنیشانێن گەهاندنێ ڕێک بێخە"
            onClick={() => setShowAddressMsg(true)} 
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border dark:border-slate-800 mb-6 border-red-100 dark:border-red-900/20" dir="rtl">
          <h3 className="text-red-500 text-[10px] font-black uppercase mb-4 px-2 tracking-widest" dir="ltr">Danger Zone</h3>
          <button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-2xl text-red-600 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                {deleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
              </div>
              <div className="text-right">
                <p className="font-black text-sm">سڕینا ئەکاونتی</p>
                <p className="text-[10px] font-bold opacity-70">هەمی داتایێن تە دێ ژ ناڤ چن</p>
              </div>
            </div>
            <ChevronRight size={18} className="rotate-180 opacity-50" />
          </button>
        </div>

        <button 
          onClick={() => { logout(); navigate('/'); }} 
          className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all mb-10 shadow-xl active:scale-95"
        >
          <LogOut size={22} />
          <span>چوونەدەر ژ هژمارێ</span>
        </button>

      </div>

      {showOrderMsg && (
        <Modal onClose={() => setShowOrderMsg(false)}>
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageX size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-black dark:text-white mb-2">چ داواکاری نینن</h3>
          <p className="text-gray-500 text-sm mb-8">تە چو تشت نەکرینە، نوکە دەست ب کڕینێ بکە!</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Shop Now</button>
        </Modal>
      )}

      {showAddressMsg && (
        <Modal onClose={() => setShowAddressMsg(false)}>
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={40} className="text-green-500" />
          </div>
          <h3 className="text-xl font-black dark:text-white mb-2">ناڤنیشان</h3>
          <p className="text-gray-500 text-sm mb-8">چ ناڤنیشانێن پاراستی نینن. ئەڤ پشکە دێ ب زووی هێتە کاراکردن.</p>
          <button onClick={() => setShowAddressMsg(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">باشە</button>
        </Modal>
      )}
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 text-left">
    <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{label}</p>
      <p className="text-sm font-black dark:text-white truncate">{value || "دیار نینە"}</p>
    </div>
  </div>
);

const MenuButton = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b last:border-0 dark:border-slate-800 transition-all group text-right">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-black dark:text-white text-[15px]">{title}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="rotate-180 text-gray-300" />
  </button>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z- flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
    <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-[3rem] text-center shadow-2xl relative animate-in zoom-in">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
        <ArrowRight size={20} className="rotate-180" />
      </button>
      {children}
    </div>
  </div>
);

export default UserProfile;





// import React, { useContext, useState, useEffect } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import { useNavigate } from 'react-router-dom';
// import { 
//   User, Mail, ShoppingBag, Heart, LogOut, 
//   ChevronRight, ShieldCheck, MapPin, PackageX, 
//   Camera, CheckCircle2, ArrowRight, Loader2, Info, Phone, AtSign, Trash2
// } from 'lucide-react';

// // ✅ ئیمبۆرتێن درست یێن Firebase
// import { auth, db, storage } from "../firebase"; // 'storage' بۆ پاشکەفتکرنا وێنان هاتیە زێدەکرن
// import { updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
// import { doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ✅ فەنکشنێن نوو بۆ Storage

// const UserProfile = () => {
//   const { user, logout, orders } = useContext(ShopContext);
//   const navigate = useNavigate();

//   // States
//   const [uploading, setUploading] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [showOrderMsg, setShowOrderMsg] = useState(false);
//   const [showAddressMsg, setShowAddressMsg] = useState(false);
//   const [dbUserData, setDbUserData] = useState(null); 
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({ firstName: '', lastName: '' });

//   // 1. خواندنا داتایێن بەکارهێنەری ژ Firestore
//   useEffect(() => {
//     if (!user?.uid) return; // ئەگەر user نەبیت، بوەستە

//     const userRef = doc(db, 'users', user.uid);
//     const unsubscribe = onSnapshot(userRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.data();
//         setDbUserData(data);
//         // داتایان ئامادە بکە بۆ گوهۆڕینێ
//         setEditData({ firstName: data.firstName || '', lastName: data.lastName || '' });
//       } else {
//         // ئەگەر دۆکیومێنت نەبیت، ئێکێ دروست بکە
//         setDoc(userRef, {
//           uid: user.uid,
//           email: user.email,
//           displayName: user.displayName,
//           photoURL: user.photoURL,
//           createdAt: new Date().toISOString()
//         }, { merge: true });
//       }
//     }, (error) => {
//       console.error("Error fetching user profile:", error);
//     });

//     return () => unsubscribe();
//   }, [user]);

//   // 2. نووژەنکرنا ناڤی
//   const handleUpdateName = async () => {
//     if (!editData.firstName || !editData.lastName) {
//       alert("تکایە هەردوو خانان پڕ بکە");
//       return;
//     }
//     const userRef = doc(db, 'users', user.uid);
//     try {
//       await updateDoc(userRef, {
//         firstName: editData.firstName,
//         lastName: editData.lastName,
//         displayName: `${editData.firstName} ${editData.lastName}`
//       });
//       // ناڤی د Firebase Auth دا ژی نوو بکە
//       await updateProfile(auth.currentUser, {
//         displayName: `${editData.firstName} ${editData.lastName}`
//       });
//       setIsEditing(false);
//       alert("ناڤ ب سەرکەفتی هاتە گوهۆڕین");
//     } catch (error) {
//       alert("کێشەیەک هەبوو د گوهۆڕینا ناڤی دا: " + error.message);
//     }
//   };

//   // 3. گوهۆڕینا وێنێ پڕۆفایلی (بکارئینانا Firebase Storage)
//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !user) return;

//     setUploading(true);
//     // رێڕەوەکێ تایبەت بۆ وێنێ بەکارهێنەری دروست بکە
//     const storageRef = ref(storage, `profile_images/${user.uid}/${file.name}`);

//     try {
//       // 1. وێنەی بلند بکە بۆ Storage
//       const snapshot = await uploadBytes(storageRef, file);
//       // 2. لینکێ وێنەی وەرگرە
//       const downloadURL = await getDownloadURL(snapshot.ref);

//       // 3. لینکێ نوو د Firebase Auth دا پاشکەفت بکە
//       await updateProfile(auth.currentUser, { photoURL: downloadURL });
      
//       // 4. لینکێ نوو د Firestore دۆکیومێنتێ user دا پاشکەفت بکە
//       const userRef = doc(db, 'users', user.uid);
//       await updateDoc(userRef, { photoURL: downloadURL });

//       alert("وێنەیێ پڕۆفایلی هاتە گوهۆڕین");
//     } catch (error) {
//       alert("کێشە د بلندکرنا وێنەی دا: " + error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // 4. سڕینا ئەکاونتی
//   const handleDeleteAccount = async () => {
//     const password = prompt("بۆ پشتڕاستکرنێ، تکایە پاسۆردێ خۆ بنڤێسە:");
//     if (!password || !user) return;

//     setDeleting(true);
//     try {
//       const credential = EmailAuthProvider.credential(user.email, password);
//       await reauthenticateWithCredential(user, credential);

//       // سڕینا دۆکیومێنتێ ژ Firestore
//       await deleteDoc(doc(db, "users", user.uid));

//       // سڕینا بەکارهێنەری ژ Authentication
//       await deleteUser(user);

//       alert("هەژمارا تە ب سەرکەفتی هاتە سڕین");
//       logout(); // Logout-ا ShopContext گاز بکە
//       navigate('/');
//     } catch (error) {
//       if (error.code === 'auth/wrong-password') {
//         alert("پاسۆرد یێ خەلەتە!");
//       } else {
//         alert("کێشەیەک ڕوویدا: " + error.message);
//       }
//     } finally {
//       setDeleting(false);
//     }
//   };

//   if (!user) {
//     // ... (Ev beş wekî xwe dimîne)
//     return (
//       <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
//         <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
//           <User size={48} className="text-gray-300" />
//         </div>
//         <h2 className="text-2xl font-black dark:text-white mb-2">تۆ لۆگین نەیی</h2>
//         <p className="text-gray-500 mb-8 max-w-xs text-sm">ژ کەرەما خۆ لۆگین بە بۆ دیتنا پڕۆفایلی.</p>
//         <button onClick={() => navigate('/login')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">Login Now</button>
//       </div>
//     );
//   }

//   const userOrders = orders?.filter(o => o.email === user.email) || [];

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-6 md:pt-10 px-4">
//       <div className="max-w-2xl mx-auto">
        
//         {/* Profile Header */}
//         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border dark:border-slate-800 text-center mb-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
          
//           <div className="relative w-32 h-32 mx-auto mb-5 group">
//             <img 
//               src={user.photoURL || "https://via.placeholder.com/150"} 
//               className={`w-full h-full rounded-[2.5rem] border-4 border-indigo-500 p-1.5 object-cover shadow-2xl transition-all ${uploading ? 'opacity-40' : ''}`} 
//               alt="User" 
//             />
//             {uploading && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[2.5rem]">
//                 <Loader2 className="animate-spin text-indigo-600" size={32} />
//               </div>
//              )}
//             <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
//               <Camera size={18} />
//               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
//             </label>
//           </div>
          
//           <h2 className="text-2xl font-black dark:text-white flex items-center justify-center gap-2">
//             {user.displayName || "بەکارهێنەر"}
//             {user.emailVerified && <CheckCircle2 size={18} className="text-blue-500" />}
//           </h2>
//           <p className="text-indigo-600 font-bold text-sm tracking-wide mb-2">@{dbUserData?.username || user.email.split('@')[0]}</p>

//           <div className="mt-2">
//             {isEditing ? (
//               <div className="flex flex-col gap-2 max-w-xs mx-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl animate-in fade-in">
//                 <input 
//                   className="p-3 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 dark:bg-slate-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
//                   placeholder="ناڤێ ئێکێ"
//                   value={editData.firstName}
//                   onChange={(e) => setEditData({...editData, firstName: e.target.value})}
//                 />
//                 <input 
//                   className="p-3 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 dark:bg-slate-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
//                   placeholder="ناڤێ دووێ"
//                   value={editData.lastName}
//                   onChange={(e) => setEditData({...editData, lastName: e.target.value})}
//                 />
//                 <div className="flex gap-2 justify-center mt-2">
//                   <button onClick={handleUpdateName} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg">پاشکەفت بکە</button>
//                   <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-5 py-2 rounded-xl font-bold text-xs">بەتال بکە</button>
//                 </div>
//               </div>
//             ) : (
//               <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mx-auto transition-colors">
//                 <Info size={12} /> گوهۆڕینا ناڤی
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Personal Details */}
//         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border dark:border-slate-800 mb-6">
//             <h3 className="text-right text-xs font-black text-gray-400 uppercase mb-4 px-2 tracking-widest">پێزانینێن کەسی</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <InfoItem label="First Name" value={dbUserData?.firstName} icon={<User size={16}/>} />
//                 <InfoItem label="Last Name" value={dbUserData?.lastName} icon={<User size={16}/>} />
//                 <InfoItem label="Username" value={dbUserData?.username} icon={<AtSign size={16}/>} />
//                 <InfoItem label="Email" value={user.email} icon={<Mail size={16}/>} />
//                 <InfoItem label="Phone" value={dbUserData?.phone} icon={<Phone size={16}/>} />
//             </div>
//         </div>

//         {/* ... The rest of your component (MenuButton, Modal, etc.) remains the same ... */}
//         {/* ... (بەشێ دی یێ کۆدی وەکو خۆ بهێلە) ... */}
//         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border dark:border-slate-800 overflow-hidden mb-6" dir='rtl'>
//           <MenuButton 
//             icon={<ShoppingBag size={20} className="text-blue-500" />} 
//             title="داواکاریێن من" 
//             desc="دووڤچوونا کڕینێن خۆ بکە"
//             onClick={() => userOrders.length === 0 ? setShowOrderMsg(true) : navigate('/orders')} 
//           />
//           <MenuButton 
//             icon={<MapPin size={20} className="text-green-500" />} 
//             title="ناڤنیشانێن من" 
//             desc="ناڤنیشانێن گەهاندنێ ڕێک بێخە"
//             onClick={() => setShowAddressMsg(true)} 
//           />
//         </div>

//         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border dark:border-slate-800 mb-6 border-red-100 dark:border-red-900/20" dir="rtl">
//           <h3 className="text-red-500 text-[10px] font-black uppercase mb-4 px-2 tracking-widest" dir="ltr">Danger Zone</h3>
//           <button 
//             onClick={handleDeleteAccount}
//             disabled={deleting}
//             className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-2xl text-red-600 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-red-500 group-hover:scale-110 transition-transform">
//                 {deleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
//               </div>
//               <div className="text-right">
//                 <p className="font-black text-sm">سڕینا ئەکاونتی</p>
//                 <p className="text-[10px] font-bold opacity-70">هەمی داتایێن تە دێ ژ ناڤ چن</p>
//               </div>
//             </div>
//             <ChevronRight size={18} className="rotate-180 opacity-50" />
//           </button>
//         </div>

//         <button 
//           onClick={() => { logout(); navigate('/'); }} 
//           className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all mb-10 shadow-xl active:scale-95"
//         >
//           <LogOut size={22} />
//           <span>چوونەدەر ژ هژمارێ</span>
//         </button>

//       </div>

//       {showOrderMsg && (
//         <Modal onClose={() => setShowOrderMsg(false)}>
//           <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
//             <PackageX size={40} className="text-blue-500" />
//           </div>
//           <h3 className="text-xl font-black dark:text-white mb-2">چ داواکاری نینن</h3>
//           <p className="text-gray-500 text-sm mb-8">تە چو تشت نەکرینە، نوکە دەست ب کڕینێ بکە!</p>
//           <button onClick={() => navigate('/')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Shop Now</button>
//         </Modal>
//       )}

//       {showAddressMsg && (
//         <Modal onClose={() => setShowAddressMsg(false)}>
//           <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
//             <MapPin size={40} className="text-green-500" />
//           </div>
//           <h3 className="text-xl font-black dark:text-white mb-2">ناڤنیشان</h3>
//           <p className="text-gray-500 text-sm mb-8">چ ناڤنیشانێن پاراستی نینن. ئەڤ پشکە دێ ب زووی هێتە کاراکردن.</p>
//           <button onClick={() => setShowAddressMsg(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">باشە</button>
//         </Modal>
//       )}
//     </div>
//   );
// };

// // ... (Helper Components wekî xwe dimînin)
// const InfoItem = ({ label, value, icon }) => (
//   <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 text-left">
//     <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
//       {icon}
//     </div>
//     <div className="flex-1">
//       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{label}</p>
//       <p className="text-sm font-black dark:text-white truncate">{value || "دیار نینە"}</p>
//     </div>
//   </div>
// );

// const MenuButton = ({ icon, title, desc, onClick }) => (
//   <button onClick={onClick} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b last:border-0 dark:border-slate-800 transition-all group text-right">
//     <div className="flex items-center gap-5">
//       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
//         {icon}
//       </div>
//       <div>
//         <p className="font-black dark:text-white text-[15px]">{title}</p>
//         <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
//       </div>
//     </div>
//     <ChevronRight size={18} className="rotate-180 text-gray-300" />
//   </button>
// );

// const Modal = ({ children, onClose }) => (
//   <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
//     <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-[3rem] text-center shadow-2xl relative animate-in zoom-in">
//       <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
//         <ArrowRight size={20} className="rotate-180" />
//       </button>
//       {children}
//     </div>
//   </div>
// );


// export default UserProfile;