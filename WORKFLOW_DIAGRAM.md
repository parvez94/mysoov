# Content Moderation Workflow - Visual Guide

## 🎨 UI State Changes

### Dashboard View - Action Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT STATUS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Normal Content (pendingReview = false)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   View   │  │  Pause   │  │   Edit   │  │  Delete  │      │
│  │    👁    │  │   ⏸️     │  │   ✏️     │  │   🗑️     │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                   (Orange)                                      │
│                                                                 │
│  Pending Review Content (pendingReview = true)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   View   │  │ Approve  │  │  Reject  │  │  Delete  │      │
│  │    👁    │  │    ✓     │  │    ✕     │  │   🗑️     │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                   (Green)       (Red)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Status Badge Colors

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS BADGES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐   Content is live and visible to everyone   │
│  │   Active     │   privacy = 'Public' / published = true     │
│  │   🟢 Green   │                                              │
│  └──────────────┘                                              │
│                                                                 │
│  ┌──────────────┐   Admin paused, hidden from public          │
│  │   Paused     │   privacy = 'Private' / isPaused = true     │
│  │   🔴 Red     │                                              │
│  └──────────────┘                                              │
│                                                                 │
│  ┌──────────────┐   Not yet published by owner                │
│  │   Draft      │   published = false                         │
│  │   🟠 Orange  │                                              │
│  └──────────────┘                                              │
│                                                                 │
│  ┌──────────────┐   Waiting for admin review                  │
│  │ Pending      │   pendingReview = true                      │
│  │ Review       │   (Owner edited after pause)                │
│  │   🔵 Blue    │                                              │
│  └──────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Workflow Diagram

```
                    ┌─────────────────────┐
                    │  CONTENT IS PUBLIC  │
                    │   (Active - Green)  │
                    └──────────┬──────────┘
                               │
                               │ Admin clicks Pause
                               ↓
                    ┌─────────────────────┐
                    │  ADMIN PAUSES       │
                    │  • Enters reason    │
                    │  • Sends to owner   │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │  CONTENT PAUSED     │
                    │   (Paused - Red)    │
                    │  privacy = Private  │
                    └──────────┬──────────┘
                               │
                               │ Owner receives notification
                               │ "Your content has been paused"
                               ↓
                    ┌─────────────────────┐
                    │  OWNER EDITS        │
                    │  • Fixes issues     │
                    │  • Keeps private    │
                    │  • Sets pending     │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │  PENDING REVIEW     │
                    │ (Pending - Blue)    │
                    │ pendingReview=true  │
                    └──────────┬──────────┘
                               │
                               │ Admin receives notification
                               │ "Content edited, needs review"
                               ↓
                    ┌─────────────────────┐
                    │  ADMIN REVIEWS      │
                    │  • Can view private │
                    │  • Sees Approve/    │
                    │    Reject buttons   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ↓                             ↓
    ┌─────────────────────┐     ┌─────────────────────┐
    │  ADMIN APPROVES     │     │  ADMIN REJECTS      │
    │  • Optional notes   │     │  • Required reason  │
    │  • Clear pending    │     │  • Clear pending    │
    │  • Make public      │     │  • Keep private     │
    │  • Notify owner ✓   │     │  • Notify owner ✗   │
    └──────────┬──────────┘     └──────────┬──────────┘
               │                           │
               ↓                           ↓
    ┌─────────────────────┐     ┌─────────────────────┐
    │  CONTENT PUBLIC     │     │  CONTENT PRIVATE    │
    │  (Active - Green)   │     │  (Paused - Red)     │
    │  Owner notified:    │     │  Owner notified:    │
    │  "Approved!"        │     │  "Rejected: reason" │
    └─────────────────────┘     └──────────┬──────────┘
                                           │
                                           │ Owner can
                                           │ edit again
                                           ↓
                                ┌─────────────────────┐
                                │  OWNER RE-EDITS     │
                                │  • Fixes based on   │
                                │    feedback         │
                                │  • Resubmits        │
                                └──────────┬──────────┘
                                           │
                                           ↓
                                (Back to Pending Review)
```

## 🎭 Modal Dialogs

### Approve Modal

```
┌─────────────────────────────────────────────────────────┐
│                    Approve Content                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You are about to approve this content and make it     │
│  public. The owner will be notified. You can           │
│  optionally add a note.                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Add note (optional)...                            │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────┐  ┌────────────────────────┐             │
│  │  Cancel  │  │  Approve & Publish ✓   │             │
│  │  (Gray)  │  │      (Green)           │             │
│  └──────────┘  └────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Reject Modal

```
┌─────────────────────────────────────────────────────────┐
│                    Reject Content                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You are about to reject this content review. The      │
│  content will remain private. Please provide a reason  │
│  for rejection so the owner can make necessary changes.│
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Enter rejection reason (required)...              │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ⚠️ Validation: Cannot submit without reason           │
│                                                         │
│  ┌──────────┐  ┌────────────────────────┐             │
│  │  Cancel  │  │   Reject Review ✕      │             │
│  │  (Gray)  │  │      (Red)             │             │
│  └──────────┘  └────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📱 Notifications

