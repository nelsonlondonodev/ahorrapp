import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';

// El icono UploadIcon se usa solo en este componente, así que lo definimos aquí.
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

// El componente recibe props para manejar su estado y acciones desde el componente padre (App.jsx).
export default function AddTransactionModal({ onClose, onSave, transactionToEdit, selectedDate }) {
    const [description, setDescription] = useState(transactionToEdit?.description || '');
    const [amount, setAmount] = useState(transactionToEdit?.amount || '');
    const [category, setCategory] = useState(transactionToEdit?.category || 'Comida');
    const [type, setType] = useState(transactionToEdit?.type || 'expense');
    const [date, setDate] = useState(transactionToEdit?.date || selectedDate || new Date().toISOString().split('T')[0]);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fileName, setFileName] = useState('');
    const descriptionInputRef = useRef(null);

    // Pone el foco en el campo de descripción al abrir el modal.
    useEffect(() => {
        descriptionInputRef.current?.focus();
    }, []);

    // Maneja la lógica de escaneo de recibos con Tesseract.js.
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsScanning(true);
        toast.loading('Escaneando recibo...', { id: 'ocr-loading' });

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'spa', // Usamos español para el reconocimiento.
                {
                    logger: m => console.log(m), // Loguea el progreso del OCR en la consola.
                }
            );

            console.log('Texto extraído:', text);
            toast.dismiss('ocr-loading');
            toast.success('¡Recibo escaneado!');

            // Lógica para extraer datos relevantes del texto extraído.
            let extractedAmount = '';
            let extractedDescription = 'Gasto'; // Descripción por defecto.

            // Intenta extraer el importe total con una expresión regular robusta.
            const amountRegex = /(?:TOTAL|IMPORTE|PAGAR|EUR)\s*:?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i;
            const amountMatch = text.match(amountRegex);
            if (amountMatch && amountMatch[1]) {
                extractedAmount = amountMatch[1].replace(',', '.'); // Normaliza a punto decimal.
            }

            // Usa la primera línea no vacía como descripción.
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0) {
                extractedDescription = lines[0].trim();
            }
            
            // Actualiza el estado del formulario con los datos extraídos.
            if(extractedAmount) setAmount(extractedAmount);
            if(extractedDescription) setDescription(extractedDescription);
            setType('expense'); // Asume que los recibos son siempre gastos.

        } catch (error) {
            console.error('Error durante el OCR:', error);
            toast.dismiss('ocr-loading');
            toast.error('Error al escanear el recibo.');
        } finally {
            setIsScanning(false);
        }
    };
    
    // Maneja el envío del formulario para guardar la transacción.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de los campos del formulario.
        if (description.trim() === '') {
            toast.error('La descripción no puede estar vacía.');
            return;
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            toast.error('La cantidad debe ser un número positivo.');
            return;
        }

        setIsSaving(true);
        
        const transactionData = {
            ...transactionToEdit,
            description,
            amount: parseFloat(amount),
            category,
            type,
            date,
        };

        // Llama a la función onSave pasada por props para guardar los datos.
        await onSave(transactionData);
        setIsSaving(false);
        onClose(); // Cierra el modal después de guardar.
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-white text-2xl font-bold mb-6">{transactionToEdit ? 'Editar' : 'Añadir'} Transacción</h2>

                {/* Área para subir archivo */}
                <label htmlFor="receipt-upload" className="mb-4 cursor-pointer bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg flex flex-col items-center justify-center p-6 text-center hover:bg-slate-600 transition-colors">
                    <UploadIcon />
                    {isScanning ? (
                        <p className="text-sky-400 mt-2">Escaneando recibo...</p>
                    ) : (
                        <>
                            <p className="text-white mt-2">Sube una foto del recibo</p>
                            <p className="text-xs text-slate-400">{fileName || 'PNG, JPG, GIF hasta 10MB'}</p>
                        </>
                    )}
                </label>
                <input id="receipt-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

                <div className="text-center my-4 text-slate-400 text-sm font-bold">O introduce los datos manualmente</div>

                {/* Formulario manual */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Descripción</label>
                        <input ref={descriptionInputRef} type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej: Café con amigos"/>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-slate-400 text-sm font-bold mb-2">Cantidad</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00"/>
                        </div>
                        <div className="flex-1">
                             <label className="block text-slate-400 text-sm font-bold mb-2">Tipo</label>
                             <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="expense">Gasto</option>
                                <option value="income">Ingreso</option>
                             </select>
                        </div>
                    </div>
                     <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Categoría</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                           <option>Comida</option>
                           <option>Vivienda</option>
                           <option>Transporte</option>
                           <option>Ocio</option>
                           <option>Salario</option>
                           <option>Otros</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-400 text-sm font-bold mb-2">Fecha</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button 
                            type="submit" 
                            className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
