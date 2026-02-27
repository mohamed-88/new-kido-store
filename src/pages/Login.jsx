import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Camera, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { auth, db, googleProvider } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword, 
  reload,
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useContext(ShopContext);

  const [view, setView] = useState('selection');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [userData, setUserData] = useState({
    profileImg: null,
    firstName: '',
    lastName: '',
    username: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await reload(userCredential.user);
      
      if (!userCredential.user.emailVerified) {
        alert("تکایە ئیمەیڵێ خۆ پشتڕاست بکە!");
        await auth.signOut(); 
        setView('verify');    
        setLoading(false);
        return; 
      }
    } catch (error) {
      alert("ئیمەیڵ یان پاسۆرد یێ خەلەتە.");
      setLoading(false);
    }
  };

  /* // --- فۆرمێ ڕیجستەرێ یێ کۆمێنتکری بۆ ئاپدێتێن پاشەڕۆژێ ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (userData.password.length < 6) return alert("پاسۆرد پێدڤییە ٦ پیت بیت!");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
      const newUser = userCredential.user;
      let base64Image = "";
      if (userData.profileImg) {
        const reader = new FileReader();
        base64Image = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(userData.profileImg);
        });
      }
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email: email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        photoURL: base64Image,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      await sendEmailVerification(newUser);
      setLoading(false);
      setView('verify');
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };
  */

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const userDocRef = doc(db, "users", googleUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      navigate('/');
    } catch (error) {
      alert(`کێشەیەک هەبوو: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 bg-gray-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl font-semibold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md transition-all duration-500 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">K</div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">KIDO STORE</h1>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Quality is our priority</p>
        </div>

        {view === 'selection' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-4 w-full p-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-bold dark:text-white hover:bg-gray-50 transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
              Continue with Google
            </button>
            <button onClick={() => setView('login')} className="w-full p-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-black transition-all">
              Login with Email
            </button>
            
            {/* // --- دوگمەیا دروستکرنا ئەکاونتی یا کۆمێنتکری ---
            <button onClick={() => setView('register')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              Create New Account
            </button> 
            */}

            <div className="pt-4 border-t dark:border-slate-800 flex justify-center">
              <button onClick={() => navigate('/admin-login')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-amber-600 transition-all uppercase tracking-widest">
                <ShieldCheck size={14} />
                Staff & Admin Only
              </button>
            </div>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 animate-in slide-in-from-right duration-300">
            <input type="email" placeholder="Email Address" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login'}
            </button>
            <button type="button" onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
          </form>
        )}

        {/* // --- لێرە فۆرمێ Register هەبوو، من کۆمێنت کر بۆ هندێ کۆدێ تە تێک نەچیت ---
        */}

        {view === 'verify' && (
          <div className="text-center space-y-4 animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Mail size={40} />
            </div>
            <h2 className="text-xl font-black dark:text-white uppercase">Check your email</h2>
            <p className="text-slate-500 text-sm font-bold" dir="rtl">مە لینکەکێ چالاککرنێ فرێکر، پشتڕاست بکە و پاشان لۆگین ببە.</p>
            <button onClick={() => setView('login')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black">Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;



// import React, { useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Mail, Lock, User as UserIcon, Camera, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
// import { ShopContext } from '../context/ShopContext';
// // ✅ زێدەکرنا ئەوان تشتێن کێم بوون لێرە
// import { auth, db, googleProvider } from '../firebase';
// import { 
//   createUserWithEmailAndPassword, 
//   sendEmailVerification, 
//   signInWithEmailAndPassword, 
//   reload,
//   signInWithPopup // 👈 گرنگە بۆ گوگل
// } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore"; // 👈 گرنگە بۆ داتابەیس
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "../firebase"; // پشتڕاست ببە کو storage د فایلا firebase.js دا هەیە


// const Login = () => {
//   const navigate = useNavigate();
//   const { user } = useContext(ShopContext);

//   const [view, setView] = useState('selection');
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(''); // ✅ زێدەکرنا ستەیتێ ئەیرۆرێ
  
//   const [userData, setUserData] = useState({
//     profileImg: null,
//     firstName: '',
//     lastName: '',
//     username: '',
//     gender: '',
//     password: '',
//     confirmPassword: ''
//   });

//   useEffect(() => {
//     if (user) {
//       navigate('/');
//     }
//   }, [user, navigate]);

//   const handleEmailLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       await reload(userCredential.user);
      
//       if (!userCredential.user.emailVerified) {
//         alert("تکایە ئیمەیڵێ خۆ پشتڕاست بکە! لینک بۆ ئیمەیڵێ تە هاتیە هنارتن.");
//         await auth.signOut(); 
//         setView('verify');    
//         setLoading(false);
//         return; 
//       }
//     } catch (error) {
//       if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
//         alert("ئیمەیڵ یان پاسۆرد یێ خەلەتە.");
//       } else {
//         alert("کێشەیەک د لۆگینێ دا ڕوویدا: " + error.message);
//       }
//       setLoading(false);
//     }
//   };

//       const handleRegister = async (e) => {
//     e.preventDefault();
//     if (userData.password.length < 6) return alert("پاسۆرد پێدڤییە ٦ پیت یان زێدەتر بیت!");
//     if (userData.password !== userData.confirmPassword) return alert("پاسۆرد وەک ئێک نینن!");

//     setLoading(true);
//     try {
//       // ١. دروستکرنا هەژمارێ
//       const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
//       const newUser = userCredential.user;

//       // ٢. گوهۆڕینا وێنەی بۆ دەق (Base64)
//       let base64Image = "";
//       if (userData.profileImg) {
//         const reader = new FileReader();
//         base64Image = await new Promise((resolve) => {
//           reader.onload = () => resolve(reader.result);
//           reader.readAsDataURL(userData.profileImg);
//         });
//       }

//       // ٣. پاشکەفتکرنا داتایان د Firestore دا
//       await setDoc(doc(db, "users", newUser.uid), {
//         uid: newUser.uid,
//         email: email,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         displayName: `${userData.firstName} ${userData.lastName}`,
//         username: userData.username || email.split('@')[0],
//         gender: userData.gender,
//         role: 'user',
//         photoURL: base64Image,
//         createdAt: new Date().toISOString()
//       });

//       // ٤. هنارتنا ئیمەیڵێ ب شێوازێ "Explicit"
//       // لێرە ئەم دبێژینە فایەربەیس: ڤی یوزەری بکاربینە و ئیمەیڵێ بفرێکە
//       try {
//         await sendEmailVerification(newUser);
//         console.log("Verification email sent successfully!");
//       } catch (emailError) {
//         console.error("Error sending email:", emailError);
//         alert("هەژمار دروست بوو، بەلێ ئیمەیڵ نەهاتە هنارتن: " + emailError.message);
//       }

//       setLoading(false);
//       setView('verify');
//     } catch (error) {
//       setLoading(false);
//       console.error("Registration error:", error);
//       alert("کێشەیەک هەبوو: " + error.message);
//     }
//   };

//   // ✅ فەنکشنا گوگڵ ب دروستی
//         const handleGoogleLogin = async () => {
//           setLoading(true);
//           try {
//             const result = await signInWithPopup(auth, googleProvider);
//             const googleUser = result.user;

//             const userDocRef = doc(db, "users", googleUser.uid);
//             const userDoc = await getDoc(userDocRef);

//             if (!userDoc.exists()) {
//               await setDoc(userDocRef, {
//                 uid: googleUser.uid,
//                 email: googleUser.email,
//                 displayName: googleUser.displayName,
//                 photoURL: googleUser.photoURL || '',
//                 role: 'user',
//                 createdAt: new Date().toISOString()
//               });
//             }
//             navigate('/');
//           } catch (error) {
//             console.error("Google Login Error:", error);
//             alert(`کێشەیەک هەبوو: ${error.message}`);
//           } finally {
//             setLoading(false);
//           }
//         };

//         const inputClass = "w-full p-4 bg-gray-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl font-semibold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400";

//         return (
//           <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 font-sans">
//             <div className={`w-full transition-all duration-500 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 ${view === 'register' ? 'max-w-2xl' : 'max-w-md'}`}>
              
//               <div className="text-center mb-8">
//                 <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">K</div>
//                 <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
//                   {view === 'register' ? 'Join KIDO STORE' : 'Welcome Back'}
//                 </h1>

//       {/* ئاگەهدارییا درێژیا پاسۆردی */}
//       {userData.password.length > 0 && userData.password.length < 6 && (
//         <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">
//           ⚠️ پێدڤییە ٦ پیت یان زێدەتر بن
//         </p>
//       )}
//           <p className="text-slate-400 text-xs font-bold mt-1">Quality is our priority</p>
//         </div>

//         {view === 'selection' && (
//           <div className="space-y-4 animate-in fade-in zoom-in duration-300">
//             <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-4 w-full p-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-bold dark:text-white hover:bg-gray-50 transition-all">
//               <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
//               Continue with Google
//             </button>
//             <button onClick={() => setView('login')} className="w-full p-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-black transition-all">
//               Login with Email
//             </button>
//             <button onClick={() => setView('register')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
//               Create New Account
//             </button>
//             <div className="pt-4 border-t dark:border-slate-800 flex justify-center">
//               <button onClick={() => navigate('/admin-login')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-amber-600 transition-all uppercase tracking-widest">
//                 <ShieldCheck size={14} />
//                 Staff & Admin Only
//               </button>
//             </div>
//           </div>
//         )}

//         {view === 'login' && (
//           <form onSubmit={handleEmailLogin} className="space-y-4 animate-in slide-in-from-right duration-300">
//             <input type="email" placeholder="Email Address" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
//             <input type="password" placeholder="Password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
//             <button type="submit" disabled={loading} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black">
//               {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login'}
//             </button>
//             <button type="button" onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
//           </form>
//         )}

//         {view === 'register' && (
//           <form onSubmit={handleRegister} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="flex flex-col md:flex-row gap-8 items-start">
//               <div className="flex flex-col items-center w-full md:w-1/3">
//                 <label className="relative cursor-pointer group">
//                   <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all ${userData.profileImg ? 'border-green-500' : 'border-gray-200 dark:border-slate-800'}`}>
//                     {userData.profileImg ? <img src={URL.createObjectURL(userData.profileImg)} className="w-full h-full object-cover" alt="Profile Preview" /> : <UserIcon size={40} className="text-gray-300" />}
//                   </div>
//                   <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                     <Camera size={32} className="text-white" />
//                   </div>
//                   <input type="file" className="hidden" accept="image/*" onChange={(e) => {
//                     if (e.target.files && e.target.files[0]) {
//                       setUserData({...userData, profileImg: e.target.files[0]});
//                     }
//                   }} />
//                 </label>
//                 <p className="text-[10px] font-black text-indigo-600 uppercase mt-3 tracking-widest text-center">وێنێ پڕۆفایلی</p>
//               </div>
//               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
//                 <input type="text" placeholder="ناڤێ ئێکێ *" className={inputClass} value={userData.firstName} onChange={(e) => setUserData({...userData, firstName: e.target.value})} required />
//                 <input type="text" placeholder="ناڤێ دوویێ *" className={inputClass} value={userData.lastName} onChange={(e) => setUserData({...userData, lastName: e.target.value})} required />
//                 <input type="text" placeholder="ناڤێ بەکارهێنەری" className={inputClass} value={userData.username} onChange={(e) => setUserData({...userData, username: e.target.value})} />
//                 <select className={inputClass} value={userData.gender} onChange={(e) => setUserData({...userData, gender: e.target.value})}>
//                     <option value="">ڕەگەز</option>
//                     <option value="Male">نێر</option>
//                     <option value="Female">مێ</option>
//                 </select>
//                 <div className="md:col-span-2">
//                   <input type="email" placeholder="جیمەیڵ (Email) *" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
//                 </div>
//                 <input type="password" placeholder="پاسۆرد *" className={inputClass} value={userData.password} onChange={(e) => setUserData({...userData, password: e.target.value})} required />
//                 <input type="password" placeholder="دووبارەکرنا پاسۆردی *" className={inputClass} value={userData.confirmPassword} onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})} required />
//               </div>
//             </div>
//             <button type="submit" disabled={loading} className="w-full mt-8 p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">
//               {loading ? <Loader2 className="animate-spin mx-auto" /> : 'تۆمارکردن و ناردنا لینکێ چالاککرنێ'}
//             </button>
//             <button type="button" onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
//           </form>
//         )}

//         {view === 'verify' && (
//           <div className="text-center space-y-4 animate-in zoom-in">
//             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
//               <Mail size={40} />
//             </div>
//             <h2 className="text-2xl font-black dark:text-white">ئیمەیڵێ خۆ پشتڕاست بکە</h2>
//             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed text-center px-4" dir="rtl">
//               مە لینکەکێ چالاککرنێ بۆ ئیمەیڵێ <span className="font-bold text-indigo-500">{email}</span> هنارت.   
//               تکایە کلیک ل سەر وی لینکی بکە، پاشی بزڤڕە و لۆگین ببە.
//             </p>
//             <button onClick={() => setView('login')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700">
//               باشە، دێ لۆگین بم
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;