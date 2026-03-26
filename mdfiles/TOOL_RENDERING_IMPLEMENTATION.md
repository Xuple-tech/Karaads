# Tool Rendering Implementation Guide

## Overview

This document describes how tool calling (web search, image generation, web fetch) renders in the UI with proper loading indicators and result displays.

## ✨ Features Implemented

### 1. **Real-Time Tool Status Indicators**
- **Web Search**: 🔍 Searching the web...
- **Image Generation**: 🎨 Generating images...
- **Web Fetch**: 📄 Fetching webpage...

Shows animated loading spinner while tool executes.

### 2. **Web Search References Display**
- Shows sources with links after response
- Numbered references `[1] [2] [3]...`
- Clickable source links open in new tab
- Clean, compact presentation

### 3. **Image Generation Display**
- Loading indicator with spinner
- Success badge when complete: ✓ Image generation complete
- Responsive grid layout (1-4 images)
- Individual download buttons per image

### 4. **Enhanced Metadata Tracking**
Stores tool execution info:
```typescript
metadata: {
  tool_status: 'executing_tool' | 'tool_completed' | 'tool_failed',
  tool_name: 'web_search' | 'generate_image' | 'web_fetch',
  tool_executing_message: string,
  search_results?: array,
  references?: array,
  generated_images?: array
}
```

---

## Backend Implementation

### File: `app/Services/GrokApiService.php`

#### New Methods Added

**1. `getToolExecutingMessage(string $toolName): string`**
Returns tool-specific loading messages:
```php
'web_search'    → '🔍 Searching the web...'
'web_fetch'     → '📄 Fetching webpage...'
'generate_image' → '🎨 Generating images...'
```

#### Enhanced Methods

**2. `executeAndContinueToolCalls()`** 
- Sends `tool_executing_message` with each tool execution
- Formats web search results with references for frontend
- Includes images array for image generation
- Attaches structured reference data for web search

```php
// For web search
'search_results' => array of results,
'search_query' => original query,
'search_count' => result count,
'references' => [
    ['index' => 1, 'title' => '...', 'url' => '...', 'snippet' => '...'],
    ...
]

// For image generation
'generated_images' => [
    ['url' => '...', 'revised_prompt' => '...'],
    ...
]
```

---

## Frontend Implementation

### File: `resources/js/components/chat/ChatInterface.tsx`

#### New Event Handlers

**1. Search Results Event**
```typescript
// Handle web search results
if (data.search_results && data.references) {
    // Store in message metadata
    lastMessage.metadata.search_results = data.search_results;
    lastMessage.metadata.references = data.references;
    lastMessage.metadata.search_query = data.search_query;
}
```

### File: `resources/js/components/chat/Message.tsx`

#### Enhanced Rendering

**1. Tool Loading Indicator** (lines 75-108)
- Shows while tool executes
- Displays emoji + message + tool name
- Animated spinner
- Tool-specific emojis:
  - 🎨 Image generation
  - 🔍 Web search
  - 📄 Web fetch

**2. Sources/References Section** (lines 208-231)
- Displays after tool completes
- Shows numbered links: `[1] Title`
- Clickable, opens in new tab
- Truncates long titles

---

## Flow Diagram

```
User asks: "What's the latest news about AI?"
       ↓
Backend detects web_search tool needed
       ↓
Sends: tool_status='executing_tool', tool_executing_message='🔍 Searching...'
       ↓
Frontend displays: 
   ┌─────────────────────────┐
   │  ⏳ 🔍 Searching the web... │
   │  Using web search tool  │
   └─────────────────────────┘
       ↓
Backend executes search, gets results
       ↓
Sends: tool_status='tool_completed', references=[...], search_results=[...]
       ↓
AI generates response using search data
       ↓
Frontend displays:
   ┌─────────────────────────────────────┐
   │ AI's response about latest AI news  │
   │                                     │
   │ 📚 Sources                          │
   │ [1] TechCrunch - Latest AI News     │
   │ [2] ArXiv - New Paper on LLMs       │
   │ [3] OpenAI Blog - GPT-5 Release     │
   └─────────────────────────────────────┘
```

---

## Testing Guide

### Test 1: Simple Web Search
**Request**: "Find me information about Python"

**Expected Behavior**:
1. Loading spinner shows: "🔍 Searching the web..."
2. Backend searches
3. Response displays with numbered sources at bottom
4. Can click sources to verify URLs

### Test 2: Image Generation
**Request**: "Generate a beautiful landscape image"

**Expected Behavior**:
1. Loading spinner shows: "🎨 Generating images..."
2. Backend generates image
3. Image displays in grid
4. Success badge shows: "✓ Image generation complete"
5. Download button available

### Test 3: Multiple Images
**Request**: "Generate 3 images of sunset"

**Expected Behavior**:
1. Loading indicator shows
2. Three images display in grid (2-column layout)
3. Each has independent download button
4. Success badge visible

### Test 4: Mixed Response (Image + Text)
**Request**: "Create an image of a cat and describe it"

**Expected Behavior**:
1. Image displays first
2. Description text below image
3. Message type: 'mixed'

### Test 5: Web Fetch After Search
**Request**: "Search for latest AI news and fetch the first result"

**Expected Behavior**:
1. First shows web search loading: "🔍 Searching..."
2. Then shows web fetch loading: "📄 Fetching..."
3. Response includes fetched content
4. Sources displayed

---

## Debugging Tips

### Issue: Loading indicator not showing
**Solution**: 
- Check `tool_status` field is being sent from backend
- Verify `tool_executing_message` is set
- Check `ChatInterface.tsx` line 223-242 for SSE parsing

### Issue: References not displaying
**Solution**:
- Verify backend is sending `references` array
- Check `references` structure has: `index`, `title`, `url`, `snippet`
- Clear browser cache (may have cached old message format)

### Issue: Images not showing in grid
**Solution**:
- Verify `image.url` is valid and accessible
- Check image URLs start with `http://` or `https://`
- Verify `generated_images` array sent from backend
- Check CORS if loading external images

### Common Log Messages to Watch

```bash
# Backend (Laravel log)
"Executing web search: {query}"
"Executing image generation: {prompt}"

# Frontend (Browser console)
"Failed to parse SSE message:"  → JSON parse error
"Chat error:" → Connection issue
```

---

## File Changes Summary

| File | Changes | Lines |
|------|---------|-------|
| `GrokApiService.php` | Added `getToolExecutingMessage()`, Enhanced `executeAndContinueToolCalls()` | +40 lines |
| `ChatInterface.tsx` | Added web search results handler, SSE event parsing | +20 lines |
| `Message.tsx` | Enhanced loading card, Added references display | +35 lines |

---

## Future Enhancements

- [ ] Tool execution history/timeline view
- [ ] Retry failed tool executions
- [ ] Tool parameter customization UI
- [ ] Search result snippet preview on hover
- [ ] Image generation parameters (quality, style, etc.)
- [ ] Web fetch result caching
- [ ] Batch tool execution progress

---

## Related Files

- Type definitions: `resources/js/types/chat.d.ts`
- UI Components: `resources/js/components/ui/`
- Styling: Tailwind CSS classes
- Icons: Lucide React icons
