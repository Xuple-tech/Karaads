# Tool Rendering - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Backend API key configured (`GROK_API_KEY` in `.env`)
- [ ] Search service configured (for web search)
- [ ] Database migrations run: `php artisan migrate`
- [ ] Frontend dev server running: `npm run dev`
- [ ] Backend running: `php artisan serve`

---

## 🧪 Test Scenarios

### **Scenario 1: Web Search Tool**

**Prompt to test**: 
```
What are the top 5 AI breakthroughs in 2024?
```

**Expected Flow**:
1. ✅ See loading card appears with: 🔍 Searching the web...
2. ✅ Loading spinner animates
3. ✅ "Using web search tool" text shown
4. ✅ After 2-5 seconds, response text appears
5. ✅ Sources section appears at bottom with [1], [2], [3] links
6. ✅ Can click source links (open in new tab)

**Success Criteria**:
- [ ] Loading card appears within 1 second
- [ ] At least 3 sources displayed
- [ ] All source URLs are clickable
- [ ] No errors in browser console

---

### **Scenario 2: Image Generation (Single)**

**Prompt to test**:
```
Generate a beautiful landscape with mountains and a lake at sunset
```

**Expected Flow**:
1. ✅ Loading card appears: 🎨 Generating images...
2. ✅ Spinner animates (may take 10-15 seconds)
3. ✅ Image appears in single column (responsive)
4. ✅ Success badge: ✓ Image generation complete
5. ✅ Download button available

**Success Criteria**:
- [ ] Loading card shows immediately
- [ ] Image displays after generation
- [ ] Download button works
- [ ] Success badge visible
- [ ] Image quality acceptable

---

### **Scenario 3: Image Generation (Multiple)**

**Prompt to test**:
```
Generate 4 images of a futuristic city at night with neon lights
```

**Expected Flow**:
1. ✅ Loading card: 🎨 Generating images...
2. ✅ After generation, 4 images appear
3. ✅ Grid layout: 2 columns on desktop, 1 on mobile
4. ✅ Each image has independent download button
5. ✅ Success badge shows: ✓ Image generation complete

**Success Criteria**:
- [ ] All 4 images display
- [ ] Grid layout responsive (test on mobile)
- [ ] Each download button works independently
- [ ] No overlapping or layout issues

---

### **Scenario 4: Mixed Response (Image + Search)**

**Prompt to test**:
```
Show me an image of an ancient Roman temple and tell me about recent archaeological discoveries
```

**Expected Flow**:
1. ✅ May show both loading indicators
2. ✅ Image appears at top
3. ✅ Text description below
4. ✅ Sources for web search at bottom

**Success Criteria**:
- [ ] Image displays correctly
- [ ] Text renders below image
- [ ] Sources are accessible
- [ ] Layout is organized

---

### **Scenario 5: Web Fetch Tool**

**Prompt to test**:
```
Fetch the content from https://openai.com and summarize it for me
```

**Expected Flow**:
1. ✅ Loading: 📄 Fetching webpage...
2. ✅ Backend fetches and processes
3. ✅ Response appears with fetched data
4. ✅ Sources shown if searched first

**Success Criteria**:
- [ ] Fetching message appears
- [ ] No CORS errors
- [ ] Content loads successfully

---

### **Scenario 6: Error Handling**

**Test 1 - Invalid Image Prompt**:
```
Generate 10 images
```
**Expected**: Error message about max 4 images

- [ ] Error displays clearly
- [ ] User can retry

**Test 2 - Search Timeout**:
```
Search for something very obscure that might timeout
```
**Expected**: Timeout error or graceful degradation

- [ ] Timeout message shown
- [ ] Retry option available
- [ ] UI doesn't freeze

---

## 🔍 Visual Inspection Checklist

### Loading Indicator
- [ ] Blue background color is visible
- [ ] Spinner animates smoothly
- [ ] Text is readable
- [ ] Tool name shows correctly
- [ ] Emoji displays properly

