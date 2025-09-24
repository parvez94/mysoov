import { configureStore } from "@reduxjs/toolkit"
import modalReducer from "../redux/modal/modalSlice"
import userReducer, { initialState as userInitialState } from "../redux/user/userSlice"
import videoReducer from "../redux/video/videoSlice"
import videosReducer from "../redux/video/feedSlice"
import commentReducer from "../redux/comment/commentSlice"

// Load state from local storage
const persistedState = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {}

const store = configureStore({
  reducer: {
    modal: modalReducer,
    user: userReducer,
    video: videoReducer,
    videos: videosReducer,
    comments: commentReducer,
  },

  preloadedState: {
    user: { ...userInitialState, ...persistedState },
  },
})

// Subscribe to changes in the Redux store and update local storage
store.subscribe(() => {
  const state = store.getState()
  localStorage.setItem("user", JSON.stringify(state.user))
})

export default store
