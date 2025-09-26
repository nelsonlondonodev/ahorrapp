import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const MfaSetup = () => {
  const [mfaEnabled, setMfaEnabled] = useState(null);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkMfaStatus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) {
      toast.error('Error al obtener el estado de MFA.');
      console.error('Error fetching MFA status:', error);
      setMfaEnabled(false);
    } else {
      setMfaEnabled(data.currentLevel === 'aal2');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkMfaStatus();
  }, [checkMfaStatus]);

  const handleEnableMfa = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) {
      toast.error(error.message);
      console.error('Error enrolling MFA:', error);
      setLoading(false);
      return;
    }

    setSecret(data.totp.secret);
    setQrCodeUrl(data.totp.qr_code);
    setLoading(false);
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: secret, // In enrollment, the secret acts as the initial factorId reference
      code: verificationCode,
    });

    if (error) {
      toast.error(error.message);
      console.error('Error verifying MFA:', error);
    }
    else {
      // On successful verification, Supabase automatically enables MFA (aal2).
      // Now, get recovery codes.
      const { data: recoveryData, error: recoveryError } = await supabase.auth.mfa.getRecoveryCodes();
      if (recoveryError) {
        toast.error('No se pudieron generar los códigos de recuperación.');
        console.error('Error getting recovery codes:', recoveryError);
      } else {
        setRecoveryCodes(recoveryData.codes);
        toast.success('¡MFA habilitado con éxito!');
        setSecret(''); // Clear sensitive data
        setQrCodeUrl('');
        setVerificationCode('');
        await checkMfaStatus(); // Re-check status to update UI
      }
    }
    setLoading(false);
  };

  const handleDisableMfa = async () => {
    setLoading(true);
    const { error } = await supabase.auth.mfa.unenroll({
      factorId: 'aal2', // This might need adjustment based on how you track factor IDs
    });

    if (error) {
      toast.error(error.message);
      console.error('Error disenrolling MFA:', error);
    } else {
      toast.success('MFA deshabilitado.');
      setMfaEnabled(false);
      setRecoveryCodes([]);
      await checkMfaStatus();
    }
    setLoading(false);
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast.success('¡Códigos de recuperación copiados!');
  };

  if (loading && mfaEnabled === null) {
    return <p className="text-accent">Cargando estado de MFA...</p>;
  }

  if (mfaEnabled) {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-4">MFA Habilitado</h3>
        <p className="text-accent mb-6">La autenticación de múltiples factores está activa en tu cuenta.</p>
        <button
          onClick={handleDisableMfa}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Deshabilitando...' : 'Deshabilitar MFA'}
        </button>
      </div>
    );
  }

  if (secret) {
    return (
      <form onSubmit={handleVerifyMfa} className="bg-card border border-border p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-4">Configurar MFA</h3>
        <p className="text-accent mb-4">Escanea el código QR con tu aplicación de autenticación (ej. Google Authenticator):</p>
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          <QRCodeSVG value={qrCodeUrl} size={128} />
        </div>
        <p className="text-accent text-sm mb-4">O introduce el secreto manualmente: <span className="font-mono text-foreground break-all">{secret}</span></p>
        <div className="mb-4">
          <label htmlFor="mfa-code" className="block text-accent text-sm font-bold mb-2">Código de Verificación</label>
          <input
            id="mfa-code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full bg-input text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center tracking-widest"
            placeholder="123456"
            maxLength="6"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Verificar y Habilitar'}
        </button>
      </form>
    );
  }

  if (recoveryCodes.length > 0) {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-4">¡Guarda tus Códigos de Recuperación!</h3>
        <p className="text-accent mb-4">Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes el acceso a tu dispositivo.</p>
        <div className="bg-input p-4 rounded-lg mb-4">
          <pre className="text-foreground whitespace-pre-wrap break-words"><code>{recoveryCodes.join('\n')}</code></pre>
        </div>
        <button onClick={handleCopyRecoveryCodes} className="w-full bg-secondary text-secondary-foreground font-bold py-3 px-6 rounded-lg hover:bg-border transition-colors mb-4">
          Copiar Códigos
        </button>
        <button onClick={() => setRecoveryCodes([])} className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
          Hecho
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-4">Activar Autenticación de Múltiples Factores (MFA)</h3>
      <p className="text-accent mb-6">Añade una capa extra de seguridad a tu cuenta.</p>
      <button
        onClick={handleEnableMfa}
        className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Generando...' : 'Activar MFA'}
      </button>
    </div>
  );
};

export default MfaSetup;
