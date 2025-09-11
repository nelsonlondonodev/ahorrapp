import React from 'react';
import { supabase } from '../supabaseClient'; // Assuming supabase is passed or imported

const AppHeader = ({ session }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="bg-slate-800 p-3 rounded-full">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Ahorrapp</h1>
      </div>
      <div className="flex items-center space-x-4">
        <p className="text-slate-400 hidden md:block">{session.user.email}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default AppHeader;