# 🧪 Testing Checklist: Tool Failures & Upgrade Prompts

## Pre-Test Setup

- [ ] Run `npm run dev` (frontend dev server)
- [ ] Run `php artisan serve` (Laravel server)
- [ ] Open browser to http://localhost:8000
- [ ] Sign in to your account
- [ ] Open browser DevTools (F12) and check Console

---

## Test 1: Image Generation Limit Flow ✅

### Scenario: User hits daily image generation limit

**Steps**:
1. [ ] Open chat
2. [ ] Ask: "Generate a cute fluffy white cat sitting on a comfortable couch"
3. [ ] Wait for response

**Expected Results**:
- [ ] See executing animation: "🎨 Generating images..."
- [ ] Tool fails (you likely already have limit)
- [ ] **TOAST appears** at top-right: "Limit reached - Upgrade to continue!" (red/amber)
- [ ] **LimitNotification card appears** above chat:
  - [ ] Shows icon: ⚠️ or ⚡
  - [ ] Title: "Upgrade Required" or "Limit Reached"
  - [ ] Message: "Daily image generation limit reached. Upgrade to generate more images!"
  - [ ] Shows current plan
  - [ ] Shows time remaining until reset
  - [ ] Has **"Upgrade Now"** button (prominent)
  - [ ] Has **"Dismiss"** button

**✅ What You Should See**:
```
┌────────────────────────────────────────┐
│  🔔 Limit reached - Upgrade to...     │ ← Toast
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ⚠️ Upgrade Required                   │
│ Daily image generation limit reached  │
│ Current Plan: Free                    │
│ Resets in: ~22 hours                  │
│                                        │
│  [💪 Upgrade Now] [Dismiss]          │
└────────────────────────────────────────┘

Chat:
User: "Generate a cute fluffy..."
AI:   🎨 Tool Failed
      Daily image generation limit...
      generate image tool
      I'm sorry, but I've hit...
```

**If This Fails**:
- [ ] Check console for errors (F12)
- [ ] Verify LimitNotification imported
- [ ] Check `parseLimitError()` is called
- [ ] Ensure error message contains "limit"

---

## Test 2: Tool Error Card Display ✅

### Scenario: Verify tool error appears clearly

**Steps**:
1. [ ] Continue from Test 1
2. [ ] Look at chat message from assistant

**Expected Results**:
- [ ] See RED error card (not just text)
- [ ] Card shows:
  - [ ] 🎨 emoji (image generation)
  - [ ] "Tool Failed" header
  - [ ] Error message: "Daily image generation limit reached..."
  - [ ] Tool name: "generate image tool"
- [ ] Error card appears BEFORE assistant's text response

**✅ What You Should See**:
```
┌─────────────────────────────────────┐
│ 🎨 Tool Failed                      │
│ Daily image generation limit        │
│ reached (1 images per day). Please  │
│ try again tomorrow.                 │
│ generate image tool                 │
└─────────────────────────────────────┘

Then below it, the assistant's response text.
```

**If This Fails**:
- [ ] Check Message.tsx has tool error renderer
- [ ] Verify `metadata.tool_status === 'failed'`
- [ ] Check `metadata.tool_error` is set

---

## Test 3: Upgrade Button Functionality ✅

### Scenario: Click upgrade button

**Steps**:
1. [ ] Continue from Test 2 (LimitNotification visible)
2. [ ] Click **"Upgrade Now"** button
3. [ ] Wait for navigation

**Expected Results**:
- [ ] Browser navigates to `/subscription/pricing`
- [ ] Pricing page loads with plan options
- [ ] Can select and upgrade plan

**If This Fails**:
- [ ] Check route exists: `php artisan route:list | grep pricing`
- [ ] Check auth is working
- [ ] Check browser console for navigation errors

---

## Test 4: Dismiss Functionality ✅

### Scenario: Dismiss notification

**Steps**:
1. [ ] Go back to chat
2. [ ] Generate image again to trigger limit
3. [ ] When LimitNotification appears, click **"Dismiss"**

