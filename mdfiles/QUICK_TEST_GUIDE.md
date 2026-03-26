# ⚡ Quick Test Guide - Duplicate Image Fix

## 🚀 Test Immediately (5 minutes)

### Test 1: Single Image Generation
```
1. Open DevTools (F12)
2. Type: "Generate a beautiful sunset"
3. Watch for:
   - Loading card appears (blue box with spinner) ✓
   - ONE image appears in grid ✓
   - No duplicate rendering ✓
4. Click Download - should work ✓
5. Refresh page (F5) - image still there ✓
```

**Expected Result:** 
- ✅ Image appears ONCE
- ✅ Download works
- ✅ Persists on refresh

---

### Test 2: Multiple Images
```
1. Type: "Generate 3 sunset photos"
2. Watch for:
   - Loading card appears ✓
   - ALL 3 images appear in grid (2 columns on desktop) ✓
   - Each image rendered ONCE ✓
3. Refresh page - all 3 still there ✓
```

**Expected Result:**
- ✅ All images appear once each
- ✅ Grid layout correct
- ✅ All persist

---

### Test 3: Console Logging
```
1. Open DevTools Console (F12 → Console tab)
2. Generate an image
3. In console, look for logs like:
   - "🔧 Tool Status Update: {status: 'executing_tool'...}"
   - "📸 Message after image: {type: 'image', content: '', image: {...}}"
   - "💾 localStorage save: {key: 'rhea_image_...'}"
4. NO errors about undefined or rendering issues ✓
```

**Expected Result:**
- ✅ Clean console (no errors)
- ✅ Logs show proper event flow
- ✅ content field is empty ('')

---

## 🔍 Detailed Verification

### Check 1: Message Content is Empty

**In DevTools Console, paste:**
```javascript
const lastMsg = document.querySelector('[role="main"]')?.querySelector('[role="article"]:last-of-type');
console.log('Last message content length:', lastMsg?.textContent?.length || 'N/A');
// Should show reasonable length (not huge)
```

### Check 2: Verify Content Field

**Add temporary logging to Message.tsx** (line 124):
```typescript
const renderContent = () => {
    const content = getMessageContent();
    
    // ADD THIS LINE:
    if (message.images || message.image) {
        console.log('🖼️ Image Message Content:', {
            content: content,
            isEmpty: content === '',
            hasImages: !!message.images || !!message.image,
            imageCount: message.images?.length || (message.image ? 1 : 0)
        });
    }
    
    // ... rest of function
```

Then generate an image and check console output.

**Expected:**
```
🖼️ Image Message Content: {
    content: "",
    isEmpty: true,
    hasImages: true,
    imageCount: 1
}
```

### Check 3: Verify MarkdownMessage Not Rendering Images

**In React DevTools:**
1. Find the Message component for the image
2. Check props.message:
   - `type` should be `'image'` or `'mixed'`
   - `content` should be `''` (empty)
   - `image` or `images` array should have data

If content is NOT empty, logging will show what's in it.

---

## ❌ If Issues Persist

### Issue: Images Still Rendering Twice

**Debug step 1:** Check content field
```javascript
// In Console:
// After generating image, paste:
const msg = document.querySelector('[role="main"]');
const content = msg?.querySelector('[class*="markdown"]')?.textContent;
console.log('Markdown rendered content:', content);
// Should be minimal or empty
```

**Debug step 2:** Check localStorage
```javascript
// In Console:
Object.keys(localStorage)
    .filter(k => k.startsWith('rhea_image_'))
    .forEach(k => {
        const data = JSON.parse(localStorage.getItem(k));
        console.log('Stored image:', data.url?.substring(0, 50));
    });
```

**Debug step 3:** Check message structure
```javascript
// Open React DevTools
// Find Message component
// Check if images array is correct:
// Should see: [{url: '...', metadata: {...}}]
```

### Issue: Loading Card Not Showing

**Check 1:** SSE events arriving
```javascript
// Paste in Console before generating:
window.sseDebug = (data) => console.log('📡 SSE:', data);
// Then generate image
// Should see SSE events in console
```

**Check 2:** Tool status metadata
```javascript
// In Message component props:
message.metadata.tool_status
// Should show 'executing_tool' during generation
```

### Issue: Images Lost After Refresh

**Check localStorage:**
```javascript
// In Console:
console.log('localStorage items:', localStorage.length);
console.log('Image keys:', 
    Object.keys(localStorage).filter(k => k.includes('image'))
);
```

