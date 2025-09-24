import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  isLoading: false,
  currentUser: null,
  error: null,
  showUserMenu: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    },
    loginFailed: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isLoading = false;
      state.currentUser = null;
      state.error = null;
      state.showUserMenu = false;
    },
    following: (state, action) => {
      if (state.currentUser.following.includes(action.payload)) {
        state.currentUser.following.splice(
          state.currentUser.following.findIndex(
            (channelId) => channelId === action.payload
          ),
          1
        );
      } else {
        state.currentUser.following.push(action.payload);
      }
    },
    toggleUserMenu: (state) => {
      state.showUserMenu = !state.showUserMenu;
    },
    setUserMenu: (state, action) => {
      state.showUserMenu = Boolean(action.payload);
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  logout,
  following,
  toggleUserMenu,
  setUserMenu,
} = userSlice.actions;

export default userSlice.reducer;