### Web Search Results
- [ ] Sources section has border/separator
- [ ] "📚 Sources" header visible
- [ ] Links are numbered [1], [2], [3]...
- [ ] Link text is blue (clickable appearance)
- [ ] Long titles are truncated with ellipsis
- [ ] Hover effect works

### Image Grid
- [ ] 2-column layout on desktop
- [ ] 1-column layout on mobile
- [ ] Images don't overflow container
- [ ] Download buttons aligned properly
- [ ] Success badge visible
- [ ] Spacing between images consistent

---

## 📊 Browser Console Checks

Open DevTools (F12) → Console tab

**Should NOT see errors**:
- [ ] ❌ No `Failed to parse SSE message` errors
- [ ] ❌ No `undefined` reference errors
- [ ] ❌ No CORS errors for image URLs
- [ ] ❌ No TypeScript type errors

**Should see useful logs**:
- [ ] ✅ `"Executing tool: web_search..."`
- [ ] ✅ `"Image generation started"`

---

## 🌙 Dark Mode Test

- [ ] Loading card colors work in dark mode
- [ ] Text contrast is readable
- [ ] Links are visible (blue in dark mode)
- [ ] Images display correctly
- [ ] No color issues

---

## 📱 Responsive Design Test

Test on different viewport sizes:

**Mobile (375px)**:
- [ ] Loading card fits without overflow
- [ ] Images in 1-column layout
- [ ] Sources section readable
- [ ] Text size appropriate

**Tablet (768px)**:
- [ ] Images in 2-column layout (if multiple)
- [ ] Card width appropriate
- [ ] No mobile layout on desktop size

**Desktop (1920px)**:
- [ ] Proper max-width enforced
- [ ] Grid layouts work
- [ ] Nothing stretched inappropriately

---

## 🔄 State Management Tests

### Test: Rapid Tool Calls
Send multiple tool requests quickly:
```
1. Generate an image
2. Search while image generating
3. Fetch a webpage
```

**Expected**:
- [ ] Each tool shows its own loading indicator
- [ ] No interference between tools
- [ ] Results display correctly for each

### Test: Message History
Reload page with completed tool messages:

**Expected**:
- [ ] Loading cards don't re-appear
- [ ] Results persist correctly
- [ ] Images still display
- [ ] Sources still clickable

---

## 📝 Performance Checks

**Network Tab (DevTools)**:
- [ ] SSE events streaming properly
- [ ] Images load with reasonable size
- [ ] No unnecessary re-renders

**Performance Tab**:
- [ ] No significant jank during tool execution
- [ ] Animations smooth (60fps)
- [ ] Memory stable (no leaks)

---

## ✨ End-to-End Test

**Complete user journey**:
1. [ ] User types: "Generate an image of a sunset and find facts about sunset phenomena"
2. [ ] System shows: 🎨 Generating images... + 🔍 Searching...
3. [ ] Image displays with download option
4. [ ] Response text shows facts
5. [ ] Sources display at bottom
6. [ ] User downloads image
7. [ ] User clicks a source link
8. [ ] New tab opens with source

---

## 📋 Sign-Off

- **Tested By**: _______________
- **Date**: _______________
- **All Tests Passed**: Yes / No
- **Issues Found**: 

```
[List any issues here]
1. 
2. 
3. 
```

---

## 🆘 Troubleshooting

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Loading card not showing | SSE not parsing tool_status | Check backend sending event |
| Images not displaying | Invalid URLs | Verify URLs in console |
| Sources not clickable | Missing URL field | Check references structure |
| Grid layout broken | CSS classes missing | Clear cache, rebuild CSS |
| Tool messages wrong | Typo in getToolExecutingMessage | Check exact function name |

---

## 📚 Reference

**Key Files Modified**:
- `/app/Services/GrokApiService.php` - Backend tool handling
- `/resources/js/components/chat/ChatInterface.tsx` - SSE parsing
- `/resources/js/components/chat/Message.tsx` - UI rendering

**Related Documentation**:
- `TOOL_RENDERING_IMPLEMENTATION.md` - Full technical details
- `IMAGE_GENERATION_STREAMING_GUIDE.md` - Image generation specifics
