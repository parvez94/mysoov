import { createSlice } from '@reduxjs/toolkit';

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    isLoading: false,
    currentVideo: null,
    error: null,
  },
  reducers: {
    getVideo: (state) => {
      state.isLoading = true;
    },
    getVideoSuccess: (state, action) => {
      state.isLoading = false;
      state.currentVideo = action.payload;
    },
    getVideoFailed: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    like: (state, action) => {
      if (!state.currentVideo.likes.includes(action.payload)) {
        state.currentVideo.likes.push(action.payload);
      }
    },
    unlike: (state, action) => {
      if (state.currentVideo.likes.includes(action.payload)) {
        state.currentVideo.likes.splice(
          state.currentVideo.likes.findIndex((uId) => uId === action.payload),
          1
        );
      }
    },
    // Saved toggles on the currently open detail video
    save: (state, action) => {
      state.currentVideo.saved = Array.isArray(state.currentVideo.saved)
        ? state.currentVideo.saved
        : [];
      if (!state.currentVideo.saved.includes(action.payload)) {
        state.currentVideo.saved.push(action.payload);
      }
    },
    unSave: (state, action) => {
      state.currentVideo.saved = Array.isArray(state.currentVideo.saved)
        ? state.currentVideo.saved
        : [];
      state.currentVideo.saved = state.currentVideo.saved.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const {
  getVideo,
  getVideoSuccess,
  getVideoFailed,
  like,
  unlike,
  save,
  unSave,
} = videoSlice.actions;

export default videoSlice.reducer;
