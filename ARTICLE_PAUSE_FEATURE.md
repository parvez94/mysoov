# Article Pause Feature Implementation

## Overview

Added a "pause" feature for articles in the admin dashboard, similar to how posts/videos work. Admins can now pause/unpause articles instead of just unpublishing them.

## Changes Made

### 1. Article Model (`server/models/Article.js`)

- **Added `isPaused` field**: Boolean field (default: false) to track pause status
- **Added index**: Created index on `isPaused` for faster queries
- Articles can now be both published AND paused/unpaused independently

### 2. Blog Controller (`server/controllers/blogCtrl.js`)

- **Updated `getPublishedArticles`**: Now filters for `published: true` AND `isPaused: false`
- **Updated `getArticleBySlug`**: Now checks both published and isPaused status
- **Added `toggleArticlePause`**: New function to toggle article pause status (admin only)
  - Toggles the `isPaused` field
  - Returns success message with current pause state
  - Similar to `toggleVideoPrivacy` for videos

### 3. Blog Routes (`server/routes/blogRoutes.js`)

- **Added new route**: `PATCH /api/v1/blog/articles/:id/pause`
  - Requires authentication and admin role
  - Calls `toggleArticlePause` controller function

### 4. Admin Controller (`server/controllers/adminCtrl.js`)

- **Added `getAllArticles`**: Get all articles with author data for admin dashboard
- **Added `deleteArticle`**: Delete article by ID (admin only)
- **Added `toggleArticlePause`**: Toggle article pause status (admin only)
  - Similar implementation to `toggleVideoPrivacy`

### 5. Admin Routes (`server/routes/adminRoutes.js`)

- **Added article management routes**:
  - `GET /api/admin/articles` - Get all articles
  - `DELETE /api/admin/articles/:articleId` - Delete article
  - `PUT /api/admin/articles/:articleId/toggle-pause` - Toggle pause status

## API Endpoints

### Admin Article Management

```
GET    /api/admin/articles                      - Get all articles
DELETE /api/admin/articles/:articleId           - Delete article
PUT    /api/admin/articles/:articleId/toggle-pause - Toggle pause status
```

### Blog Article Management

```
PATCH  /api/v1/blog/articles/:id/pause          - Toggle pause status (admin only)
```

## How It Works

1. **Published + Not Paused** = Article is visible to public
2. **Published + Paused** = Article is hidden from public (paused by admin)
3. **Not Published** = Article is a draft (not visible)

This gives admins fine-grained control:

- Authors can publish/unpublish their articles (draft mode)
- Admins can pause/unpause any published article without changing its published status

## Example Usage

### Toggle Article Pause (Admin)

```javascript
// Request
PUT /api/admin/articles/123456/toggle-pause

// Response
{
  "success": true,
  "message": "Article paused successfully",
  "article": {
    "_id": "123456",
    "title": "My Article",
    "isPaused": true,
    "published": true,
    ...
  }
}
```

### Get All Articles (Admin Dashboard)

```javascript
// Request
GET /api/admin/articles

// Response
{
  "success": true,
  "articles": [...],
  "total": 10
}
```

## Frontend Integration Notes

The frontend admin dashboard should:

1. Display all articles with their pause status
2. Show a "Pause/Unpause" button for each article
3. Call `PUT /api/admin/articles/:articleId/toggle-pause` when clicked
4. Update the UI to reflect the new pause state
5. Show visual indicators (e.g., badge or icon) for paused articles

## Database Migration

Existing articles will have `isPaused: false` by default, so they will continue to work as before. No migration script is needed.
