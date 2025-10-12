# Content Moderation Workflow Implementation

## Overview

This document describes the complete implementation of the content moderation workflow where admins can pause content, users can edit paused content (but it remains private), and admins receive notifications with direct navigation to review and approve changes.

---

## Problem Statement

When an admin pauses a post/article:

1. The content should become private for the owner
2. When the owner edits and tries to make it public, it should remain private
3. Admin should receive a notification
4. The notification's "View" button should take admin directly to the specific post in the dashboard
5. Content should NOT become public until admin explicitly approves it

---

## Solution Architecture

### Backend Changes

#### 1. Video Controller (`/server/controllers/videoCtrl.js`)

**Purpose:** Enforce privacy restrictions on paused videos

**Changes Made:**

```javascript
// In updateVideo function
const wasPaused = existingVideo.privacy === 'Private' && existingVideo.isPaused;

// Force privacy to remain Private if video was paused
if (wasPaused) {
  updateData.privacy = 'Private';

  // Set pending review flag if user is trying to make it public
  if (req.body.privacy === 'Public') {
    updateData.pendingReview = true;
    updateData.reviewRequestedAt = new Date();

    // Create notification for admin
    await createNotification({
      recipient: adminUser._id,
      type: 'review_requested',
      message: `${req.user.displayName} has edited a paused video and requested review`,
      relatedVideo: videoId,
      sender: req.user.id,
    });
  }
}
```

**Key Points:**

- Detects if video was previously paused
- Overrides any `privacy: 'Public'` request from user
- Sets `pendingReview` flag and `reviewRequestedAt` timestamp
- Creates notification for admin with `relatedVideo` reference

---

#### 2. Blog Controller (`/server/controllers/blogCtrl.js`)

**Purpose:** Enforce pause restrictions on articles

**Changes Made:**

```javascript
// In updateArticle function
const wasPaused = article.isPaused;

// If article was paused and author is editing, keep it paused
if (wasPaused && isAuthor) {
  article.isPaused = true;

  // Set pending review if trying to unpause
  if (req.body.isPaused === false) {
    article.pendingReview = true;
    article.reviewRequestedAt = new Date();

    // Notify admin
    await createNotification({
      recipient: adminUser._id,
      type: 'review_requested',
      message: `${req.user.displayName} has edited a paused article and requested review`,
      relatedArticle: articleId,
      sender: req.user.id,
    });
  }
}
```

**Key Points:**

- Similar logic to video controller
- Uses `isPaused` field for articles
- Creates notification with `relatedArticle` reference

---

### Frontend Changes

#### 3. Notification Item (`/client/src/components/notifications/NotificationItem.jsx`)

**Purpose:** Handle navigation from notifications to appropriate dashboard pages

**Changes Made:**

```javascript
const getNotificationLink = () => {
  switch (notification.type) {
    case 'review_requested':
      // Admin should go to dashboard to review the content
      if (notification.relatedVideo) {
        return `/dashboard/posts?highlight=${
          notification.relatedVideo._id || notification.relatedVideo
        }`;
      } else if (notification.relatedArticle) {
        return `/dashboard/articles?highlight=${
          notification.relatedArticle._id || notification.relatedArticle
        }`;
      }
      return '/dashboard/posts';

    case 'review_approved':
    case 'review_rejected':
      // User should see their content
      if (notification.relatedVideo) {
        return `/video/${
          notification.relatedVideo._id || notification.relatedVideo
        }`;
      } else if (notification.relatedArticle) {
        return `/blog/${
          notification.relatedArticle.slug || notification.relatedArticle
        }`;
      }
      return '#';

    default:
      return '#';
  }
};
```

**Key Points:**

- Routes `review_requested` notifications to admin dashboard with highlight parameter
- Routes `review_approved`/`review_rejected` to user's content page
- Handles both videos and articles
- Uses URL query parameter `?highlight=<id>` for highlighting

