import React from 'react';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';

export default function AppHeader({ session }) {
  const { setViewMode } = useAppStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="bg-secondary p-3 rounded-full">
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hola,</h1>
          <p className="text-accent hidden md:block">{session.user.email}</p>
        </div>
      </div>
      <button 
        onClick={handleLogout} 
        className="bg-secondary hover:bg-border text-secondary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Cerrar Sesión
      </button>
    </header>
  );
}