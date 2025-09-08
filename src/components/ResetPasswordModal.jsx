import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function ResetPasswordModal({ supabase, onClose }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            toast.error(error.error_description || error.message);
        } else {
            toast.success('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-white text-2xl font-bold mb-6">Crea tu nueva contraseña</h2>
                <form onSubmit={handlePasswordReset}>
                    <div className="mb-6">
                        <label htmlFor="new-password" className="block text-slate-400 text-sm font-bold mb-2">Nueva Contraseña</label>
                        <input
                            id="new-password"
                            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-6">
                        <button 
                            type="submit"
                            className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <span>Guardando...</span> : <span>Guardar Contraseña</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
