import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { GoogleIcon, MailIcon, MagicLinkIcon } from './Icons'; // Importar los nuevos iconos

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
        <div className="min-h-screen bg-secondary text-foreground flex flex-col items-center justify-center">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h1 className="text-4xl font-bold text-foreground text-center mb-4">Ahorrapp</h1>
                <p className="text-accent text-center mb-10">Inicia sesión o crea una cuenta</p>
                <form onSubmit={handlePasswordLogin}>
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-accent text-sm font-bold mb-2">Correo Electrónico</label>
                        <input
                            id="email"
                            className="w-full bg-background border border-border text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="password" className="block text-accent text-sm font-bold mb-2">Contraseña</label>
                        <input
                            id="password"
                            className="w-full bg-background border border-border text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="text-right mt-3">
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                ¿Has olvidado tu contraseña?
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <button 
                            type="submit"
                            className="w-full flex items-center justify-center bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50"
                            disabled={loading}
                        >
                            <MailIcon className="w-5 h-5 mr-2" />
                            {loading ? <span>Iniciando...</span> : <span>Iniciar Sesión</span>}
                        </button>
                        <button 
                            type="button"
                            onClick={handleMagicLinkLogin}
                            className="w-full flex items-center justify-center bg-transparent border border-border text-secondary-foreground font-bold py-3 px-6 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            <MagicLinkIcon className="w-5 h-5 mr-2" />
                            {loading ? <span>Enviando...</span> : <span>Acceder con enlace mágico</span>}
                        </button>
                    </div>
                </form>

                <div className="relative flex py-8 items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-accent text-sm">O CONTINÚA CON</span>
                    <div className="flex-grow border-t border-border"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center bg-transparent border border-border text-secondary-foreground font-bold py-3 px-6 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    <GoogleIcon className="w-5 h-5 mr-3" />
                    Google
                </button>
            </div>
        </div>
    );
}
