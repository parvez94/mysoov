# Quick Testing Guide ✅

## How to Test the Fixes

### Prerequisites

- ✅ Server is running on http://localhost:5100
- ✅ Client should be running (usually on http://localhost:5173)
- ✅ You need at least one user account with articles
- ✅ You need admin access to pause articles

---

## Test 1: Notification Badge Updates on Navigation

### Steps:

1. **Login** to your account
2. **Check** the notification bell icon in the left sidebar - note the count
3. **Have someone** send you a notification OR create a test notification
4. **Navigate** to a different page (e.g., Home → Profile → Videos)
5. **Observe** the notification badge - it should update immediately

### Expected Results:

- ✅ Badge updates **immediately** when you navigate between pages
- ✅ Badge updates **within 30 seconds** even if you stay on the same page
- ✅ Badge updates when you **switch browser tabs** and come back
- ✅ Badge shows the **correct count** at all times

### What to Look For:

- 🔴 **FAIL:** Badge only updates after pressing F5 (full page refresh)
- 🟢 **PASS:** Badge updates automatically when navigating

---

## Test 2: Paused Articles Visibility

### Setup:

1. **Create an article** (or use an existing one)
2. **Publish** the article
3. **As admin**, pause the article from the admin dashboard

### Test 2A: Own Profile (Logged In)

#### Steps:

1. **Login** as the article owner
2. **Navigate** to your profile
3. **Click** the "Articles" tab
4. **Look** for the paused article

#### Expected Results:

- ✅ Paused article is **visible**
- ✅ Orange badge shows **"⏸ Paused by Admin"**
- ✅ Three-dot menu is available
- ✅ Clicking **"Edit"** opens the editor
- ✅ Published articles have **no badge**
- ✅ Draft articles show **"📝 Draft"** badge (gray)

#### What to Look For:

- 🔴 **FAIL:** Paused article is missing/hidden
- 🟢 **PASS:** Paused article visible with orange badge

### Test 2B: Other User's Profile (Logged In)

#### Steps:

1. **Login** as a different user (not the article owner)
2. **Navigate** to the article owner's profile
3. **Click** the "Articles" tab
4. **Look** for the paused article

#### Expected Results:

- ✅ Paused article is **hidden** (not visible)
- ✅ Only published, non-paused articles are shown
- ✅ No status badges appear (you're not the owner)

#### What to Look For:

- 🔴 **FAIL:** Paused article is visible to other users
- 🟢 **PASS:** Paused article is hidden from other users

### Test 2C: Public View (Not Logged In)

#### Steps:

1. **Logout** completely
2. **Navigate** to the article owner's profile (direct URL)
3. **Click** the "Articles" tab
4. **Look** for the paused article

#### Expected Results:

- ✅ Paused article is **hidden** (not visible)
- ✅ Only published, non-paused articles are shown
- ✅ No status badges appear
- ✅ Profile page loads without errors

#### What to Look For:

- 🔴 **FAIL:** Paused article is visible to public
- 🔴 **FAIL:** Profile page shows error or doesn't load
- 🟢 **PASS:** Paused article is hidden, page works normally

---

## Test 3: Edit Paused Article

### Steps:

1. **Login** as the article owner
2. **Navigate** to your profile → Articles tab
3. **Find** a paused article (orange badge)
4. **Click** the three-dot menu (⋮)
5. **Click** "Edit"
6. **Make** a change to the article
7. **Save** the changes

### Expected Results:

- ✅ Edit page opens successfully
- ✅ Article content loads correctly
- ✅ Changes can be saved
- ✅ Article remains paused after editing
- ✅ Badge still shows "⏸ Paused by Admin"

### What to Look For:

- 🔴 **FAIL:** Can't access edit page
- 🔴 **FAIL:** Edit page shows error
- 🟢 **PASS:** Can edit and save paused article

---

## Test 4: Multiple Browser Tabs (Notification Badge)

### Steps:

1. **Open** the app in two browser tabs
2. **Login** in both tabs
3. **In Tab 1:** Click on a notification to mark it as read
4. **In Tab 2:** Wait a few seconds (up to 30 seconds)
5. **Observe** the notification badge in Tab 2

### Expected Results:

- ✅ Badge in Tab 2 updates within 30 seconds
- ✅ Both tabs show the same count
- ✅ Switching between tabs triggers immediate update

### What to Look For:

- 🔴 **FAIL:** Badge in Tab 2 never updates
- 🟢 **PASS:** Badge syncs across tabs

---

## Test 5: Draft Articles

### Steps:

1. **Create** a new article but don't publish it (save as draft)
2. **Navigate** to your profile → Articles tab
3. **Look** for the draft article

### Expected Results:

- ✅ Draft article is **visible** on your own profile
- ✅ Gray badge shows **"📝 Draft"**
- ✅ Can edit the draft article
- ✅ Draft is **hidden** from other users' view

### What to Look For:

- 🔴 **FAIL:** Draft article is missing
- 🔴 **FAIL:** Draft article is visible to other users
- 🟢 **PASS:** Draft visible to owner only with gray badge

---

## Common Issues & Solutions

### Issue: Notification badge not updating

**Possible Causes:**

- Server not running
- Client not connected to server
- Browser cache issues

**Solutions:**

1. Check server is running: `ps aux | grep "node index.js"`
2. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)
4. Check browser console for errors (F12)

### Issue: Paused articles still hidden on own profile

**Possible Causes:**

- Server not restarted after code changes
- Authentication cookie expired
- Wrong user logged in

**Solutions:**

1. Restart the server
2. Logout and login again
3. Verify you're logged in as the article owner
4. Check browser console for 401/403 errors

### Issue: Paused articles visible to other users

**Possible Causes:**

- Backend changes not applied
- Caching issue

**Solutions:**

1. Verify server restarted after changes
2. Check server logs for errors
3. Test in incognito/private browsing mode
4. Clear browser cache completely

---

## Quick Verification Commands

### Check if server is running:

```bash
ps aux | grep "node index.js" | grep -v grep
```

### Check server logs:

```bash
tail -f /tmp/mysoov-server.log
```

### Restart server:

```bash
cd /Users/parvez/development/mysoov/server
npm start
```

### Check which files were modified:

```bash
cd /Users/parvez/development/mysoov
git status
```

---

## Success Criteria

### All tests pass when:

- ✅ Notification badge updates on navigation
- ✅ Notification badge updates every 30 seconds
- ✅ Notification badge updates on tab switch
- ✅ Paused articles visible on own profile with orange badge
- ✅ Paused articles hidden from other users
- ✅ Paused articles hidden from public view
- ✅ Can edit paused articles
- ✅ Draft articles visible on own profile with gray badge
- ✅ Draft articles hidden from other users
- ✅ No console errors
- ✅ No server errors

---

## Files to Check if Issues Occur

### Backend:

1. `/server/middlewares/auth.js` - Should have `optionalAuth` function
2. `/server/routes/blogRoutes.js` - Should use `optionalAuth` on user articles route
3. `/server/controllers/blogCtrl.js` - Should have `isOwnProfile` logic

### Frontend:

1. `/client/src/components/sidebars/LeftSidebar.jsx` - Should use `useLocation()`
2. `/client/src/hooks/useNotifications.js` - Should have polling and visibility API
3. `/client/src/components/ArticleCard.jsx` - Should have status badges
4. `/client/src/utils/eventEmitter.js` - Should have `NOTIFICATION_CREATED` event

---

**Last Updated:** 2024  
**Status:** Ready for Testing ✅
