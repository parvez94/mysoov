# Content Moderation - Test Scenarios

## Test Environment Setup

1. Have at least 2 users: 1 admin, 1 regular user
2. Have at least 1 public video/post and 1 public article
3. Clear browser cache and cookies before testing

---

## Test Scenario 1: Admin Pauses Content

**Objective:** Verify that paused content becomes private

### Steps:

1. Login as **admin**
2. Navigate to `/dashboard/posts`
3. Find a public post
4. Click the **Pause** button (⏸️)
5. Confirm the action

### Expected Results:

- ✅ Post status changes to "Paused"
- ✅ Post is removed from public feed
- ✅ Post owner can still see it in their profile (but marked as private)
- ✅ Database: `privacy: 'Private'` and `isPaused: true`

---

## Test Scenario 2: Owner Edits Paused Content (Stays Private)

**Objective:** Verify that edited paused content remains private

### Steps:

1. Login as **content owner** (the user whose post was paused)
2. Navigate to your profile or content management
3. Find the paused post
4. Click **Edit**
5. Make some changes (e.g., update caption)
6. Try to set privacy to **Public** (if UI allows)
7. Click **Save**

### Expected Results:

- ✅ Changes are saved successfully
- ✅ Post remains **Private** (not public)
- ✅ Database: `privacy: 'Private'`, `pendingReview: true`, `reviewRequestedAt: <timestamp>`
- ✅ Admin receives a notification

---

## Test Scenario 3: Admin Receives Notification

**Objective:** Verify notification is created and contains correct information

### Steps:

1. Login as **admin**
2. Click on notifications icon (🔔)
3. Look for the new notification

### Expected Results:

- ✅ Notification appears with message: "A user has edited their paused post/video and requested review"
- ✅ Notification type: `review_requested`
- ✅ Notification has a **View** button
- ✅ Notification shows sender's name/avatar

---

## Test Scenario 4: Navigation from Notification

**Objective:** Verify clicking notification navigates to correct dashboard page

### Steps:

1. As **admin**, click the **View** button in the notification
2. Observe the navigation

### Expected Results:

- ✅ Navigates to `/dashboard/posts?highlight=<videoId>` (or `/dashboard/articles?highlight=<articleId>`)
- ✅ Dashboard loads with all posts
- ✅ Specific post is **highlighted** with red pulsing border
- ✅ Page **auto-scrolls** to bring the post into center view
- ✅ Post shows **"⚠️ Pending Review"** badge
- ✅ Animation plays 3 times then stops

---

## Test Scenario 5: Admin Approves Review

**Objective:** Verify admin can approve and content becomes public

### Steps:

1. As **admin**, on the highlighted post
2. Click the **Unpause** button (▶️)
3. Confirm the action

### Expected Results:

- ✅ Post status changes to "Active"
- ✅ Post becomes public (visible in feed)
- ✅ "Pending Review" badge disappears
- ✅ Database: `privacy: 'Public'`, `pendingReview: false`
- ✅ Content owner receives `review_approved` notification

---

## Test Scenario 6: Admin Rejects Review

**Objective:** Verify admin can reject and content stays private

### Steps:

1. Repeat Scenario 2 (edit paused content again)
2. As **admin**, navigate to the post
3. Instead of unpausing, keep it paused or use reject endpoint
4. (Note: UI might not have explicit "Reject" button, but keeping it paused is effectively a rejection)

### Expected Results:

- ✅ Post remains private
- ✅ "Pending Review" badge can be cleared manually
- ✅ Content owner can be notified (if reject notification is implemented)

---

## Test Scenario 7: Multiple Edits by Owner

**Objective:** Verify repeated edits maintain privacy

### Steps:

1. As **content owner**, edit the same paused post multiple times
2. Try to make it public each time

### Expected Results:

- ✅ Each edit keeps the post private
- ✅ `reviewRequestedAt` timestamp updates
- ✅ Admin receives notification for each edit (or notification is updated)

---

## Test Scenario 8: Article Workflow

**Objective:** Verify same workflow works for articles

### Steps:

1. Repeat Scenarios 1-5 but with an **article** instead of a video/post
2. Admin pauses article
3. Owner edits article
4. Admin receives notification
5. Notification navigates to `/dashboard/articles?highlight=<articleId>`
6. Admin approves/rejects

### Expected Results:

- ✅ All steps work identically to video workflow
- ✅ Navigation goes to articles dashboard
- ✅ Article is highlighted and scrolled to
- ✅ Same visual feedback and badges

---

## Test Scenario 9: Direct URL Access

**Objective:** Verify highlight works when accessing URL directly

### Steps:

1. As **admin**, copy a highlight URL: `/dashboard/posts?highlight=<videoId>`
2. Open in new tab or paste in address bar
3. Press Enter

### Expected Results:

- ✅ Dashboard loads
- ✅ Post is highlighted
- ✅ Page scrolls to post
- ✅ Animation plays

---

## Test Scenario 10: Invalid Highlight ID

**Objective:** Verify graceful handling of invalid highlight parameter

### Steps:

1. As **admin**, navigate to `/dashboard/posts?highlight=invalid-id-123`
2. Observe behavior

### Expected Results:

