import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Auth({ supabase }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleMagicLinkLogin = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Por favor, introduce un correo para enviar el enlace.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            toast.error(error.error_description || error.message);
        } else {
            toast.success('¡Revisa tu correo para el enlace de inicio de sesión!');
        }
        setLoading(false);
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.error_description || error.message);
        }
        // No success message needed, the component will just re-render
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin, // Redirects back to the current page
            },
        });
        if (error) {
            alert(error.error_description || error.message);
        }
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        if (!email) {
            toast.error('Por favor, introduce tu email para restablecer la contraseña.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) {
            toast.error(error.error_description || error.message);
        } else {
            toast.success('¡Revisa tu correo para restablecer tu contraseña!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h1 className="text-3xl font-bold text-white text-center mb-2">Ahorrapp</h1>
                <p className="text-slate-400 text-center mb-8">Inicia sesión o crea una cuenta</p>
                <form onSubmit={handlePasswordLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-slate-400 text-sm font-bold mb-2">Correo Electrónico</label>
                        <input
                            id="email"
                            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-slate-400 text-sm font-bold mb-2">Contraseña</label>
                        <input
                            id="password"
                            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="text-right mt-2">
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-sm text-sky-400 hover:text-sky-300 font-medium"
                            >
                                ¿Has olvidado tu contraseña?
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <button 
                            type="submit"
                            className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <span>Iniciando...</span> : <span>Iniciar Sesión</span>}
                        </button>
                        <button 
                            type="button"
                            onClick={handleMagicLinkLogin}
                            className="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-600/20 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <span>Enviando...</span> : <span>Enviar enlace mágico</span>}
                        </button>
                    </div>
                </form>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400">O</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                    disabled={loading}
                >
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    );
}
