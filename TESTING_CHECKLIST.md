# Real-Time Notifications - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Stop any running server instances: `lsof -ti:5100 | xargs kill -9`
- [ ] Clear browser cache and cookies
- [ ] Open browser DevTools console
- [ ] Have two different browsers ready (or use incognito mode)

---

## 🧪 Test Suite

### Test 1: Server Startup ✅

**Goal:** Verify server starts without errors

**Steps:**

1. Run `npm run dev` in server directory
2. Check console output

**Expected Logs:**

```
🚀 Socket.IO server initialized
✅ Database connected successfully
✅ Socket.IO handlers registered
✅ Server running on http://localhost:5100
✅ Socket.IO ready for connections
```

**Pass Criteria:**

- [ ] No errors in console
- [ ] All ✅ checkmarks appear
- [ ] Server listening on port 5100

---

### Test 2: Client Connection ✅

**Goal:** Verify client connects to Socket.IO server

**Steps:**

1. Start frontend: `npm run dev` (in client directory)
2. Open browser to `http://localhost:5173`
3. Login with a user account
4. Check browser console

**Expected Client Logs:**

```
🔌 Initializing Socket.IO connection to: http://localhost:5100
✅ Socket.IO connected: <socket-id>
🔔 Setting up newNotification listener on socket: <socket-id>
```

**Expected Server Logs:**

```
🔐 Authenticating socket connection...
✅ Socket authenticated for user: <username>
👤 User connected: <username> (<userId>)
🔌 Socket ID: <socket-id>
📢 User joined room: user_<userId>
✅ Active users count: 1
```

**Pass Criteria:**

- [ ] Client shows "Socket.IO connected"
- [ ] Server shows user authenticated and connected
- [ ] User joined their personal room
- [ ] No connection errors

---

### Test 3: Single Notification ✅

**Goal:** Verify basic notification delivery

**Setup:**

- User A (Browser 1): Logged in
- User B (Browser 2): Logged in

**Steps:**

1. User A likes one of User B's videos
2. Check User B's browser console
3. Check server console

**Expected User B Logs:**

```
🔔 Received newNotification event: {type: "like", ...}
🔔 Playing notification sound...
```

**Expected Server Logs:**

```
✅ Notification saved to database: <notification-id>
🔔 Emitting notification to room: user_<userId>
📦 Notification data: {id: ..., type: "like", ...}
✅ Notification emitted via Socket.IO
```

**Pass Criteria:**

- [ ] User B receives notification in real-time
- [ ] Notification appears in UI
- [ ] Sound plays (if enabled)
- [ ] Browser notification shows (if permission granted)
- [ ] Server logs show emission to correct room

---

### Test 4: Multiple Rapid Notifications ⚠️ CRITICAL

**Goal:** Verify system handles rapid notifications without degradation

**Setup:**

- User A (Browser 1): Logged in
- User B (Browser 2): Logged in

**Steps:**

1. User A performs 10 actions rapidly:
   - Like 3 videos
   - Comment on 3 videos
   - Follow User B
   - Like 3 more videos
2. Count notifications received by User B
3. Wait 5 seconds
4. Perform 5 more actions
5. Count notifications again

**Expected Behavior:**

- All 10 notifications arrive within 2 seconds
- All 5 additional notifications arrive
- No duplicates
- No errors in console

**Pass Criteria:**

- [ ] All 15 notifications received
- [ ] No "stopping" after 2-3 notifications
- [ ] No duplicate notifications
- [ ] No console errors
- [ ] System remains responsive

**This is the test that was FAILING before the fix!**

---

### Test 5: Duplicate Connection Prevention ✅

**Goal:** Verify only one socket per user

**Steps:**

1. Login as User A in Browser 1
2. Check `/api/test-sockets` endpoint
3. Open Browser 2 (or new tab)
4. Login as User A again
5. Check `/api/test-sockets` endpoint again
6. Check server logs

**Expected Server Logs (when 2nd connection opens):**

```
⚠️  User <username> already has an active connection (<old-socket-id>)
🔄 Disconnecting old socket and replacing with new one
👤 User connected: <username> (<userId>)
📢 User joined room: user_<userId>
```

**Expected `/api/test-sockets` Response:**

```json
{
  "totalSockets": 1,
  "sockets": [
    {
      "id": "<new-socket-id>",
      "userId": "<userId>",
      "username": "<username>",
      "rooms": ["user_<userId>"]
    }
  ]
}
```

**Pass Criteria:**

- [ ] Only ONE socket shown for User A
- [ ] Old socket disconnected automatically
- [ ] New socket is active
- [ ] Notifications still work on new socket

---

### Test 6: Connection Stability ✅

**Goal:** Verify connection remains stable over time

**Steps:**

1. Login as User A
2. Leave browser open for 10 minutes
3. Perform an action (like a video)
4. Check if notification arrives

**Pass Criteria:**

- [ ] Connection remains active after 10 minutes
- [ ] Notification still arrives
- [ ] No reconnection errors
- [ ] Socket ID remains the same (or reconnects gracefully)

---

### Test 7: Reconnection After Disconnect ✅