---

#### 4. Dashboard Posts (`/client/src/pages/dashboard/DashboardPosts.jsx`)

**Purpose:** Highlight and scroll to specific posts from notifications

**Changes Made:**

**a) Imports and Hooks:**

```javascript
import { useSearchParams } from 'react-router-dom';
import { useRef } from 'react';

const [searchParams] = useSearchParams();
const [highlightId, setHighlightId] = useState(null);
const highlightRef = useRef(null);
```

**b) URL Parameter Handling:**

```javascript
// Extract highlight ID from URL
useEffect(() => {
  const highlightParam = searchParams.get('highlight');
  if (highlightParam) {
    setHighlightId(highlightParam);
  }
}, [searchParams]);

// Scroll to highlighted post after data loads
useEffect(() => {
  if (highlightId && !loading && highlightRef.current) {
    setTimeout(() => {
      highlightRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  }
}, [highlightId, loading]);
```

**c) Styled Component with Animation:**

```javascript
const Tr = styled.tr`
  // ... existing styles ...

  ${(props) =>
    props.$highlighted &&
    `
    animation: highlightPulse 2s ease-in-out 3;
    border-left: 3px solid var(--primary-color);
  `}

  @keyframes highlightPulse {
    0%,
    100% {
      background: rgba(202, 8, 6, 0.15);
    }
    50% {
      background: rgba(202, 8, 6, 0.25);
    }
  }
`;
```

**d) Pending Review Badge:**

```javascript
<StatusContainer>
  <StatusBadge status={video.privacy}>
    {video.privacy === 'Public' ? 'Active' : 'Paused'}
  </StatusBadge>
  {video.pendingReview && (
    <StatusBadge $pending={true}>⚠️ Pending Review</StatusBadge>
  )}
</StatusContainer>
```

**e) Row Rendering with Highlight:**

```javascript
{
  filteredVideos.map((video) => {
    const isHighlighted = highlightId === video._id;
    return (
      <Tr
        key={video._id}
        $highlighted={isHighlighted}
        ref={isHighlighted ? highlightRef : null}
      >
        {/* ... row content ... */}
      </Tr>
    );
  });
}
```

**Key Points:**

- Reads `highlight` query parameter from URL
- Scrolls to highlighted post with smooth animation
- Adds visual feedback with pulsing red background (3 times)
- Shows "⚠️ Pending Review" badge for posts awaiting approval
- Uses transient props (`$highlighted`, `$pending`) to avoid DOM warnings

---

#### 5. Dashboard Articles (`/client/src/pages/dashboard/DashboardArticles.jsx`)

**Purpose:** Same highlighting functionality for articles

**Changes Made:**

- Identical implementation to DashboardPosts
- Applied to article rows instead of video rows
- Same animation, scrolling, and highlighting logic

---

## User Flow

### Scenario: Admin Pauses Content, User Edits, Admin Reviews

1. **Admin Pauses Content:**

   - Admin clicks pause button on a post/article
   - Content becomes private (`privacy: 'Private'` or `isPaused: true`)
   - Owner can no longer see it in public feed

2. **Owner Edits Paused Content:**

   - Owner navigates to their content
   - Makes edits and tries to set `privacy: 'Public'`
   - Backend intercepts and forces `privacy: 'Private'`
   - Sets `pendingReview: true` and `reviewRequestedAt: Date`
   - Creates notification for admin

3. **Admin Receives Notification:**

   - Admin sees notification: "User has edited a paused video and requested review"
   - Notification has "View" button

4. **Admin Clicks View:**

   - Navigates to `/dashboard/posts?highlight=<videoId>`
   - Dashboard loads all posts
   - Specific post is highlighted with red pulsing animation
   - Page auto-scrolls to bring post into view
   - Post shows "⚠️ Pending Review" badge

5. **Admin Reviews and Approves:**
   - Admin reviews the content
   - Clicks "Unpause" or uses approval endpoint
   - Content becomes public
   - User receives `review_approved` notification

