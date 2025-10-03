import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = import.meta.env.VITE_API_URL;

export const fetchComments = createAsyncThunk(
  'comments/fetchData',
  async (videoId) => {
    try {
      const response = await fetch(`${API}/api/v1/comments/${videoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/add',
  async ({ videoId, comment, parentId = null }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API}/api/v1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ videoId, comment, parentId }),
      });

      if (!response.ok) {
        const err = await response.text();
        return rejectWithValue(err || 'Failed to add comment');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add comment');
    }
  }
);

export const deleteCommentById = createAsyncThunk(
  'comments/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/v1/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.text();
        return rejectWithValue(err || 'Failed to delete comment');
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete comment');
    }
  }
);

export const updateCommentById = createAsyncThunk(
  'comments/update',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/v1/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });

      if (!res.ok) {
        const err = await res.text();
        return rejectWithValue(err || 'Failed to update comment');
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    isLoading: false,
    posting: false,
    comments: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchComments.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.comments = action.payload;
    });

    builder.addCase(fetchComments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    builder.addCase(addComment.pending, (state) => {
      state.posting = true;
    });

    builder.addCase(addComment.fulfilled, (state, action) => {
      state.posting = false;
      state.comments.push(action.payload);
    });

    builder.addCase(addComment.rejected, (state, action) => {
      state.posting = false;
      state.error = action.payload || action.error.message;
    });

    builder.addCase(deleteCommentById.fulfilled, (state, action) => {
      const id = action.payload;
      // Remove the comment and all its descendants locally
      const toRemove = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of state.comments) {
          if (
            c.parentId &&
            toRemove.has(String(c.parentId)) &&
            !toRemove.has(String(c._id))
          ) {
            toRemove.add(String(c._id));
            changed = true;
          }
        }
      }
      state.comments = state.comments.filter(
        (c) => !toRemove.has(String(c._id))
      );
    });

    builder.addCase(updateCommentById.fulfilled, (state, action) => {
      const updated = action.payload;
      const idx = state.comments.findIndex((c) => c._id === updated._id);
      if (idx !== -1) {
        state.comments[idx] = updated;
      }
    });

    builder.addCase(updateCommentById.rejected, (state, action) => {
      state.error = action.payload || action.error.message;
    });
  },
});

export default commentSlice.reducer;
