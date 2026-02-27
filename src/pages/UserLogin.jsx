import React, { useState, useContext, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, 
  updateProfile, sendEmailVerification, reload, RecaptchaVerifier, signInWithPhoneNumber 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Chrome, UserPlus, AlertCircle, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { doc, setDoc, getDoc } from "firebase/firestore";

const UserLogin = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(ShopContext);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  // --- ١. لۆجیکێ Email Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await reload(userCredential.user);
      if (!userCredential.user.emailVerified) {
        setError("تکایە ئیمەیڵێ خۆ پشتڕاست بکە! لینک بۆ تە هاتیە هنارتن.");
        await auth.signOut();
        return;
      }
    } catch (err) { setError('ئیمێڵ یان پاسۆرد یێ خەلەتە!'); }
  };

  // --- ٢. لۆجیکێ Google Login ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid, email: user.email, displayName: user.displayName,
          role: 'user', createdAt: new Date().toISOString()
        });
      }
    } catch (err) { setError('ئاریشەک د چونەژوورێ دا هەیە ب ڕێکا گوگل'); }
  };

  // --- ٣. لۆجیکێ Phone Login (OTP) ---
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber.startsWith('+')) return setError("تکایە ژمارێ ب کۆدێ وڵاتی بنڤێسە (نموونە: +964)");
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert("کۆد بۆ مۆبایلا تە هاتە هنارتن");
    } catch (err) { setError("خەتا د هنارتنا کۆدی دا: " + err.message); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(otp);
      navigate('/');
    } catch (err) { setError("کۆدێ تە یێ خەلەتە!"); }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4" dir="rtl">
      <div id="recaptcha-container"></div>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[3rem] shadow-2xl border dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black dark:text-white mb-2">
            {view === 'login' ? 'خێر هاتی پاش' : view === 'phone' ? 'کۆدێ موبایلێ' : 'دروستکرنا ئەکاونتی'}
          </h1>
          <p className="text-gray-500 text-sm font-bold">تکایە زانیاریێن خۆ بنڤێسە</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 flex items-center gap-2 text-xs font-bold">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {/* --- لۆجیکێ پیشاندانا فۆرمان --- */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative"><Mail className="absolute right-4 top-4 text-gray-400" size={20}/><input type="email" placeholder="ئیمێڵ" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="relative"><Lock className="absolute right-4 top-4 text-gray-400" size={20}/><input type="password" placeholder="پاسۆرد" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><LogIn size={20}/> چونەژوورێ</button>
          </form>
        )}

        {view === 'phone' && (
          <form onSubmit={!confirmationResult ? handleSendOtp : handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <Phone className="absolute right-4 top-4 text-gray-400" size={20}/>
              <input disabled={confirmationResult} type="text" placeholder="+9647500000000" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </div>
            {confirmationResult && (
              <div className="relative">
                <ShieldCheck className="absolute right-4 top-4 text-gray-400" size={20}/>
                <input type="text" placeholder="کۆدێ ٦ ژمارەیی" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
            )}
            <button disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all">
              {loading ? 'چاوەڕێ بکە...' : !confirmationResult ? 'هنارتنا کۆدی' : 'پشتڕاستکرن'}
            </button>
          </form>
        )}

        {/* --- دوکمەیێن گوگل و مۆبایل --- */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-slate-800"></div></div>
          <span className="relative px-4 bg-white dark:bg-slate-900 text-gray-400 text-xs font-bold">یان</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleGoogleLogin} className="py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
            <Chrome size={18} className="text-red-500"/> Google
          </button>
          <button onClick={() => setView(view === 'phone' ? 'login' : 'phone')} className="py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
            <Phone size={18} className="text-green-500"/> Phone
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 font-bold">
          {view === 'login' ? 'ئەکاونتەک نینە؟' : 'ئەکاونتەک هەیە؟'}
          <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-indigo-600 mr-2 underline">
            {view === 'login' ? 'تۆمارکرنا نوی' : 'بچۆ ژوورێ'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;



// import React, { useState, useContext, useEffect } from 'react';
// import { auth, db, googleProvider } from '../firebase';
// // ✅ reload و sendEmailVerification بهێنە
// import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, reload } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Mail, Lock, LogIn, Chrome, UserPlus, AlertCircle, User as UserIcon } from 'lucide-react';
// import { ShopContext } from '../context/ShopContext';
// import { doc, setDoc } from "firebase/firestore";

// const UserLogin = () => {
//   const [view, setView] = useState('login');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const navigate = useNavigate();
//   const { user } = useContext(ShopContext);

//   useEffect(() => {
//     if (user) {
//       navigate('/');
//     }
//   }, [user, navigate]);

//   // --- ✅ فەنکشنا چارەسەرکری یا Login ---
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
//       // Daneyên bikarhêner ji serverê nû bike
//       await reload(userCredential.user);
      
//       // Kontrol bike ka email hatiye verîfîkirin an na
//       if (!userCredential.user.emailVerified) {
//         setError("تکایە ئیمەیڵێ خۆ پشتڕاست بکە! لینک بۆ ئیمەیڵێ تە هاتیە هنارتن.");
//         await auth.signOut(); // Wî ji sîstemê derxîne
//         return; // Prosesê rawestîne
//       }
//       // Heke verîfîkasyon hatibe kirin, useEffect dê wî bişîne rûpela serekî

//     } catch (err) {
//       setError('ئیمێڵ یان پاسۆرد یێ خەلەتە!');
//     }
//   };

//   // --- ✅ فەنکشنا چارەسەرکری یا Register ---
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError('');
//     if (!firstName || !lastName || !email) { // ✅ پشکنینا ئیمەیلی ل ڤێرێ زێدە بوو
//       setError("تکایە هەمی خانەیان پڕ بکە.");
//       return;
//     }
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const newUser = userCredential.user;

//       // ١. لینکێ پشتڕاستکرنێ بهنێرە
//       await sendEmailVerification(newUser);
      
//       const displayName = `${firstName} ${lastName}`;
//       await updateProfile(newUser, { displayName: displayName });

//       await setDoc(doc(db, "users", newUser.uid), {
//         uid: newUser.uid,
//         email: newUser.email,
//         displayName: displayName,
//         firstName: firstName,
//         lastName: lastName,
//         photoURL: '',
//         createdAt: new Date().toISOString(),
//         role: 'user',
//         isVerified: false
//       });

//       alert("هژمارا تە هاتە دروستکرن! تکایە ئیمەیڵێ خۆ پشکنینە بۆ پشتڕاستکرنێ.");
//       setView('login');

//     } catch (err) {
//       if (err.code === 'auth/email-already-in-use') {
//         setError('ئەڤ ئیمەیلە بەری نوکە هاتیە تۆمارکرن.');
//       } else {
//         setError('کێشەیەک د دروستکرنا هژمارێ دا ڕوویدا.');
//       }
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await signInWithPopup(auth, googleProvider);
//     } catch (err) {
//       setError('ئاریشەک د چونەژوورێ دا هەیە');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4" dir="rtl">
//       <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[3rem] shadow-2xl border dark:border-slate-800">
        
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-black dark:text-white mb-2">
//             {view === 'login' ? 'ب خێر بێی پاش' : 'دروستکرنا ئەکاونتی'}
//           </h1>
//           <p className="text-gray-500 text-sm font-bold">تکایە زانیاریێن خۆ بنڤێسە</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 flex items-center gap-2 text-xs font-bold">
//             <AlertCircle size={16}/> {error}
//           </div>
//         )}

//         {view === 'login' ? (
//           <form onSubmit={handleLogin} className="space-y-4">
//             {/* ... Forma Login wekî xwe dimîne ... */}
//             <div className="relative">
//               <Mail className="absolute right-4 top-4 text-gray-400" size={20}/>
//               <input type="email" placeholder="ئیمێڵ" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>
//             <div className="relative">
//               <Lock className="absolute right-4 top-4 text-gray-400" size={20}/>
//               <input type="password" placeholder="پاسۆرد" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
//             </div>
//             <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
//               <LogIn size={20}/> چونەژوورێ
//             </button>
//           </form>
//         ) : (
//           // --- ✅ Forma Register ya rastkirî ---
//           <form onSubmit={handleRegister} className="space-y-4">
//             <div className="flex gap-4">
//               <div className="relative w-1/2">
//                 <UserIcon className="absolute right-4 top-4 text-gray-400" size={20}/>
//                 <input type="text" placeholder="ناڤێ ئێکێ" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
//               </div>
//               <div className="relative w-1/2">
//                 <UserIcon className="absolute right-4 top-4 text-gray-400" size={20}/>
//                 <input type="text" placeholder="ناڤێ دوویێ" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
//               </div>
//             </div>
//             {/* --- ✨ چارەسەری ل ڤێرەیە: Input-a Email-ê --- */}
//             <div className="relative">
//               <Mail className="absolute right-4 top-4 text-gray-400" size={20}/>
//               <input type="email" placeholder="ئیمێڵ" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>
//             <div className="relative">
//               <Lock className="absolute right-4 top-4 text-gray-400" size={20}/>
//               <input type="password" placeholder="پاسۆرد" className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
//             </div>
//             <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
//               <UserPlus size={20}/> دروستکرن
//             </button>
//           </form>
//         )}

//         {/* ... Beşên mayî wekî xwe dimînin ... */}
//         <div className="relative my-8 text-center">
//           <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-slate-800"></div></div>
//           <span className="relative px-4 bg-white dark:bg-slate-900 text-gray-400 text-xs font-bold uppercase">یان</span>
//         </div>
//         <button onClick={handleGoogleLogin} className="w-full py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
//           <Chrome size={20} className="text-red-500"/> بەردەوامبە ب Google
//         </button>
//         <p className="text-center mt-8 text-sm text-gray-500 font-bold">
//           {view === 'login' ? 'ئەکاونتەک نینە؟' : 'ئەکاونتەک هەیە؟'}
//           <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="text-indigo-600 mr-2 underline">
//             {view === 'login' ? 'ئەکاونتەکێ نوی دروست بکە' : 'بچۆ ژوورێ'}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default UserLogin;