---

## Technical Details

### Database Fields Used

**Video Model:**

- `privacy`: 'Public' | 'Private'
- `isPaused`: Boolean
- `pendingReview`: Boolean
- `reviewRequestedAt`: Date

**Article Model:**

- `isPaused`: Boolean
- `pendingReview`: Boolean
- `reviewRequestedAt`: Date

**Notification Model:**

- `type`: 'review_requested' | 'review_approved' | 'review_rejected'
- `relatedVideo`: ObjectId (ref: Video)
- `relatedArticle`: ObjectId (ref: Article)
- `recipient`: ObjectId (ref: User)
- `sender`: ObjectId (ref: User)

---

### API Endpoints Involved

**Content Update:**

- `PATCH /api/v1/videos/:id` - Update video (enforces privacy)
- `PATCH /api/v1/blog/:id` - Update article (enforces pause)

**Admin Actions:**

- `POST /api/admin/videos/:id/approve-review` - Approve video review
- `POST /api/admin/videos/:id/reject-review` - Reject video review
- Similar endpoints for articles

**Notifications:**

- `GET /api/v1/notifications` - Fetch user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read

---

## Security Considerations

1. **Authorization Checks:**

   - Only admins can approve/reject reviews
   - Only content owners can edit their content
   - Backend enforces privacy regardless of frontend requests

2. **Data Validation:**

   - Backend validates user roles before creating admin notifications
   - Checks if content exists before creating notifications
   - Validates notification recipients

3. **Privacy Enforcement:**
   - Privacy override happens at controller level (not model level)
   - Cannot be bypassed by direct API calls
   - Applies to both videos and articles

---

## Testing Checklist

- [ ] Admin pauses a public post → Post becomes private
- [ ] Owner edits paused post and tries to make public → Stays private
- [ ] Admin receives notification when owner edits paused content
- [ ] Clicking notification "View" button navigates to dashboard
- [ ] Specific post is highlighted with animation
- [ ] Page scrolls to highlighted post automatically
- [ ] "Pending Review" badge appears on posts awaiting review
- [ ] Admin can approve review → Post becomes public
- [ ] Admin can reject review → Post stays private
- [ ] User receives notification of approval/rejection
- [ ] Same flow works for articles

---

## Future Enhancements

1. **Dedicated Review Queue:**

   - Add "Pending Reviews" tab in admin dashboard
   - Filter to show only content with `pendingReview: true`
   - Sort by `reviewRequestedAt` (oldest first)

2. **Review Comments:**

   - Allow admin to add comments when rejecting
   - Show rejection reason to content owner

3. **Bulk Actions:**

   - Approve/reject multiple reviews at once
   - Bulk pause/unpause functionality

4. **Analytics:**

   - Track average review time
   - Monitor pause/approval rates
   - Content owner compliance metrics

5. **Email Notifications:**
   - Send email when content is paused
   - Send email when review is approved/rejected
   - Configurable notification preferences

---

## Files Modified

### Backend

1. `/server/controllers/videoCtrl.js` - Lines 44-104
2. `/server/controllers/blogCtrl.js` - Lines 168-218

### Frontend

3. `/client/src/components/notifications/NotificationItem.jsx` - Lines 111-161
4. `/client/src/pages/dashboard/DashboardPosts.jsx` - Multiple sections
5. `/client/src/pages/dashboard/DashboardArticles.jsx` - Multiple sections

---

## Conclusion

This implementation provides a complete content moderation workflow with:

- ✅ Enforced privacy for paused content
- ✅ Automatic notification system
- ✅ Direct navigation to specific content
- ✅ Visual feedback and highlighting
- ✅ Pending review indicators
- ✅ Consistent behavior across videos and articles

The system ensures that paused content cannot be made public without explicit admin approval, while providing a smooth user experience for both admins and content owners.
