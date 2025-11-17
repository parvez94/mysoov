# Frontpage System Guide

## Overview

The frontpage system replaces the old landing page builder with a simpler, structured 5-section layout.

## Features

### 5 Sections:

1. **Slider** - Image/Video carousel with auto-rotation (5 seconds)
2. **Happy Views** - Deep orange section with steps and code input
3. **Your Account** - Login/Signup buttons
4. **Happy Team** - Register button
5. **Banner** - Full-width image banner

## How It Works

### For Visitors (Not Logged In)

- Visit `/` to see the frontpage
- All 5 sections display based on admin settings
- Login/Signup buttons open authentication modals

### For Logged-In Users

- Visit `/` to see the regular Home feed
- Frontpage is NOT shown once logged in

### For Admins

#### Admin Settings Page

- **URL**: `/dashboard/frontpage`
- **Access**: Dashboard → Frontpage (in left sidebar)

#### Features:

- ✅ **Enable/Disable** each section individually
- ✅ **Preview Button** - Opens frontpage in new tab to see how it looks
- ✅ **Slider Management** - Add/remove images and videos
- ✅ **Happy Views Section**:
  - Change background color (color picker)
  - Edit heading text
  - Add/edit/remove numbered steps
  - Customize code input field label and placeholder
- ✅ **Your Account Section** - Edit texts for login/signup buttons
- ✅ **Happy Team Section** - Edit text and register button label
- ✅ **Banner Section** - Set banner image URL

#### Preview Route

- **URL**: `/frontpage-preview`
- Shows the frontpage with navbar (even when logged in)
- Opens in new tab when clicking "Preview" button
- Useful for admins to check layout and design

## Routes

| Route                  | Shows                                               | Access                     |
| ---------------------- | --------------------------------------------------- | -------------------------- |
| `/`                    | Frontpage (if not logged in) OR Home (if logged in) | Public                     |
| `/frontpage-preview`   | Frontpage with navbar                               | Anyone (useful for admins) |
| `/dashboard/frontpage` | Admin settings page                                 | Admin only                 |

## API Endpoints

### Public

- `GET /api/v1/frontpage/settings` - Get frontpage settings
- `POST /api/v1/frontpage/submit-code` - Submit code from input field

### Admin Only

- `PUT /api/v1/frontpage/settings` - Update all settings
- `POST /api/v1/frontpage/slider/items` - Add slider item
- `PUT /api/v1/frontpage/slider/items/:itemId` - Update slider item
- `DELETE /api/v1/frontpage/slider/items/:itemId` - Remove slider item

## Default Settings

- **Happy Views Background**: `#FF8C00` (deep orange)
- **Slider Auto-rotation**: Every 5 seconds
- **All sections**: Enabled by default

## Technical Details

### Database

- Model: `FrontpageSettings` (MongoDB)
- Singleton pattern: Only one document exists
- Auto-creates with default values if missing

### Frontend Components

- `Frontpage.jsx` - Public-facing component (all 5 sections)
- `DashboardFrontpage.jsx` - Admin settings page
- `App.jsx` - Contains routing logic

### Styling

- Uses `styled-components`
- Fully responsive (mobile-friendly)
- Theme variables for consistency

## Migration Notes

### What Was Removed

**Frontend:**

- ✅ `client/src/pages/dashboard/DashboardLandingPage.jsx` - DELETED
- ✅ `client/src/pages/LandingPage.jsx` - DELETED
- ✅ Route `/landing` - REMOVED
- ✅ Route `/dashboard/landing-page` - REMOVED
- ✅ Landing page logic from Layout.jsx - REMOVED
- ✅ "Landing Page" menu item - REPLACED with "Frontpage"

**Backend:**

- ✅ `server/models/LandingPage.js` - DELETED
- ✅ `server/controllers/landingPageCtrl.js` - DELETED
- ✅ `server/routes/landingPageRoutes.js` - DELETED
- ✅ `server/scripts/createDemoLandingPage.js` - DELETED
- ✅ Route `/api/v1/landing-page` - REMOVED

**Documentation:**

- ✅ `LANDING_PAGE_BUILDER.md` - DELETED

### What Was Added

- ✅ Route `/frontpage-preview` for admin preview
- ✅ Conditional rendering at `/` (Home or Frontpage)
- ✅ Preview button in admin settings
- ✅ Updated navigation in sidebar
- ✅ New frontpage system with 5 structured sections

## Next Steps (Optional)

### Potential Enhancements:

1. Add file upload for slider images/videos (instead of URLs)
2. Add file upload for banner image
3. Add custom validation logic for code input submission
4. Add analytics tracking for frontpage visits
5. Add A/B testing capability for different frontpage layouts
6. Add section reordering (drag-and-drop)
7. Add custom CSS injection for advanced styling

## Support

For issues or questions:

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Ensure MongoDB connection is working
4. Check that admin user has correct permissions
