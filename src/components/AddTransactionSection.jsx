import React from 'react';
import AddTransactionModal from './AddTransactionModal';
import { PlusIcon } from './Icons';

const AddTransactionSection = ({ saveTransaction, selectedDate, isModalOpen, editingTransaction, openModalForEdit, closeModal, setIsModalOpen, setEditingTransaction }) => {

  return (
    <>
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
        onClose={closeModal}
        onSave={saveTransaction}
        transactionToEdit={editingTransaction}
        selectedDate={selectedDate}
      />}
    </>
  );
};

export default AddTransactionSection;