### Owner Receives - Content Paused

```
┌─────────────────────────────────────────────────────────┐
│  🔴 Your content has been paused                        │
│                                                         │
│  Reason: [Admin's reason here]                         │
│                                                         │
│  Your content has been hidden from public view.        │
│  Please review and make necessary changes.             │
│                                                         │
│  [View Content]                                        │
└─────────────────────────────────────────────────────────┘
```

### Admin Receives - Pending Review

```
┌─────────────────────────────────────────────────────────┐
│  🔵 Content has been edited and is pending review       │
│                                                         │
│  [Owner Name] has edited their content and submitted   │
│  it for review.                                        │
│                                                         │
│  [Review Now]                                          │
└─────────────────────────────────────────────────────────┘
```

### Owner Receives - Approved

```
┌─────────────────────────────────────────────────────────┐
│  ✅ Your content has been approved!                     │
│                                                         │
│  Your content is now public and visible to everyone.   │
│                                                         │
│  Admin notes: [Optional notes here]                    │
│                                                         │
│  [View Content]                                        │
└─────────────────────────────────────────────────────────┘
```

### Owner Receives - Rejected

```
┌─────────────────────────────────────────────────────────┐
│  ❌ Your content review was rejected                    │
│                                                         │
│  Your content remains private. Please review the       │
│  feedback below and make necessary changes.            │
│                                                         │
│  Reason: [Admin's rejection reason here]               │
│                                                         │
│  [Edit Content]                                        │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────┐
│              PRIVACY CHECK LOGIC                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Regular User tries to view private content:           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ IF user.role !== 'admin' AND                    │   │
│  │    user._id !== content.owner._id               │   │
│  │ THEN                                            │   │
│  │    → 403 Forbidden                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Admin tries to view private content:                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ IF user.role === 'admin' OR                     │   │
│  │    user._id === content.owner._id               │   │
│  │ THEN                                            │   │
│  │    → Allow access (for moderation)              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📊 Database State Changes

### Approve Action

```
BEFORE:
{
  _id: "123",
  privacy: "Private",        // or published: false
  pendingReview: true,
  isPaused: true
}

AFTER:
{
  _id: "123",
  privacy: "Public",         // or published: true
  pendingReview: false,      // ✅ CLEARED
  isPaused: false
}
```

### Reject Action

```
BEFORE:
{
  _id: "123",
  privacy: "Private",
  pendingReview: true,
  isPaused: true
}

AFTER:
{
  _id: "123",
  privacy: "Private",        // ✅ STAYS PRIVATE
  pendingReview: false,      // ✅ CLEARED
  isPaused: true
}
```

## 🎯 Key Differences: Unpause vs Approve

### Old Behavior (Unpause)

```
Admin clicks Unpause
  ↓
Content becomes public
  ↓
❌ pendingReview flag NOT cleared
❌ No notification sent
❌ Owner doesn't know what happened
```

### New Behavior (Approve)

```
Admin clicks Approve
  ↓
Content becomes public
  ↓
✅ pendingReview flag cleared
✅ Notification sent to owner
✅ Owner knows content was reviewed and approved
✅ Optional notes from admin
```

## 🧪 Testing Scenarios

### Scenario 1: Happy Path

```
1. Admin pauses video → ✅ Owner notified
2. Owner edits → ✅ Admin notified
3. Admin approves → ✅ Video public, owner notified
4. Status: Active (Green)
```

### Scenario 2: Rejection & Resubmit

```
1. Admin pauses article → ✅ Owner notified
2. Owner edits → ✅ Admin notified
3. Admin rejects with reason → ✅ Article private, owner notified
4. Owner edits based on feedback → ✅ Admin notified again
5. Admin approves → ✅ Article public, owner notified
6. Status: Active (Green)
```

### Scenario 3: Validation

```
1. Admin tries to reject without reason
   → ❌ Error: "Please provide a reason for rejection"
2. Admin enters reason
   → ✅ Rejection successful
```

---

## 📝 Quick Reference

| Action      | Button Color | Required Input  | Result  | Notification      |
| ----------- | ------------ | --------------- | ------- | ----------------- |
| **Pause**   | 🟠 Orange    | Optional reason | Private | Owner notified    |
| **Unpause** | 🟢 Green     | None            | Public  | ❌ None           |
| **Approve** | 🟢 Green     | Optional notes  | Public  | ✅ Owner notified |
| **Reject**  | 🔴 Red       | Required reason | Private | ✅ Owner notified |

---

**Visual Guide Complete** ✅

This diagram shows the complete flow from content creation to moderation and approval/rejection.
