import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Camera, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, reload } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 

const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useContext(ShopContext);

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

  // --- ✅ فەنکشنا چارەسەرکری ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Pêşî hewl bide ku bikarhêner têkeve hundur
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Daneyên bikarhêner ji serverê nû bike da ku rewşa herî dawî ya 'emailVerified' bistîne
      await reload(userCredential.user);
      
      // 3. Naha kontrol bike ka email hatiye verîfîkirin an na
      if (!userCredential.user.emailVerified) {
        // Eger nehatibe verîfîkirin:
        alert("تکایە ئیمەیڵێ خۆ پشتڕاست بکە! لینک بۆ ئیمەیڵێ تە هاتیە هنارتن.");
        await auth.signOut(); // Wî ji sîstemê derxîne da ku têketî nemîne
        setView('verify');    // Wî bişîne rûpela peyamê
        setLoading(false);
        return; // Prosesê rawestîne
      }
      
      // Eger email hatibe verîfîkirin, useEffect dê karê xwe bike û wî bişîne rûpela serekî.
      // Em ê loading li vir nekin false da ku bikarhêner hest bi leza zivirînê bike.

    } catch (error) {
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
        alert("ئیمەیڵ یان پاسۆرد یێ خەلەتە.");
      } else {
        alert("کێشەیەک د لۆگینێ دا ڕوویدا: " + error.message);
      }
      setLoading(false); // Tenê di dema xeletiyê de loading bike false
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) return alert("پاسۆرد وەک ئێک نینن!");
    if (!userData.firstName || !userData.lastName || !email || !userData.password) return alert("تکایە هەمی خانەیێن پێدڤی پڕ بکە.");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split('@')[0],
        gender: userData.gender,
        role: 'user',
        isVerified: false,
        createdAt: new Date().toISOString(),
        photoURL: ''
      });
      setView('verify');
    } catch (error) {
      alert("کێشەیەک د تۆمارکرنێ دا ڕوویدا: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("کێشەیەک د لۆگینکرنا ب Google دا روویدا.");
    }
  };

  const inputClass = "w-full p-4 bg-gray-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl font-semibold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 font-sans">
      <div className={`w-full transition-all duration-500 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 ${view === 'register' ? 'max-w-2xl' : 'max-w-md'}`}>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">K</div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
            {view === 'register' ? 'Join KIDO STORE' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-xs font-bold mt-1">Quality is our priority</p>
        </div>

        {view === 'selection' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-4 w-full p-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-bold dark:text-white hover:bg-gray-50 transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
              Continue with Google
            </button>
            <button onClick={( ) => setView('login')} className="w-full p-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-black transition-all">
              Login with Email
            </button>
            <button onClick={() => setView('register')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              Create New Account
            </button>
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
            <button type="submit" disabled={loading} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login'}
            </button>
            <button type="button" onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center w-full md:w-1/3">
                <label className="relative cursor-pointer group">
                  <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all ${userData.profileImg ? 'border-green-500' : 'border-gray-200 dark:border-slate-800'}`}>
                    {userData.profileImg ? <img src={URL.createObjectURL(userData.profileImg)} className="w-full h-full object-cover" alt="Profile Preview" /> : <UserIcon size={40} className="text-gray-300" />}
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white" />
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUserData({...userData, profileImg: e.target.files[0]});
                    }
                  }} />
                </label>
                <p className="text-[10px] font-black text-indigo-600 uppercase mt-3 tracking-widest text-center">وێنێ پڕۆفایلی</p>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input type="text" placeholder="ناڤێ ئێکێ *" className={inputClass} onChange={(e) => setUserData({...userData, firstName: e.target.value})} required />
                <input type="text" placeholder="ناڤێ دوویێ *" className={inputClass} onChange={(e) => setUserData({...userData, lastName: e.target.value})} required />
                <input type="text" placeholder="ناڤێ بەکارهێنەری" className={inputClass} onChange={(e) => setUserData({...userData, username: e.target.value})} />
                <select className={inputClass} onChange={(e) => setUserData({...userData, gender: e.target.value})}>
                    <option value="">ڕەگەز</option>
                    <option value="Male">نێر</option>
                    <option value="Female">مێ</option>
                </select>
                <div className="md:col-span-2">
                  <input type="email" placeholder="جیمەیڵ (Email) *" className={inputClass} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <input type="password" placeholder="پاسۆرد *" className={inputClass} onChange={(e) => setUserData({...userData, password: e.target.value})} required />
                <input type="password" placeholder="دووبارەکرنا پاسۆردی *" className={inputClass} onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-8 p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'تۆمارکردن و ناردنا لینکێ چالاککرنێ'}
            </button>
            <button type="button" onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
          </form>
        )}

        {view === 'verify' && (
          <div className="text-center space-y-4 animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
              <Mail size={40} />
            </div>
            <h2 className="text-2xl font-black dark:text-white">ئیمەیڵێ خۆ پشتڕاست بکە</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed text-center px-4" dir="rtl">
              مە لینکەکێ چالاککرنێ بۆ ئیمەیڵێ <span className="font-bold text-indigo-500">{email}</span> هنارت.   

              تکایە کلیک ل سەر وی لینکی بکە، پاشی بزڤڕە و لۆگین ببە.
            </p>
            <button onClick={() => setView('login')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700">
              باشە، دێ لۆگین بم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;







// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Mail, Lock, User as UserIcon, Camera, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
// import { ShopContext } from '../context/ShopContext';
// import { auth, db } from '../firebase';
// import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
// import { ref, set } from "firebase/database";

// const Login = () => {
//   const navigate = useNavigate();
//   const { loginWithGoogle } = useContext(ShopContext);

//   // States
//   const [view, setView] = useState('selection'); // selection, login, register, verify
//   const [loading, setLoading] = useState(false);
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const [userData, setUserData] = useState({
//     profileImg: '',
//     firstName: '',
//     lastName: '',
//     username: '',
//     gender: ''
//   });

//   const handleEmailLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate('/userprofile');
//     } catch (error) {
//       alert("Error: " + error.message);
//     } finally { setLoading(false); }
//   };

//   // ١. فۆنکشنا دروستکرنا هەژمارێ و فرێکرنا لینکی بۆ جیمەیڵێ
// const handleRegister = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   try {
//     // ١. دروستکرنا هەژمارێ
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
//     console.log("User Created:", user);

//     // ٢. فرێکرنا لینکێ پشتڕاستکرنێ
//     await sendEmailVerification(user);
//     console.log("Verification email sent!");

//     // ٣. پاشەکەوتکردن د داتابەیسێ دا
//     await set(ref(db, `users/${user.uid}`), {
//       uid: user.uid,
//       email: email,
//       ...userData,
//       isVerified: false
//     });

//     setView('verify');
//   } catch (error) {
//     console.error("Error Code:", error.code);
//     console.error("Error Message:", error.message);
//     alert("ئاریشە: " + error.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   const inputClass = "w-full p-4 bg-gray-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl font-semibold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400";

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 font-sans">
//       <div className={`w-full transition-all duration-500 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 ${view === 'register' ? 'max-w-2xl' : 'max-w-md'}`}>
        
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">K</div>
//           <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
//             {view === 'register' ? 'Join KIDO STORE' : 'Welcome Back'}
//           </h1>
//           <p className="text-slate-400 text-xs font-bold mt-1">Quality is our priority</p>
//         </div>

//         {view === 'selection' && (
//           <div className="space-y-4 animate-in fade-in zoom-in duration-300">
//             <button onClick={() => loginWithGoogle?.()} className="flex items-center justify-center gap-4 w-full p-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-bold dark:text-white hover:bg-gray-50 transition-all">
//               <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
//               Continue with Google
//             </button>
            
//             <button onClick={() => setView('login')} className="w-full p-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-black transition-all">
//               Login with Email
//             </button>
            
//             <button onClick={() => setView('register')} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
//               Create New Account
//             </button>

//             {/* --- دوگمەیا ئەدمینی ل بن هەموویان --- */}
//             <div className="pt-4 border-t dark:border-slate-800 flex justify-center">
//               <button 
//                 onClick={() => navigate('/admin-login')} 
//                 className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-amber-600 transition-all uppercase tracking-widest"
//               >
//                 <ShieldCheck size={14} />
//                 Staff & Admin Only
//               </button>
//             </div>
//           </div>
//         )}

//         {view === 'login' && (
//           <form onSubmit={handleEmailLogin} className="space-y-4 animate-in slide-in-from-right duration-300">
//             <input type="email" placeholder="Email Address" className={inputClass} value={email} onChange={(e)=>setEmail(e.target.value)} required />
//             <input type="password" placeholder="Password" className={inputClass} value={password} onChange={(e)=>setPassword(e.target.value)} required />
//             <button type="submit" disabled={loading} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black">
//               {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login'}
//             </button>
//             <button onClick={() => setView('selection')} className="w-full text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 mt-4"><ArrowLeft size={14}/> Back</button>
//           </form>
//         )}

//         {view === 'register' && (
//   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//     <div className="flex flex-col md:flex-row gap-8 items-start">
      
//       {/* بەشێ وێنەی */}
//       <div className="flex flex-col items-center w-full md:w-1/3">
//         <label className="relative cursor-pointer group">
//           <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all ${userData.profileImg ? 'border-green-500' : 'border-gray-200 dark:border-slate-800'}`}>
//             {userData.profileImg ? <img src={userData.profileImg} className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-gray-300" />}
//           </div>
//           <input type="file" className="hidden" accept="image/*" onChange={(e) => {
//             const file = e.target.files[0];
//             if (file) {
//               const reader = new FileReader();
//               reader.onloadend = () => setUserData({...userData, profileImg: reader.result});
//               reader.readAsDataURL(file);
//             }
//           }} />
//         </label>
//         <p className="text-[10px] font-black text-indigo-600 uppercase mt-3 tracking-widest">وێنێ پڕۆفایلی *</p>
//       </div>

//       {/* خانەیێن داخلکرنا زانیارییان */}
//       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
//         <input type="text" placeholder="ناڤێ ئێکێ" className={inputClass} onChange={(e)=>setUserData({...userData, firstName: e.target.value})} />
//         <input type="text" placeholder="ناڤێ دوویێ" className={inputClass} onChange={(e)=>setUserData({...userData, lastName: e.target.value})} />
//         <input type="text" placeholder="ناڤێ بەکارهێنەری" className={inputClass} onChange={(e)=>setUserData({...userData, username: e.target.value})} />
//         <select className={inputClass} onChange={(e)=>setUserData({...userData, gender: e.target.value})}>
//             <option value="">ڕەگەز</option>
//             <option value="Male">نێر</option>
//             <option value="Female">مێ</option>
//         </select>
//         <div className="md:col-span-2">
//           <input type="email" placeholder="جیمەیڵ (Email)" className={inputClass} onChange={(e)=>setUserData({...userData, email: e.target.value})} />
//         </div>
//         <input type="password" placeholder="پاسۆرد" className={inputClass} onChange={(e)=>setUserData({...userData, password: e.target.value})} />
//         <input type="password" placeholder="دووبارەکرنا پاسۆردی" className={inputClass} onChange={(e)=>setUserData({...userData, confirmPassword: e.target.value})} />
//       </div>
//     </div>

//     <button onClick={handleRegister} disabled={loading} className="w-full mt-8 p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">
//       {loading ? <Loader2 className="animate-spin mx-auto" /> : 'تۆمارکردن و ناردنا لینکێ چالاککرنێ'}
//     </button>
//   </div>
// )}

//         {view === 'verify' && (
//           <div className="text-center space-y-4 animate-in zoom-in">
//             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
//               <Mail size={40} />
//             </div>
//             <h2 className="text-xl font-bold dark:text-white font-sans">Check Your Email</h2>
//             <p className="text-slate-400 text-sm font-medium leading-relaxed" dir="rtl">
//               مە لینکەکێ پشتڕاستکرنێ بۆ ئیمەیڵێ تە فرێکر. پشتی تە کلیک لێ کر، دشێی وەرە ژوورێ.
//             </p>
//             <button onClick={() => window.location.reload()} className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold">I Verified, Login Now</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;