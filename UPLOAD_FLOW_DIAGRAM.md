# Upload Flow Diagram

## 🎬 Video Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER UPLOADS A VIDEO                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Check User Settings │
                  │  What provider?      │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │  Provider: YouTube  │   │ Provider: Cloudinary │
    └──────────┬──────────┘   └──────────┬──────────┘
               │                          │
               ▼                          ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ YouTube Configured? │   │  Check File Size    │
    └──────────┬──────────┘   │  Against Plan Limit │
               │              └──────────┬──────────┘
        ┌──────┴──────┐                 │
        │             │          ┌──────┴──────┐
        ▼             ▼          │             │
    ┌─────┐      ┌─────┐     ┌─────┐      ┌─────┐
    │ YES │      │ NO  │     │ OK  │      │ TOO │
    └──┬──┘      └──┬──┘     └──┬──┘      │LARGE│
       │            │           │          └──┬──┘
       │            │           │             │
       ▼            │           ▼             ▼
┌──────────────┐   │    ┌──────────────┐  ┌──────────┐
│ SKIP SIZE    │   │    │ Upload to    │  │ REJECT   │
│ CHECK        │   │    │ Cloudinary   │  │ 403 Error│
│              │   │    │              │  └──────────┘
│ Upload to    │   │    │ ✅ Success   │
│ YouTube      │   │    └──────────────┘
│              │   │
│ ✅ Unlimited │   │
└──────────────┘   │
                   │
                   ▼
            ┌──────────────┐
            │ Check Size   │
            │ Against Limit│
            └──────┬───────┘
                   │
            ┌──────┴──────┐
            │             │
            ▼             ▼
        ┌─────┐       ┌─────┐
        │ OK  │       │ TOO │
        └──┬──┘       │LARGE│
           │          └──┬──┘
           ▼             │
    ┌──────────────┐    │
    │ Upload to    │    │
    │ Cloudinary   │    │
    │              │    │
    │ ✅ Success   │    │
    └──────────────┘    │
                        ▼
                  ┌──────────┐
                  │ REJECT   │
                  │ 403 Error│
                  └──────────┘
```

---

## 🖼️ Image Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER UPLOADS AN IMAGE                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Images ALWAYS use   │
                  │  Cloudinary          │
                  │  (Hardcoded)         │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Check File Size     │
                  │  Against 5MB Limit   │
                  └──────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              ┌──────────┐      ┌──────────┐
              │ Size OK  │      │ Too Large│
              │ (< 5MB)  │      │ (> 5MB)  │
              └────┬─────┘      └────┬─────┘
                   │                 │
                   ▼                 ▼
         ┌──────────────────┐  ┌──────────┐
         │ Upload to        │  │ REJECT   │
         │ Cloudinary       │  │ 403 Error│
         │                  │  └──────────┘
         │ ✅ Success       │
         └──────────────────┘
```

---

## 🔄 Complete Decision Tree

```
                        ┌─────────────┐
                        │ File Upload │
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌──────────────┐      ┌──────────────┐
            │   IS VIDEO?  │      │   IS IMAGE?  │
            └──────┬───────┘      └──────┬───────┘
                   │                     │
                   │                     ▼
                   │              ┌──────────────┐
                   │              │ ALWAYS       │
                   │              │ Cloudinary   │
                   │              │ 5MB Limit    │
                   │              └──────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Check Provider       │
        │ Setting              │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ YouTube      │      │ Cloudinary   │
│ Selected     │      │ Selected     │
└──────┬───────┘      └──────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ YouTube      │      │ Apply Plan   │
│ Configured?  │      │ Size Limit   │
└──────┬───────┘      └──────────────┘
       │
┌──────┴──────┐
│             │
▼             ▼
YES           NO
│             │
│             ▼
│      ┌──────────────┐
│      │ Fallback to  │
│      │ Cloudinary   │
│      │ + Size Limit │
│      └──────────────┘
│
▼
┌──────────────┐
│ Upload to    │
│ YouTube      │
│ NO SIZE      │
│ LIMIT! 🎉    │
└──────────────┘
```

---

## 📊 Size Limit Matrix

```
╔═══════════════╦═══════════════╦═══════════════╦═══════════════╗
║  File Type    ║   Provider    ║  Actual Store ║  Size Limit   ║
╠═══════════════╬═══════════════╬═══════════════╬═══════════════╣
║  Image        ║  Cloudinary   ║  Cloudinary   ║  5MB          ║
╠═══════════════╬═══════════════╬═══════════════╬═══════════════╣
║  Image        ║  YouTube      ║  Cloudinary   ║  5MB          ║
╠═══════════════╬═══════════════╬═══════════════╬═══════════════╣
║  Video        ║  Cloudinary   ║  Cloudinary   ║  Plan Limit   ║
╠═══════════════╬═══════════════╬═══════════════╬═══════════════╣
║  Video        ║  YouTube      ║  YouTube      ║  ∞ UNLIMITED  ║
╚═══════════════╩═══════════════╩═══════════════╩═══════════════╝

Plan Limits:
  • Free Plan:     5MB
  • Basic Plan:    50MB
  • Premium Plan:  200MB
  • Pro Plan:      500MB
```

---

## 🔍 Code Flow (Simplified)

### Before Fix ❌

```javascript
1. User uploads file
2. ❌ Check size limit (ALWAYS applied)
3. If too large → REJECT
4. If OK → Determine provider
5. Upload to provider
```

**Problem:** YouTube videos rejected at step 2!

---

### After Fix ✅

```javascript
1. User uploads file
2. Determine if video or image
3. ✅ Determine provider FIRST
4. Calculate: willUseCloudinary?
   - Images: YES (always)
   - Videos to YouTube: NO
   - Videos to Cloudinary: YES
5. IF willUseCloudinary:
     Check size limit
     If too large → REJECT
6. Upload to provider
```

**Solution:** YouTube videos skip size check at step 5!

---

## 🎯 Key Variables

```javascript
// Determines if file will use Cloudinary
const willUseCloudinary =
  !isVideo || // Images always use Cloudinary
  provider !== 'youtube' || // OR provider is not YouTube
  !isYouTubeConfigured(); // OR YouTube not configured

// Examples:
// Image + YouTube provider     → willUseCloudinary = true  (5MB limit)
// Image + Cloudinary provider  → willUseCloudinary = true  (5MB limit)
// Video + YouTube provider     → willUseCloudinary = false (no limit!)
// Video + Cloudinary provider  → willUseCloudinary = true  (plan limit)
// Video + YouTube (not config) → willUseCloudinary = true  (plan limit)
```

---

## 🚦 Response Codes

```
✅ 200 - Upload successful
❌ 400 - Missing file
❌ 403 - File exceeds size limit
❌ 404 - User not found
❌ 500 - Server error (upload failed)
```

---

## 💡 Pro Tips

1. **For Large Videos:** Always select YouTube as provider
2. **For Images:** Provider setting doesn't matter (always Cloudinary)
3. **Free Users:** Upgrade plan for larger Cloudinary uploads
4. **YouTube Fallback:** If YouTube fails, falls back to Cloudinary (with limits)

---

**Visual Summary:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  📸 IMAGES → Always Cloudinary (5MB limit)              │
│                                                         │
│  🎬 VIDEOS → YouTube Selected? → ∞ Unlimited!           │
│           → Cloudinary Selected? → Plan Limit           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