**Expected Results**:
- [ ] LimitNotification card disappears
- [ ] Toast also dismissed
- [ ] Chat still visible
- [ ] Can continue chatting

**If This Fails**:
- [ ] Check `onClose` handler called
- [ ] Verify `limitError` state cleared

---

## Test 5: Fresh Message Clears Limit ✅

### Scenario: Verify limit clears when sending new message

**Steps**:
1. [ ] Trigger limit again (see LimitNotification)
2. [ ] Type new message in chat input
3. [ ] Hit Enter/Send

**Expected Results**:
- [ ] LimitNotification disappears
- [ ] New message sent
- [ ] Can see new assistant response
- [ ] No phantom notifications

**If This Fails**:
- [ ] Check `setLimitError(null)` in handleSubmit
- [ ] Verify state clearing before new request

---

## Test 6: Web Search (If Configured) ✅

### Scenario: Test web search tool

**Pre-requisite**:
- [ ] Configure in `.env`:
  ```
  GOOGLE_API_KEY=your_key
  GOOGLE_SEARCH_ENGINE_ID=your_cx
  ```
- [ ] Restart Laravel server

**Steps**:
1. [ ] Open chat
2. [ ] Ask: "Search the web for latest AI news"
3. [ ] Wait for response

**Expected Results**:
- [ ] See executing animation: "🔍 Searching the web..."
- [ ] After ~3-5 seconds, search results appear
- [ ] Show [1] Title, [2] Title, etc. with links
- [ ] Can click links

**If You See "0 search results"**:
- [ ] API not configured
- [ ] Add GOOGLE_API_KEY to .env
- [ ] Restart server

**If You Hit Search Limit** (if implemented):
- [ ] See LimitNotification for web_search
- [ ] Message: "Daily web search limit reached..."
- [ ] Can upgrade

**If This Fails**:
- [ ] Check SearchService.php
- [ ] Verify Google API credentials
- [ ] Check logs: `tail storage/logs/laravel.log`

---

## Test 7: Multiple Tool Failures ✅

### Scenario: Multiple different tool failures

**Steps**:
1. [ ] Try image generation (hits limit)
2. [ ] See error card + notification
3. [ ] Dismiss notification
4. [ ] Try web search (if configured, hits limit)
5. [ ] See different error

**Expected Results**:
- [ ] Each tool shows its own error card
- [ ] Each has appropriate emoji (🎨 vs 🔍)
- [ ] Each generates proper notification
- [ ] Notifications stack/replace appropriately

---

## Test 8: Error Message Variations ✅

### Scenario: Different error message formats

**Test messages**:
- [ ] "Daily image generation limit reached" → Upgrade prompt
- [ ] "Monthly API request limit exceeded" → Upgrade prompt
- [ ] "Quota exceeded" → Upgrade prompt
- [ ] "Tool execution failed" → Generic error (no upgrade)

**Expected**:
- [ ] Messages with "limit"/"exceeded"/"quota" show upgrade
- [ ] Generic errors show regular error alert
- [ ] All handled gracefully

---

## Test 9: Dark Mode ✅

### Scenario: Verify dark mode styling

**Steps**:
1. [ ] Trigger limit error
2. [ ] Switch to dark mode (if available)
3. [ ] Check colors/contrast

**Expected Results**:
- [ ] LimitNotification readable in dark mode
- [ ] Error card colors adjusted
- [ ] Text contrast good
- [ ] Icons visible

**Colors in Dark Mode**:
- [ ] Background: dark-50 (slightly darker)
- [ ] Text: light enough to read
- [ ] Borders: visible
- [ ] Buttons: styled correctly

---

## Test 10: Mobile Responsive ✅

### Scenario: Test on mobile/tablet

**Steps**:
1. [ ] Open DevTools (F12)
2. [ ] Toggle device toolbar (iPad/iPhone)
3. [ ] Trigger limit error
4. [ ] Check responsive

**Expected Results**:
- [ ] LimitNotification fits screen
- [ ] Text readable
- [ ] Buttons tappable (48px min)
- [ ] No horizontal scroll
- [ ] Toast visible on small screens

