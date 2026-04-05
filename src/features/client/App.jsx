import React from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientProject");
    localStorage.removeItem("welcomeShown");
    navigate("/client/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black text-2xl p-8 text-center">
      <div>
        <div className="mb-4">DASHBOARD ISOLATED</div>
        <div className="text-lg text-slate-400 font-medium tracking-tight">
          Checking for environment stability...
        </div>
        <button 
          onClick={handleLogout} 
          className="mt-12 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-[10px] uppercase tracking-widest transition-colors font-bold"
        >
          Logout Account
        </button>
      </div>
    </div>
  );
};

export default App;