**Goal:** Verify automatic reconnection works

**Steps:**

1. Login as User A
2. Note the socket ID in console
3. Restart the server (simulate server crash)
4. Wait for client to reconnect
5. Check browser console

**Expected Client Logs:**

```
🔌 Socket.IO disconnected: transport close
🔄 Socket.IO reconnected after X attempts
✅ Socket.IO connected: <new-socket-id>
🔔 Setting up newNotification listener on socket: <new-socket-id>
```

**Pass Criteria:**

- [ ] Client detects disconnection
- [ ] Client automatically reconnects
- [ ] New socket ID assigned
- [ ] Notifications work after reconnection

---

### Test 8: No Self-Notifications ✅

**Goal:** Verify users don't receive notifications for their own actions

**Steps:**

1. Login as User A
2. Like your own video
3. Check console and notification list

**Expected Server Logs:**

```
⏭️  Skipping notification: sender and recipient are the same
```

**Pass Criteria:**

- [ ] No notification created
- [ ] No notification received
- [ ] Server logs show skip message

---

### Test 9: Logout Cleanup ✅

**Goal:** Verify socket properly disconnects on logout

**Steps:**

1. Login as User A
2. Note socket ID
3. Logout
4. Check browser console
5. Check `/api/test-sockets` endpoint

**Expected Client Logs:**

```
🧹 User logged out, cleaning up socket...
🔌 Socket.IO disconnected: io client disconnect
```

**Expected Server Logs:**

```
👋 User disconnected: <username> (<userId>), reason: client namespace disconnect
✅ Active users count: 0
```

**Pass Criteria:**

- [ ] Socket disconnected on logout
- [ ] User removed from active users
- [ ] No socket shown in `/api/test-sockets`
- [ ] Clean disconnect (no errors)

---

### Test 10: Multiple Users Simultaneously ✅

**Goal:** Verify system handles multiple users correctly

**Setup:**

- User A (Browser 1)
- User B (Browser 2)
- User C (Browser 3)

**Steps:**

1. All users login
2. Check `/api/test-sockets` - should show 3 sockets
3. User A likes User B's video
4. User B likes User C's video
5. User C likes User A's video
6. Verify each user receives only their notification

**Pass Criteria:**

- [ ] 3 active sockets shown
- [ ] Each user in their own room
- [ ] User A receives only notification from User C
- [ ] User B receives only notification from User A
- [ ] User C receives only notification from User B
- [ ] No cross-contamination of notifications

---

## 🐛 Debugging Commands

### Check Active Sockets

```bash
curl http://localhost:5100/api/test-sockets | jq
```

### Check Database Connection

```bash
curl http://localhost:5100/api/test-db | jq
```

### Check Server Health

```bash
curl http://localhost:5100/api | jq
```

### Kill Server Process

```bash
lsof -ti:5100 | xargs kill -9
```

### View Server Logs (if running in background)

```bash
tail -f server.log
```

---

## 📊 Success Metrics

### Before Fixes (FAILING):

- ❌ Notifications work 2-3 times then stop
- ❌ Multiple sockets per user
- ❌ Memory leaks from event listeners
- ❌ Notifications sent to dead sockets

### After Fixes (PASSING):

- ✅ Notifications work indefinitely
- ✅ One socket per user
- ✅ Proper cleanup of event listeners
- ✅ Notifications always sent to active socket
- ✅ System stable over time

---

## 🚨 Red Flags to Watch For

### Client-Side:

```
❌ Socket.IO connection error
❌ Multiple "Setting up newNotification listener" for same socket
❌ Notification received but not displayed
❌ Socket disconnects without reconnecting
```

### Server-Side:

```
❌ Multiple sockets for same user in /api/test-sockets
❌ "Emitting notification" but client doesn't receive
❌ Authentication errors
❌ Room not joined
```

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 - Server Startup:           [ ] PASS  [ ] FAIL
Test 2 - Client Connection:        [ ] PASS  [ ] FAIL
Test 3 - Single Notification:      [ ] PASS  [ ] FAIL
Test 4 - Multiple Rapid (CRITICAL):[ ] PASS  [ ] FAIL
Test 5 - Duplicate Prevention:     [ ] PASS  [ ] FAIL
Test 6 - Connection Stability:     [ ] PASS  [ ] FAIL
Test 7 - Reconnection:             [ ] PASS  [ ] FAIL
Test 8 - No Self-Notifications:    [ ] PASS  [ ] FAIL
Test 9 - Logout Cleanup:           [ ] PASS  [ ] FAIL
Test 10 - Multiple Users:          [ ] PASS  [ ] FAIL

Overall Status: [ ] ALL PASS  [ ] SOME FAIL

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🎯 Priority Testing Order

1. **Test 1** - Server Startup (must pass first)
2. **Test 2** - Client Connection (must pass second)
3. **Test 4** - Multiple Rapid Notifications ⚠️ **MOST CRITICAL**
4. **Test 5** - Duplicate Connection Prevention
5. **Test 3** - Single Notification
6. Tests 6-10 - Additional validation

**If Test 4 passes, the main issue is FIXED!**
