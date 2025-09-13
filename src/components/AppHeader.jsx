import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { SunIcon, MoonIcon } from './Icons'; // Asegúrate de tener estos íconos

const AppHeader = ({ session }) => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-full">
          <span className="text-slate-800 dark:text-white font-bold text-lg">A</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ahorrapp</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
        <p className="text-slate-500 dark:text-slate-400 hidden md:block">{session.user.email}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default AppHeader;