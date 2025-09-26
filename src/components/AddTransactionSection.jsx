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
          className="bg-primary hover:bg-opacity-90 text-primary-foreground rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform"
        >
          <PlusIcon />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && <AddTransactionModal
        closeModal={closeModal}
        saveTransaction={saveTransaction}
        editingTransaction={editingTransaction}
        selectedDate={selectedDate}
      />}
    </>
  );
};

export default AddTransactionSection;