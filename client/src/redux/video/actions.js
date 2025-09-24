// actions.js
import { like, unlike } from './videoSlice';
import { likeInFeed, unlikeInFeed } from './feedSlice';

export const likeVideo = (videoId, userId) => async (dispatch, getState) => {
  const likeUrl = `${
    import.meta.env.VITE_API_URL
  }/api/v1/users/like/${videoId}`;

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  };

  // Optimistic updates
  dispatch(likeInFeed({ videoId, userId }));
  const isDetailOpenForThisVideo =
    getState().video?.currentVideo?._id === videoId;
  if (isDetailOpenForThisVideo) dispatch(like(userId));

  try {
    await fetch(likeUrl, requestOptions);
  } catch (error) {
    // Revert on failure
    dispatch(unlikeInFeed({ videoId, userId }));
    if (isDetailOpenForThisVideo) dispatch(unlike(userId));
    console.log(error);
  }
};

export const unlikeVideo = (videoId, userId) => async (dispatch, getState) => {
  const unLikeUrl = `${
    import.meta.env.VITE_API_URL
  }/api/v1/users/unlike/${videoId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  };

  // Optimistic updates
  dispatch(unlikeInFeed({ videoId, userId }));
  const isDetailOpenForThisVideo =
    getState().video?.currentVideo?._id === videoId;
  if (isDetailOpenForThisVideo) dispatch(unlike(userId));

  try {
    await fetch(unLikeUrl, requestOptions);
  } catch (error) {
    // Revert on failure
    dispatch(likeInFeed({ videoId, userId }));
    if (isDetailOpenForThisVideo) dispatch(like(userId));
    console.log(error);
  }
};

// Save / Unsave (bookmark) actions with optimistic updates
export const saveVideo = (videoId, userId) => async (dispatch, getState) => {
  const url = `${import.meta.env.VITE_API_URL}/api/v1/users/save/${videoId}`;
  const opts = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
  };

  // Optimistic: set saved for this video in feed/currentVideo
  dispatch({ type: 'videos/saveInFeed', payload: { videoId, userId } });
  const isDetailOpenForThisVideo =
    getState().video?.currentVideo?._id === videoId;
  if (isDetailOpenForThisVideo)
    dispatch({ type: 'video/save', payload: userId });

  try {
    await fetch(url, opts);
  } catch (err) {
    // Revert on failure
    dispatch({ type: 'videos/unSaveInFeed', payload: { videoId, userId } });
    if (isDetailOpenForThisVideo)
      dispatch({ type: 'video/unSave', payload: userId });
    console.log(err);
  }
};

export const unSaveVideo = (videoId, userId) => async (dispatch, getState) => {
  const url = `${import.meta.env.VITE_API_URL}/api/v1/users/unsave/${videoId}`;
  const opts = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
  };

  // Optimistic
  dispatch({ type: 'videos/unSaveInFeed', payload: { videoId, userId } });
  const isDetailOpenForThisVideo =
    getState().video?.currentVideo?._id === videoId;
  if (isDetailOpenForThisVideo)
    dispatch({ type: 'video/unSave', payload: userId });

  try {
    await fetch(url, opts);
  } catch (err) {
    // Revert on failure
    dispatch({ type: 'videos/saveInFeed', payload: { videoId, userId } });
    if (isDetailOpenForThisVideo)
      dispatch({ type: 'video/save', payload: userId });
    console.log(err);
  }
};
