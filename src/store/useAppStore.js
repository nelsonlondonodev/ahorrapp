import { create } from 'zustand';
import { VIEW_MODES } from '../constants';

export const useAppStore = create((set) => ({
  // Auth state
  session: null,
  loadingAuth: true,
  showPasswordReset: false,

  // Auth actions
  setSession: (session) => set({ session }),
  setLoadingAuth: (loading) => set({ loadingAuth: loading }),
  setShowPasswordReset: (show) => set({ showPasswordReset: show }),

  // UI state
  viewMode: VIEW_MODES.CALENDAR,
  isModalOpen: false,
  editingTransaction: null,

  // UI actions
  setViewMode: (viewMode) => set({ viewMode }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setEditingTransaction: (transaction) => set({ editingTransaction: transaction }),
  openModalForEdit: (transaction) => set({ editingTransaction: transaction, isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, editingTransaction: null }),
}));
