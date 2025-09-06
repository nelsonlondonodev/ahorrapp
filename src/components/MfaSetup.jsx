import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const MfaSetup = () => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('loading'); // loading, initial, pendingVerification, enabled

  useEffect(() => {
    setView('loading');
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error('Error listing MFA factors:', error);
      setView('initial'); // Default to initial view on error
      return;
    }
    const verifiedFactors = (data && data.all) ? data.all.filter(factor => factor.status === 'verified') : [];
    console.log('Verified MFA factors:', verifiedFactors);
    if (verifiedFactors.length > 0) {
      setView('enabled');
    } else {
      setView('initial');
    }
  };

  const generateMfa = async () => {
    setLoading(true);
    setQrCodeDataUrl('');
    setSecret('');
    setCode('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No se pudo obtener el usuario: ' + userError?.message);
      }
      const userEmail = user.email;

      // Clean up any existing TOTP factors for the user to avoid conflicts.
      console.log('Checking for existing MFA factors before generating a new one...');
      const { data: { all }, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        // If we can't list factors, we can't be sure it's safe to enroll.
        throw new Error('Could not check existing MFA factors: ' + listError.message);
      }

      const totpFactor = all.find(factor => factor.factor_type === 'totp');
      if (totpFactor) {
        console.log(`Found existing TOTP factor (ID: ${totpFactor.id}, Status: ${totpFactor.status}). Unenrolling it first.`);
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
        if (unenrollError) {
          // If we can't unenroll, we can't enroll a new one.
          throw new Error('Could not remove existing MFA factor: ' + unenrollError.message);
        }
        console.log('Successfully unenrolled existing factor.');
      }

      console.log('Attempting to enroll a new MFA factor...');
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        console.error('Supabase MFA enrollment error:', error);
        throw error;
      }

      if (data && data.totp && data.totp.secret) {
        setFactorId(data.id); // Save the factor ID
        const secret = data.totp.secret;
        const otpAuthUrl = `otpauth://totp/Ahorrapp:${userEmail}?secret=${secret}&issuer=Ahorrapp`;

        QRCode.toDataURL(otpAuthUrl, (err, url) => {
          if (err) {
            console.error('Error generating QR code:', err);
            toast.error('Error al generar el código QR.');
            return;
          }
          setSecret(secret);
          setQrCodeDataUrl(url);
          setView('pendingVerification');
          toast.success('Escanea el código QR con tu aplicación de autenticación.');
        });
      } else {
        console.error('Supabase MFA enrollment returned no data or totp data.');
        toast.error('Error inesperado al generar MFA. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Caught error during MFA generation:', error);
      toast.error(`Error al generar MFA: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const activateMfa = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });

      if (error) throw error;

      toast.success('MFA activado correctamente.');
      setView('enabled');
      setQrCodeDataUrl(''); // Clear QR code after successful setup
      setSecret('');
      setCode('');
    } catch (error) {
      console.error('Error activating MFA:', error);
      toast.error('Error al activar MFA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    setLoading(true);
    try {
      // First, get the factor ID for TOTP (any status)
      const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      // Find any TOTP factor from the 'all' array
      const totpFactor = data.all.find(factor => factor.factor_type === 'totp');

      if (!totpFactor) {
        toast.error('No se encontró ningún factor TOTP para deshabilitar.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (error) throw error;

      toast.success('MFA deshabilitado correctamente.');
      setView('initial');
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Error al deshabilitar MFA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <p className="text-slate-400">Cargando estado de MFA...</p>;
      case 'enabled':
        return (
          <div className="text-center">
            <p className="text-green-400 mb-4">MFA está actualmente habilitado para tu cuenta.</p>
            <button
              onClick={disableMfa}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? 'Deshabilitando...' : 'Deshabilitar MFA'}
            </button>
          </div>
        );
      case 'pendingVerification':
        return (
          <div className="text-center">
            <p className="text-slate-300 mb-4">Escanea el código QR con tu aplicación de autenticación (ej. Google Authenticator):</p>
            <div className="bg-white p-4 inline-block rounded-lg mb-4">
              {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="Código QR de MFA" className="w-48 h-48" />}
            </div>
            <p className="text-slate-400 text-sm mb-4">O introduce el secreto manualmente: <span className="font-mono text-white break-all">{secret}</span></p>

            <div className="mb-4">
              <label htmlFor="mfa-code" className="block text-slate-400 text-sm font-bold mb-2">Código de Verificación</label>
              <input
                id="mfa-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-center tracking-widest"
                placeholder="XXXXXX"
                maxLength="6"
              />
            </div>
            <button
              onClick={activateMfa}
              disabled={loading || code.length !== 6}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50"
            >
              {loading ? 'Activando...' : 'Activar MFA'}
            </button>
          </div>
        );
      case 'initial':
      default:
        return (
          <button
            onClick={generateMfa}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Código QR'}
          </button>
        );
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-4">Configurar Autenticación de Múltiples Factores (MFA)</h2>
      <p className="text-slate-400 mb-6">Añade una capa extra de seguridad a tu cuenta.</p>
      {renderContent()}
    </div>
  );
};

export default MfaSetup;
