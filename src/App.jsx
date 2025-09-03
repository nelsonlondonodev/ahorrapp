import React from 'react';
import { useState, useEffect } from 'react';

// --- ICONOS SVG (Componentes) ---
// Usamos componentes de React para los iconos SVG para mantener el código limpio.
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);

// --- SIMULACIÓN DE BACKEND (Supabase) ---
// Estas funciones simulan cómo interactuarías con Supabase.
// Deberás reemplazarlas con las llamadas reales a la API de Supabase.

const mockTransactions = [
  { id: 1, description: 'Salario Mensual', amount: 2500, type: 'income', category: 'Salario', date: '2025-08-01' },
  { id: 2, description: 'Alquiler Apartamento', amount: 850, type: 'expense', category: 'Vivienda', date: '2025-08-02' },
  { id: 3, description: 'Compra en supermercado', amount: 120.50, type: 'expense', category: 'Comida', date: '2025-08-03' },
  { id: 4, description: 'Factura Internet', amount: 55, type: 'expense', category: 'Servicios', date: '2025-08-05' },
  { id: 5, description: 'Venta de artículo online', amount: 75, type: 'income', category: 'Otros Ingresos', date: '2025-08-06' },
];

const supabase = {
  from: () => ({
    select: async () => {
      console.log('SUPABASE MOCK: Obteniendo transacciones...');
      return { data: mockTransactions, error: null };
    },
    insert: async (newTransaction) => {
      console.log('SUPABASE MOCK: Insertando nueva transacción:', newTransaction);
      const newId = Math.max(...mockTransactions.map(t => t.id)) + 1;
      const transactionWithId = { ...newTransaction, id: newId };
      mockTransactions.push(transactionWithId);
      return { data: [transactionWithId], error: null };
    },
  }),
};

// --- Componentes de la UI ---

// Tarjeta para mostrar resúmenes (Ingresos, Gastos, Balance)
function SummaryCard({ title, amount, children, colorClass }) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex-1">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          {children}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold">
            {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Elemento individual de la lista de transacciones
function TransactionItem({ transaction }) {
    const { description, category, amount, type, date } = transaction;
    const isExpense = type === 'expense';
    const formattedAmount = (isExpense ? -amount : amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    const formattedDate = new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    return (
        <li className="flex items-center justify-between p-4 bg-slate-800 rounded-lg mb-3">
            <div className="flex items-center space-x-4">
                 <div className={`p-2 rounded-full ${isExpense ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    {isExpense ? <ArrowDownIcon /> : <ArrowUpIcon />}
                </div>
                <div>
                    <p className="text-white font-semibold">{description}</p>
                    <p className="text-slate-400 text-sm">{category} - {formattedDate}</p>
                </div>
            </div>
            <p className={`font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                {formattedAmount}
            </p>
        </li>
    );
}

// Modal para añadir una nueva transacción
function AddTransactionModal({ onClose, onAddTransaction }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Comida');
    const [type, setType] = useState('expense');
    const [isScanning, setIsScanning] = useState(false);
    const [fileName, setFileName] = useState('');

    // SIMULACIÓN DE OCR
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsScanning(true);

        // Aquí iría la llamada a tu API de reconocimiento de imágenes.
        // Simulamos una espera de 2 segundos para el procesamiento.
        setTimeout(() => {
            // Datos simulados extraídos del recibo
            setDescription('Compra en Mercadona');
            setAmount('78.34');
            setCategory('Comida');
            setType('expense');
            setIsScanning(false);
            console.log('OCR Simulado: Datos extraídos del recibo.');
        }, 2000);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) return;
        onAddTransaction({
            description,
            amount: parseFloat(amount),
            category,
            type,
            date: new Date().toISOString().split('T')[0], // Fecha actual
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-white text-2xl font-bold mb-6">Añadir Transacción</h2>

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
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej: Café con amigos"/>
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
                     <div className="mb-6">
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

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente Principal de la Aplicación ---
export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar transacciones iniciales (simulando useEffect con Supabase)
  useEffect(() => {
    const fetchTransactions = async () => {
      // Reemplaza esto con tu llamada real a Supabase
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) {
        console.error('Error al obtener transacciones:', error);
      } else {
        setTransactions(data);
      }
    };
    fetchTransactions();
  }, []);

  // Función para añadir una nueva transacción
  const handleAddTransaction = async (newTransaction) => {
    // Reemplaza esto con tu llamada real a Supabase
    const { data, error } = await supabase.from('transactions').insert(newTransaction);
    if (error) {
        console.error('Error al añadir transacción:', error);
    } else {
        // Actualizamos el estado con la respuesta de la "API"
        setTransactions(prev => [...prev, ...data]);
    }
  };

  // Cálculos para el resumen
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* Cabecera */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">Resumen Financiero</h1>
          <p className="text-slate-400">Bienvenido de nuevo, aquí tienes el estado de tus finanzas.</p>
        </header>

        {/* Resumen de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Ingresos Totales" amount={totalIncome} colorClass="bg-green-500/10">
            <ArrowUpIcon />
          </SummaryCard>
          <SummaryCard title="Gastos Totales" amount={totalExpense} colorClass="bg-red-500/10">
            <ArrowDownIcon />
          </SummaryCard>
          <SummaryCard title="Balance Actual" amount={balance} colorClass="bg-sky-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
          </SummaryCard>
        </div>

        {/* Lista de transacciones recientes */}
        <main>
            <h2 className="text-2xl font-bold text-white mb-4">Transacciones Recientes</h2>
            <ul>
                {transactions.length > 0 
                    ? transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
                    : <p className="text-slate-500 text-center py-8">No hay transacciones todavía.</p>
                }
            </ul>
        </main>

        {/* Botón flotante para añadir transacción */}
        <div className="fixed bottom-8 right-8">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-full p-4 shadow-lg shadow-sky-600/30 transform hover:scale-110 transition-transform"
            >
                <PlusIcon />
            </button>
        </div>

        {/* Modal */}
        {isModalOpen && <AddTransactionModal 
            onClose={() => setIsModalOpen(false)}
            onAddTransaction={handleAddTransaction}
        />}

      </div>
    </div>
  );
}