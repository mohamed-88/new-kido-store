import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => { // مە ناڤێ فۆنکشنێ گۆهۆڕی بۆ ڕوونیێ
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // ل ڤێرە تو دشێی ناڤ و پاسوۆردێ ئەدمینی دیار بکەی
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      setIsAuthenticated(true);
      navigate('/admin');
    } else {
      alert('ناڤ یان پاسوۆرد خەلەتە!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 dark:shadow-none">
            <Lock className="text-white" size={36} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white italic">KIDO LOGIN</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold">تەنێ بۆ بڕێوەبەر (Admin)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" dir="rtl">
          <div className="relative group">
            <User className="absolute right-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" placeholder="ناڤێ بەکارهێنەر" required
              className="w-full pr-12 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Lock className="absolute right-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="password" placeholder="پاسوۆرد" required
              className="w-full pr-12 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95">
            <LogIn size={22} /> چوونەژوورێ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;