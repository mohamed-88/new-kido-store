import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, User } from 'lucide-react';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser === "admin" && adminPass === "admin123") {
      localStorage.setItem('isAdmin', 'true');
      alert("ب خێر بێی جەنابێ ئەدمین");
      navigate('/admin');
    } else {
      alert("Admin ID یان Passcode یێ شەکەیە!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] border-2 border-amber-500/20 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-600 flex items-center justify-center text-white shadow-xl">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black dark:text-white uppercase">Admin Portal</h1>
          <p className="text-slate-400 text-xs font-bold mt-1">Authorized Access Only</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Admin ID" 
              className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold"
              value={adminUser} onChange={(e) => setAdminUser(e.target.value)} required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" placeholder="Passcode" 
              className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-bold"
              value={adminPass} onChange={(e) => setAdminPass(e.target.value)} required
            />
          </div>
          <button type="submit" className="w-full p-4 rounded-2xl bg-amber-600 text-white font-black flex items-center justify-center gap-3 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 dark:shadow-none">
            Access Dashboard <ArrowRight size={20} />
          </button>
            <div className="pt-4 border-t dark:border-slate-800 flex justify-center">
                  <button 
                  onClick={() => navigate('/login')} 
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-amber-600 transition-all uppercase tracking-widest"
                >
              <ShieldCheck size={14} />
                    Back to User Login
                  </button>
              </div>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;