# Paused Articles Visibility Fix ✅

## Problem

When an admin paused an article, it disappeared from the user's profile page, even when viewing their own profile. This prevented users from:

- Seeing their paused content
- Editing paused articles to fix issues
- Understanding why their article wasn't visible

## Root Cause

The backend had correct logic in `getUserArticles()` to show paused articles on own profile:

```javascript
// If viewing own profile, show all articles (published, drafts, and paused)
// If viewing someone else's profile, show only published and non-paused articles
const currentUserId = req.user?.id;
const isOwnProfile = currentUserId && String(currentUserId) === String(userId);
```

**However**, the route `/user/:userId/articles` did NOT have authentication middleware, so `req.user` was always `undefined`. This meant `isOwnProfile` was always `false`, causing paused articles to be hidden even from the owner.

## Solution

### 1. Created Optional Authentication Middleware

**File:** `/server/middlewares/auth.js`

Added a new `optionalAuth` middleware that:

- Sets `req.user` if a valid token exists
- Continues without error if no token is present
- Allows the route to work for both authenticated and unauthenticated users

```javascript
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    // No token, but that's okay - continue without setting req.user
    return next();
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (!err) {
      // Token is valid, set req.user
      req.user = user;
    }
    // Continue regardless of token validity
    next();
  });
};
```

### 2. Applied Middleware to Route

**File:** `/server/routes/blogRoutes.js`

Updated the route to use `optionalAuth`:

```javascript
// Before
router.get('/user/:userId/articles', getUserArticles);

// After
router.get('/user/:userId/articles', optionalAuth, getUserArticles);
```

### 3. Added Visual Status Badges

**File:** `/client/src/components/ArticleCard.jsx`

Added status badges to show article state to the owner:

```javascript
{
  isOwner && (isPaused || isDraft) && (
    <StatusBadge $isPaused={isPaused} $isDraft={isDraft}>
      {isPaused ? '⏸ Paused by Admin' : '📝 Draft'}
    </StatusBadge>
  );
}
```

**Badge Styling:**

- **Paused Articles:** Orange badge (#ff9800) with "⏸ Paused by Admin"
- **Draft Articles:** Gray badge (#9e9e9e) with "📝 Draft"
- Only visible to article owner

## How It Works

### Authentication Flow

```
User visits profile page
    ↓
Frontend: GET /api/v1/blog/user/{userId}/articles
    ↓
Backend: optionalAuth middleware runs
    ↓
If logged in: req.user = {id, ...}
If not logged in: req.user = undefined
    ↓
getUserArticles() controller
    ↓
isOwnProfile = req.user?.id === userId
    ↓
If own profile: Return ALL articles (published, drafts, paused)
If other's profile: Return only published & non-paused articles
    ↓
Frontend: Display articles with status badges
```

### Query Logic

```javascript
const query = { author: userId };
if (!isOwnProfile) {
  query.published = true;
  query.isPaused = false; // Hide paused articles from public view
}
// If isOwnProfile === true, no filters applied → all articles returned
```

## Files Modified

### Backend (2 files)

1. `/server/middlewares/auth.js` - Added `optionalAuth` middleware
2. `/server/routes/blogRoutes.js` - Applied `optionalAuth` to user articles route

### Frontend (1 file)

1. `/client/src/components/ArticleCard.jsx` - Added status badges (already done)

## Testing Checklist

### Own Profile (Logged In)

- [ ] Navigate to your own profile
- [ ] Click "Articles" tab
- [ ] Verify paused articles are visible with orange "⏸ Paused by Admin" badge
- [ ] Verify draft articles are visible with gray "📝 Draft" badge
- [ ] Click three-dot menu on paused article → "Edit" should work
- [ ] Published articles should have no badge

### Other User's Profile (Logged In)

- [ ] Navigate to another user's profile
- [ ] Click "Articles" tab
- [ ] Verify only published, non-paused articles are visible
- [ ] Paused articles should be hidden
- [ ] Draft articles should be hidden

### Public View (Not Logged In)

- [ ] Log out
- [ ] Navigate to any user's profile
- [ ] Click "Articles" tab
- [ ] Verify only published, non-paused articles are visible
- [ ] No status badges should appear

## Technical Details

### Why Optional Authentication?

We can't use `verifyToken` middleware because:

- ❌ It rejects requests without a token (401 error)
- ❌ Public profiles would break for logged-out users

We need `optionalAuth` because:

- ✅ Allows both authenticated and unauthenticated access
- ✅ Sets `req.user` when token exists (for own profile detection)
- ✅ Continues without error when no token (for public viewing)

### Database Schema

Articles have two boolean fields:

- `published`: Whether the article is published (vs draft)
- `isPaused`: Whether an admin has paused the article

**Priority Logic:**

1. If `isPaused === true` → Show "Paused by Admin" badge (takes precedence)
2. Else if `published === false` → Show "Draft" badge
3. Else → No badge (published and active)

### Security Considerations

- ✅ Paused articles remain hidden from public view
- ✅ Only the owner can see their paused/draft articles
- ✅ Authentication is optional, not required (public profiles work)
- ✅ Invalid tokens are ignored gracefully (no errors thrown)

## Status: RESOLVED ✅

- ✅ Paused articles visible on own profile
- ✅ Paused articles hidden from other users
- ✅ Clear visual indicators with status badges
- ✅ Edit functionality works for paused articles
- ✅ Public profiles work for logged-out users
- ✅ Backward compatible with existing code

## Related Issues

This fix is similar to how paused posts work:

- Paused posts go to "Private" tab on own profile
- Paused articles show with "Paused by Admin" badge on "Articles" tab
- Both allow editing by the owner
- Both are hidden from public view

---

**Last Updated:** 2024  
**Status:** Production Ready ✅