- ✅ Dashboard loads normally
- ✅ No errors in console
- ✅ No post is highlighted (since ID doesn't exist)
- ✅ Page functions normally

---

## Test Scenario 11: Non-Admin User Access

**Objective:** Verify regular users cannot access admin dashboard

### Steps:

1. Login as **regular user** (not admin)
2. Try to navigate to `/dashboard/posts`
3. Try to navigate to `/dashboard/articles`

### Expected Results:

- ✅ Redirected to home page or access denied
- ✅ Cannot see admin dashboard
- ✅ Cannot see other users' content

---

## Test Scenario 12: Notification Click for Content Owner

**Objective:** Verify owner's notification navigates to their content

### Steps:

1. As **content owner**, receive `review_approved` or `review_rejected` notification
2. Click the **View** button

### Expected Results:

- ✅ Navigates to `/video/<videoId>` or `/blog/<articleSlug>`
- ✅ Shows the specific content
- ✅ Does NOT go to admin dashboard

---

## Test Scenario 13: Search/Filter with Highlighted Post

**Objective:** Verify highlight works even when using search

### Steps:

1. As **admin**, navigate to dashboard with highlight parameter
2. Use the search bar to filter posts
3. Ensure the highlighted post matches the search

### Expected Results:

- ✅ If highlighted post matches search, it remains highlighted
- ✅ If highlighted post doesn't match search, it's filtered out (no highlight)
- ✅ No errors occur

---

## Test Scenario 14: Mobile Responsiveness

**Objective:** Verify workflow works on mobile devices

### Steps:

1. Open browser dev tools
2. Switch to mobile view (iPhone/Android)
3. Repeat key scenarios (notification click, dashboard navigation, highlight)

### Expected Results:

- ✅ Notifications display correctly
- ✅ Dashboard is responsive
- ✅ Highlight animation works
- ✅ Scroll behavior works
- ✅ Badges are visible

---

## Test Scenario 15: Performance with Many Posts

**Objective:** Verify performance with large datasets

### Steps:

1. Ensure dashboard has 50+ posts
2. Navigate with highlight parameter
3. Observe load time and scroll behavior

### Expected Results:

- ✅ Page loads in reasonable time (<3 seconds)
- ✅ Scroll animation is smooth
- ✅ Highlight animation doesn't lag
- ✅ No memory leaks

---

## Edge Cases to Test

### Edge Case 1: Concurrent Edits

- Owner edits post while admin is reviewing
- Expected: Latest changes are saved, review flag persists

### Edge Case 2: Admin Deletes Notification

- Admin deletes notification before reviewing
- Expected: Post still shows "Pending Review" badge in dashboard

### Edge Case 3: Post Deleted During Review

- Owner deletes post while it's pending review
- Expected: Notification becomes invalid, clicking it shows "Content not found"

### Edge Case 4: Multiple Admins

- Multiple admins receive same notification
- Expected: All admins can review, first approval/rejection wins

### Edge Case 5: Owner Changes Privacy Multiple Times

- Owner toggles privacy back and forth during edit
- Expected: Backend enforces Private regardless of toggle state

---

## Automated Test Script (Optional)

```javascript
// Example Jest/Cypress test
describe('Content Moderation Workflow', () => {
  it('should keep paused content private after edit', async () => {
    // 1. Admin pauses content
    await adminPausePost(postId);

    // 2. Owner edits and tries to make public
    const response = await ownerEditPost(postId, { privacy: 'Public' });

    // 3. Verify it's still private
    expect(response.data.privacy).toBe('Private');
    expect(response.data.pendingReview).toBe(true);

    // 4. Verify admin notification created
    const notifications = await getAdminNotifications();
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'review_requested',
        relatedVideo: postId,
      })
    );
  });

  it('should navigate to highlighted post from notification', async () => {
    // 1. Click notification
    await clickNotification(notificationId);

    // 2. Verify URL
    expect(window.location.pathname).toBe('/dashboard/posts');
    expect(window.location.search).toContain(`highlight=${postId}`);

    // 3. Verify highlight applied
    const highlightedRow = await findHighlightedRow();
    expect(highlightedRow).toHaveStyle(
      'border-left: 3px solid var(--primary-color)'
    );
  });
});
```

---

## Checklist Summary

**Backend:**

- [ ] Video privacy enforcement works
- [ ] Article pause enforcement works
- [ ] Notifications created correctly
- [ ] Admin approval endpoints work
- [ ] Database fields updated correctly

**Frontend:**

- [ ] Notification navigation works
- [ ] Dashboard highlight works
- [ ] Auto-scroll works
- [ ] Animation plays correctly
- [ ] Badges display correctly
- [ ] Mobile responsive

**Security:**

- [ ] Non-admins cannot access admin dashboard
- [ ] Privacy cannot be bypassed via API
- [ ] Authorization checks work
- [ ] Notification recipients validated

**User Experience:**

- [ ] Smooth animations
- [ ] Clear visual feedback
- [ ] Intuitive workflow
- [ ] No confusing states
- [ ] Error messages helpful

---

## Bug Report Template

If you find issues during testing, use this template:

```
**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**


**Actual Result:**


**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser:
- OS:
- User Role:
- Video/Article ID:

**Console Errors:**
```

[Paste any console errors]

```

**Additional Notes:**

```

---

## Success Criteria

The implementation is considered successful when:

1. ✅ All 15 test scenarios pass
2. ✅ All edge cases handled gracefully
3. ✅ No console errors during normal operation
4. ✅ Performance is acceptable (page loads <3s)
5. ✅ Mobile experience is smooth
6. ✅ Security checks pass
7. ✅ User feedback is positive
