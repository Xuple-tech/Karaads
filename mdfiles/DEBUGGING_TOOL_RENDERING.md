# 🔍 Debugging Tool Rendering Issues

## Quick Diagnostic Checklist

### Issue 1: Tool Loading Indicator Not Showing

**Steps to Diagnose:**

1. **Open DevTools (F12) → Network Tab**
   - Look for `/api/chat` request
   - Check if SSE is connecting (should show `eventstream`)

2. **Open DevTools → Console Tab**
   ```javascript
   // Paste this to see tool_status events
   window.sseDebug = true;
   ```

3. **Check the SSE Events:**
   - Network tab → Find `/api/chat` request
   - Click "Response" tab
   - You should see:
   ```
   data: {"tool_status":"executing_tool","tool_name":"generate_image","tool_executing_message":"🎨 Generating images..."}
   ```

**If you DON'T see this:**
- Backend is not sending tool_status events
- Check `app/Services/GrokApiService.php` line 388
- Ensure callback is being called

**If you DO see this but no loading card:**
- Frontend not receiving SSE events
- Check browser console for errors
- Add this to `ChatInterface.tsx` after line 223:
  ```typescript
  console.log('🔧 Tool Status Event:', data);
  ```

---

### Issue 2: Images Rendering Twice

**Steps to Diagnose:**

1. **Check the message object structure:**
   ```javascript
   // In DevTools Console:
   // Find the chat messages in React DevTools or add logging
   ```

2. **Look for these fields in message:**
   ```javascript
   message.content  // Should be empty ('')  for image-only
   message.image    // Should have {url, metadata}
   message.images   // Should be array for multiple
   message.type     // Should be 'image' or 'mixed'
   ```

3. **If you see both `content` AND `image`:**
   - The content field should be empty
   - Check `ChatInterface.tsx` line 296
   - Add logging:
   ```typescript
   console.log('📸 Message after image:', lastMessage);
   ```

---

## Quick Debug Code

Add this to `resources/js/components/chat/ChatInterface.tsx` in the SSE handler to debug:

```typescript
// Add after line 203 in ChatInterface.tsx
console.log('📡 SSE Event Received:', {
    timestamp: new Date().toISOString(),
    data,
    messageCount: messages.length,
    lastMessage: messages[messages.length - 1]
});

// Also log tool status
if (data.tool_status) {
    console.log('🔧 Tool Status Update:', {
        status: data.tool_status,
        tool: data.tool_name,
        message: data.tool_executing_message
    });
}

// And log image events
if (data.image) {
    console.log('🖼️ Image Event:', {
        url: data.image.url?.substring(0, 50) + '...',
        metadata: data.image.metadata
    });
}
```

---

## Backend Debug Checks

### 1. Verify tool detection
Check if backend is detecting tools:
- Go to `app/Services/GrokApiService.php` line 337
- Tools should be detected when API responds with tool_calls

**Add logging:**
```php
Log::info('Tool calls detected:', $toolCalls);
```

### 2. Verify callback execution
Check if callback is being called with tool data:
- Line 388: `executing_tool` status
- Line 410: `generated_images` data
- Line 415: `search_results` data

**Add temporary logging:**
```php
// In callback function, add at start:
Log::debug('Callback invoked:', [
    'has_tool_status' => isset($chunk['tool_status']),
    'has_image' => isset($chunk['generated_images']),
    'has_search' => isset($chunk['search_results']),
    'chunk_keys' => array_keys($chunk)
]);
```

### 3. Verify SSE echoing
Check if data reaches SSE output:
```php
// Add at line 269 in ChatController.php:
Log::debug('SSE echoing tool data:', $toolData);
echo "data: " . json_encode($toolData) . "\n\n";
ob_flush();
flush();
```

---

## Frontend Debug Checks

### 1. Message Component Not Rendering
Add logging to `Message.tsx`:
```typescript
// After line 72
console.log('🎯 Message renderContent called:', {
    toolStatus: message.metadata?.tool_status,
    hasImages: !!message.image || !!message.images,
    contentLength: content.length,
    type: message.type
});
```

### 2. Tool Status Not Updating
Add logging to `ChatInterface.tsx` line 231:
```typescript
console.log('🔄 Setting tool status metadata:', {
    status: data.tool_status,
    toolName: data.tool_name,
    executingMessage: data.tool_executing_message,
    lastMessageId: lastMessage?.id
});
```