---

## Manual Verification Checklist

### Code Changes
- [ ] `ChatInterface.tsx` has LimitNotification import
- [ ] `ChatInterface.tsx` has `parseLimitError()` function
- [ ] `ChatInterface.tsx` handles `tool_status === 'failed'`
- [ ] `ChatInterface.tsx` renders LimitNotification
- [ ] `Message.tsx` has tool error card renderer
- [ ] No TypeScript errors: `npm run types`

### Component Rendering
- [ ] LimitNotification component imported correctly
- [ ] Component receives correct props
- [ ] onUpgrade callback works
- [ ] onClose callback works

### Error Detection
- [ ] `isLimitError` regex catches "limit" keyword
- [ ] `isLimitError` regex catches "exceeded" keyword
- [ ] `isLimitError` regex catches "quota" keyword
- [ ] Case-insensitive matching works

### User Flow
- [ ] Tool fails → Error detected
- [ ] Error detected → Notification shown
- [ ] Notification shown → User sees upgrade prompt
- [ ] User clicks upgrade → Goes to pricing
- [ ] User clicks dismiss → Notification gone

---

## Performance Checks

- [ ] No console errors (F12 → Console)
- [ ] No memory leaks (DevTools → Memory)
- [ ] Chat still responsive
- [ ] No UI lag when showing notification
- [ ] Toast appears quickly
- [ ] Navigation to pricing works smoothly

---

## Browser Compatibility

- [ ] Chrome/Edge ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Mobile Safari ✅
- [ ] Chrome Mobile ✅

---

## Accessibility Checks

- [ ] Buttons keyboard accessible (Tab)
- [ ] Error messages readable by screen readers
- [ ] Color not only indication (has text)
- [ ] Contrast meets WCAG AA standards
- [ ] Focus states visible

---

## Documentation Review

- [ ] TOOL_FAILURE_UPGRADE_IMPLEMENTATION.md created ✅
- [ ] QUICK_FIX_SUMMARY_TOOL_FAILURES.md created ✅
- [ ] Code comments clear ✅
- [ ] Error messages helpful ✅

---

## Sign-Off Checklist

### All Tests Passing?
- [ ] Image limit error shows
- [ ] Web search error shows (if configured)
- [ ] Tool error cards display
- [ ] Upgrade button works
- [ ] Dismiss works
- [ ] Multiple errors handled
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] No console errors

### Ready for Production?
- [ ] All tests pass
- [ ] No breaking changes
- [ ] Backward compatible
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Team reviewed

---

## Troubleshooting Guide

### Issue: No notification appears
**Debug**:
```bash
# 1. Check if error is being sent
tail -f storage/logs/laravel.log | grep "tool_status"

# 2. Check browser console
# F12 → Console → Look for errors

# 3. Verify condition
# Error message must contain "limit", "exceeded", or "quota"
```

### Issue: Wrong tool shown
**Debug**:
```tsx
// Add console.log in parseLimitError
console.log('Tool:', toolName, 'Error:', errorMessage);
```

### Issue: Upgrade button doesn't navigate
**Debug**:
```bash
# 1. Check route exists
php artisan route:list | grep pricing

# 2. Check URL
# Should be http://yoursite.com/subscription/pricing
```

### Issue: Web search returns 0 results
**Debug**:
```bash
# 1. Check API configured
grep -E "GOOGLE_API_KEY|GOOGLE_SEARCH_ENGINE_ID" .env

# 2. Check SearchService logs
tail -f storage/logs/laravel.log | grep "Google"

# 3. Verify credentials in Google Cloud Console
```

---

## Final Validation

🎉 **All tests passing?** 

You're ready to:
1. ✅ Deploy to staging
2. ✅ Deploy to production  
3. ✅ Monitor user feedback
4. ✅ Measure upgrade conversion rate

**Metrics to track**:
- Users who see limit notifications
- Upgrade conversion from limit notifications
- Which tools hit limits most often
- Time from limit to upgrade

---

**Created**: 2024
**Status**: Ready for Testing ✅
**Last Updated**: Today
