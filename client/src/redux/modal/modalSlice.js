import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    isOpen: false,
    modalType: 'login',
  },
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.modalType = action.payload?.modalType || 'login';
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.modalType = 'login';
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export const selectModal = (state) => state.modal;

export default modalSlice.reducer;