### 3. Image Not Persisting to localStorage
Add logging after line 278:
```typescript
console.log('💾 localStorage save:', {
    key: `rhea_${imageKey}`,
    imageUrl: data.image.url?.substring(0, 50),
    storageKey: imageKey
});

// Check if it was actually saved:
const saved = localStorage.getItem(`rhea_${imageKey}`);
console.log('✓ Verified saved:', !!saved);
```

---

## Step-by-Step Test

### Test 1: Generate Image
1. Type: "Generate a sunset"
2. Open DevTools → Network tab
3. Watch `/api/chat` request
4. In Console tab, you should see:
   ```
   🔧 Tool Status Update: {status: 'executing_tool', tool: 'generate_image', ...}
   🖼️ Image Event: {url: '...', metadata: {...}}
   💾 localStorage save: {key: 'rhea_image_...', ...}
   ```

### Test 2: Refresh Page
1. After images appear, press F5
2. Images should still be visible
3. In Console, check localStorage:
   ```javascript
   // In Console:
   Object.keys(localStorage).filter(k => k.startsWith('rhea_image_'))
   ```

### Test 3: Web Search
1. Type: "What is AI?"
2. Watch for:
   ```
   🔧 Tool Status Update: {status: 'executing_tool', tool: 'web_search', ...}
   📡 SSE Event Received: {search_results: [...], references: [...]}
   ```

---

## Common Issues & Fixes

### Issue: "No SSE events showing"
**Solution:** Check if backend is reaching tool execution
```bash
# In Laravel, check logs:
tail -f storage/logs/laravel.log | grep -i tool
```

### Issue: "tool_status arrives but no loading card"
**Solution:** Check if Message component renderContent is being called
- Add console.log at line 72 of Message.tsx
- Verify condition at line 76 is working

### Issue: "Images appear twice"
**Solution:** Check if content field has image URL
- Add logging at line 296 of ChatInterface.tsx
- Verify `lastMessage.content === ''` after image event

### Issue: "Images lost on refresh"
**Solution:** Verify localStorage implementation
- Check DevTools → Application → Storage → localStorage
- Look for keys starting with `rhea_image_`
- If missing, check browser console for errors

---

## Expected Behavior

### Image Generation Flow
```
1. User: "Generate sunset"
   ↓
2. SSE: tool_status = 'executing_tool' + loading card shows
   ↓
3. SSE: image data arrives + saved to localStorage
   ↓
4. UI: Image grid displays with download button
   ↓
5. Refresh: Image still visible (from localStorage)
```

### Web Search Flow
```
1. User: "What is AI?"
   ↓
2. SSE: tool_status = 'executing_tool' + loading card shows
   ↓
3. SSE: search_results + references arrive
   ↓
4. UI: Markdown with clickable source links
   ↓
5. Refresh: Results still visible in conversation
```

---

## Collect Debugging Info

If issues persist, gather this info:

1. **Browser Console Output:**
   - Take screenshot of console logs
   - Include any errors

2. **Network Request:**
   - Right-click `/api/chat` in Network tab → Copy as cURL
   - Share Network response (first 500 chars)

3. **localStorage Contents:**
   ```javascript
   // In Console:
   JSON.stringify(Object.entries(localStorage).filter(([k]) => k.startsWith('rhea_')), null, 2)
   ```

4. **Message Object Structure:**
   ```javascript
   // In Console (requires React DevTools):
   // Inspect message component and check props.message
   ```

5. **Server Logs:**
   ```bash
   # Tail logs while making request:
   tail -f storage/logs/laravel.log
   ```

---

## Still Having Issues?

**Create a minimal test case:**
1. Clear all browser storage: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Try single image generation
4. Gather console logs
5. Check `storage/logs/laravel.log` for errors

**Check these files are modified:**
- ✅ `resources/js/components/chat/Message.tsx` (lines 72-114 show tool status)
- ✅ `resources/js/components/chat/ChatInterface.tsx` (lines 276-283 localStorage)
- ✅ `app/Http/Controllers/Api/ChatController.php` (lines 254-269 SSE)
- ✅ `app/Services/GrokApiService.php` (line 388 callback tool_status)

**Verify these functions exist:**
- `GrokApiService::executeAndContinueToolCalls()` - line 373
- `GrokApiService::getToolExecutingMessage()` - line 540
- Callback sends data via `echo "data: "` - line 269

---

## Performance Notes

- localStorage updates are async (non-blocking)
- SSE events should arrive within 100-500ms
- Re-renders happen on each state update
- No caching issues (images use unique timestamps)

---

## Next Steps

1. Add the debug logging code above
2. Run one image generation
3. Check all console logs
4. Check Network SSE response
5. Check localStorage contents
6. Share what you find!
