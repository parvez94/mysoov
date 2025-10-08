import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVideos = createAsyncThunk(
  'videos/fetchData',
  async (type) => {
    const makeRequest = async (endpoint, withCreds) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/videos/${endpoint}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: withCreds ? 'include' : 'omit',
        }
      );
      return res;
    };

    try {
      // First attempt
      let response = await makeRequest(type, type === 'feeds');

      // If unauthorized on feeds, fall back to random
      if (!response.ok && type === 'feeds' && response.status === 401) {
        response = await makeRequest('random', false);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch videos (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      // Debug: Log YouTube videos
      const youtubeVideos = data.filter(
        (v) =>
          v?.videoUrl?.url?.includes('youtube.com') ||
          v?.storageProvider === 'youtube'
      );
      if (youtubeVideos.length > 0) {
        console.log(
          'API returned YouTube videos:',
          youtubeVideos.map((v) => ({
            id: v._id,
            storageProvider: v.storageProvider,
            'videoUrl.provider': v.videoUrl?.provider,
            url: v.videoUrl?.url,
          }))
        );
      }

      return data;
    } catch (err) {
      throw err;
    }
  }
);

const feedSlice = createSlice({
  name: 'videos',
  initialState: {
    isLoading: false,
    videos: [],
    error: null,
  },
  reducers: {
    likeInFeed: (state, action) => {
      const { videoId, userId } = action.payload || {};
      const v = state.videos.find(
        (x) => String(x._id || x.id) === String(videoId)
      );
      if (v) {
        v.likes = Array.isArray(v.likes) ? v.likes : [];
        if (!v.likes.includes(userId)) v.likes.push(userId);
      }
    },
    unlikeInFeed: (state, action) => {
      const { videoId, userId } = action.payload || {};
      const v = state.videos.find(
        (x) => String(x._id || x.id) === String(videoId)
      );
      if (v && Array.isArray(v.likes)) {
        v.likes = v.likes.filter((id) => id !== userId);
      }
    },
    // Saved (bookmark) toggles in feed
    saveInFeed: (state, action) => {
      const { videoId, userId } = action.payload || {};
      const v = state.videos.find(
        (x) => String(x._id || x.id) === String(videoId)
      );
      if (v) {
        v.saved = Array.isArray(v.saved) ? v.saved : [];
        if (!v.saved.includes(userId)) v.saved.push(userId);
      }
    },
    unSaveInFeed: (state, action) => {
      const { videoId, userId } = action.payload || {};
      const v = state.videos.find(
        (x) => String(x._id || x.id) === String(videoId)
      );
      if (v && Array.isArray(v.saved)) {
        v.saved = v.saved.filter((id) => id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVideos.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(fetchVideos.fulfilled, (state, action) => {
      state.isLoading = false;
      // Dedupe in case backend returns duplicates
      const payload = Array.isArray(action.payload) ? action.payload : [];
      const seen = new Set();
      const unique = [];
      for (const v of payload) {
        const id = v && (v._id || v.id);
        const key = id ? String(id) : undefined;
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push(v);
        }
      }
      state.videos = unique;
    });

    builder.addCase(fetchVideos.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

export const { likeInFeed, unlikeInFeed, saveInFeed, unSaveInFeed } =
  feedSlice.actions;
export default feedSlice.reducer;