**If empty:** Images not being saved
- Check for errors: `npm run dev` console output
- Check browser console for localStorage errors
- Verify localStorage is enabled: DevTools → Application → Storage

---

## 📊 Expected Behavior Map

| Scenario | Expected | Actual |
|----------|----------|--------|
| Generate 1 image | Shows once | __ |
| Generate 3 images | Shows 3x, no duplication | __ |
| Image + text response | 1 image + text below | __ |
| Refresh page | All images persist | __ |
| Search query | Results + sources | __ |
| Loading state | Blue box with spinner | __ |
| Download button | Works, gets image | __ |
| Console errors | None related to rendering | __ |

---

## 🎯 Checkpoints

**Before starting:** 
- [ ] Code changes applied (see CHANGES_DIFF_GUIDE.md)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Page hard refreshed (Ctrl+Shift+R)
- [ ] DevTools open and ready

**During testing:**
- [ ] Console logs show proper flow
- [ ] No JavaScript errors
- [ ] No CSS visual issues
- [ ] Responsive on mobile (if testing)

**After testing:**
- [ ] All tests pass
- [ ] No performance issues
- [ ] localStorage working
- [ ] Page refresh works

---

## 💾 Storage Check

### View All Persisted Images
```javascript
// In DevTools Console:
const allImages = Object.entries(localStorage)
    .filter(([k]) => k.startsWith('rhea_image_'))
    .map(([k, v]) => {
        const data = JSON.parse(v);
        return {
            key: k,
            url: data.url?.substring(0, 30) + '...',
            savedAt: new Date(data.savedAt).toLocaleString()
        };
    });
console.table(allImages);
```

### Clear Old Images (if needed)
```javascript
// Remove images older than 1 day:
const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
Object.entries(localStorage)
    .filter(([k]) => k.startsWith('rhea_image_'))
    .forEach(([k, v]) => {
        const data = JSON.parse(v);
        if (data.savedAt < oneDayAgo) {
            localStorage.removeItem(k);
            console.log('Removed old image:', k);
        }
    });
```

---

## ✅ Final Verification

Run this in DevTools Console after generating images:

```javascript
console.group('🔍 Final Verification');

// Check 1: Message structure
const messages = document.querySelectorAll('[role="article"]');
const lastMsg = messages[messages.length - 1];
console.log('✓ Last message found:', !!lastMsg);

// Check 2: Content is empty
console.log('✓ Content field empty:', lastMsg?.querySelector('[class*="markdown"]')?.textContent?.length < 100);

// Check 3: Images found
const images = lastMsg?.querySelectorAll('img');
console.log('✓ Images in DOM:', images?.length);

// Check 4: No duplicate images
console.log('✓ Each image appears once:', images?.length <= 3 || 'Check visually');

// Check 5: localStorage working
const stored = Object.keys(localStorage).filter(k => k.startsWith('rhea_')).length;
console.log('✓ Stored items:', stored > 0 ? `${stored} found` : 'None (check if generated)');

console.groupEnd();
```

**Should show all ✓ marks.**

---

## 🆘 Getting Help

If tests fail, gather:

1. **Screenshot of DevTools Console** (with errors)
2. **Screenshot of test result** (what appeared)
3. **localStorage contents:**
   ```javascript
   JSON.stringify(localStorage, null, 2)
   ```
4. **Message object** (from React DevTools)
5. **Server logs:**
   ```bash
   tail -f storage/logs/laravel.log | tail -20
   ```

---

## 📝 Test Results Template

```
Test Date: ___________
Browser: Chrome / Firefox / Safari / Other ____
Device: Desktop / Tablet / Mobile

TEST 1: Single Image
  [ ] Loading card shows
  [ ] Image appears ONCE
  [ ] Download works
  [ ] Persists on refresh
  Result: PASS / FAIL

TEST 2: Multiple Images  
  [ ] All appear once each
  [ ] Grid layout correct
  [ ] All download buttons work
  [ ] All persist on refresh
  Result: PASS / FAIL

TEST 3: Web Search
  [ ] Loading card shows
  [ ] Results display
  [ ] Sources clickable
  Result: PASS / FAIL

TEST 4: Console
  [ ] No errors
  [ ] Proper logs showing
  Result: PASS / FAIL

Overall Result: PASS / FAIL
Notes: ___________________________________________
```

---

**Happy testing! 🎉**

If you find ANY issues, run the debugging guide and let me know the results!
