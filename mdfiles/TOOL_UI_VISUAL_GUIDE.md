# Tool UI Visual Guide

Visual reference for how tools render in the chat interface.

---

## 1. Web Search - Loading State

```
┌────────────────────────────────────────────┐
│ ⏳ 🔍 Searching the web...                  │
│    Using web search tool                  │
└────────────────────────────────────────────┘
```

**Colors**:
- Background: Blue-50 (light) / Blue-950 (dark mode)
- Border: Blue-200 (light) / Blue-800 (dark)
- Text: Blue-700 (light) / Blue-300 (dark mode)
- Spinner: Blue-500

**Components**:
- Animated spinner (rotating circle)
- Emoji icon: 🔍
- Message text
- Tool name label

---

## 2. Web Search - Complete State

```
┌────────────────────────────────────────────┐
│ Based on the latest research, AI breakthroughs│
│ in 2024 include:                           │
│ • Advanced reasoning models...              │
│ • Improved multimodal systems...            │
│ • Real-time processing capabilities...     │
│                                            │
│ 📚 Sources                                 │
│ [1] TechCrunch - AI Breakthroughs 2024    │
│ [2] MIT Technology Review - LLM Research  │
│ [3] ArXiv - Latest ML Papers              │
│ [4] OpenAI Blog - GPT Advances            │
│ [5] DeepMind Announcement - New Models    │
└────────────────────────────────────────────┘
```

**Features**:
- Response text with Markdown support
- Separator line above sources
- "📚 Sources" header
- Numbered links: [1], [2], [3]...
- Each link clickable, opens in new tab
- Links truncate long titles

---

## 3. Image Generation - Loading State

```
┌────────────────────────────────────────────┐
│ ⏳ 🎨 Generating images...                  │
│    Using generate image tool               │
└────────────────────────────────────────────┘
```

**Colors**: Same as web search
**Emoji**: 🎨
**Duration**: 10-30 seconds depending on complexity

---

## 4. Image Generation - Single Image

```
┌────────────────────────────────────────────┐
│ ✓ Image generation complete                │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │                                      │  │
│ │     [Generated Image Display]        │  │
│ │     (Responsive aspect ratio)        │  │
│ │                                      │  │
│ └──────────────────────────────────────┘  │
│ [Download] [Feedback]                     │
└────────────────────────────────────────────┘
```

**Features**:
- Success badge: ✓ Image generation complete
- Image centered
- Responsive sizing
- Download button with icon
- Feedback button (if applicable)

---

## 5. Image Generation - Multiple Images (2x2 Grid)

```
┌────────────────────────────────────────────┐
│ ✓ Image generation complete                │
│                                            │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │                  │ │                  │ │
│ │   [Image 1]      │ │   [Image 2]      │ │
│ │                  │ │                  │ │
│ └──────────────────┘ └──────────────────┘ │
│ [Download]          [Download]            │
│                                            │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │                  │ │                  │ │
│ │   [Image 3]      │ │   [Image 4]      │ │
│ │                  │ │                  │ │
│ └──────────────────┘ └──────────────────┘ │
│ [Download]          [Download]            │
└────────────────────────────────────────────┘
```

**Layout**:
- Desktop: 2-column grid
- Mobile: 1-column stack
- Responsive gap spacing
- Each image can be downloaded independently

---

## 6. Image Generation - Mobile View

```
┌──────────────────┐
│ ✓ Image gener... │
│                  │
│ ┌────────────┐   │
│ │            │   │
│ │ [Image 1]  │   │
│ │            │   │
│ └────────────┘   │
│ [Download]       │
│                  │
│ ┌────────────┐   │
│ │            │   │
│ │ [Image 2]  │   │
│ │            │   │
│ └────────────┘   │
│ [Download]       │
└──────────────────┘
```

**Features**:
- Single column layout
- Full width minus padding
- Stacked vertically
- Touch-friendly buttons

---

## 7. Mixed Response (Image + Text)

```
┌────────────────────────────────────────────┐
│ ✓ Image generation complete                │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │                                      │  │
│ │     [Generated Image Display]        │  │
│ │                                      │  │
│ └──────────────────────────────────────┘  │
│ [Download]                                │
│                                            │
│ Here's the sunset image I created for you.│
│ The golden hour is captured with warm tones│
│ reflecting off the water. The composition  │
│ follows the rule of thirds...              │
│                                            │
│ 📚 Sources                                 │
│ [1] Photography Guide - Sunset Tips       │
│ [2] Art Theory - Color Composition        │
└────────────────────────────────────────────┘
```

**Features**:
- Image at top
- Download button below image
- Text description below
- Sources section at very bottom

---

## 8. Web Fetch - Loading State

```
┌────────────────────────────────────────────┐
│ ⏳ 📄 Fetching webpage...                   │
│    Using web fetch tool                   │
└────────────────────────────────────────────┘
```

**Emoji**: 📄
**Duration**: 3-10 seconds

---

## 9. Tool Execution Error

```
┌────────────────────────────────────────────┐
│ ❌ Tool execution failed                    │
│                                            │
│ Error: Image generation timed out.        │
│ Please try with a simpler prompt.         │
│                                            │
│ [Retry] [Simplify Prompt]                 │
└────────────────────────────────────────────┘
```

**Features**:
- Red background for errors
- Clear error message
- Retry option
- Suggestions if available

---

## 10. Rapid Tool Execution (Both Simultaneously)

```
┌──────────────────────────────────────────────────┐
│ ⏳ 🎨 Generating images...                        │
│    Using generate image tool                    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⏳ 🔍 Searching the web...                        │
│    Using web search tool                        │
└──────────────────────────────────────────────────┘

(After completion:)

┌──────────────────────────────────────────────────┐
│ ✓ Image generation complete                      │
│                                                  │
│ [Generated Image]                               │
│ [Download]                                      │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Based on my search findings...                   │
│                                                  │
│ 📚 Sources                                       │
│ [1] Source 1                                    │
│ [2] Source 2                                    │
└──────────────────────────────────────────────────┘
```

---

## 11. Dark Mode Comparison

### Light Mode
```
┌────────────────────────────────────────────┐
│ Blue background (bg-blue-50)               │
│ Dark blue text (text-blue-700)             │
│ Blue spinner (border-blue-500)             │
│ Gray sources text                          │
│ Blue links                                 │
└────────────────────────────────────────────┘
```

### Dark Mode
```
┌────────────────────────────────────────────┐
│ Dark blue background (bg-blue-950)         │
│ Light blue text (text-blue-300)            │
│ Light blue spinner (border-blue-500)       │
│ Gray sources text (text-gray-400)          │
│ Light blue links (text-blue-400)           │
└────────────────────────────────────────────┘
```

---

## 12. Responsive Breakpoints

| Breakpoint | Tool Display | Grid Layout | Container Width |
|-----------|-------------|-------------|-----------------|
| Mobile (< 640px) | Full width | 1 column | 90vw |
| Tablet (640-1024px) | Adjusted | 1-2 columns | 80% |
| Desktop (> 1024px) | Optimized | 2-4 columns | 80% / max-w-3xl |

---

## 13. Animation States

### Spinner Animation
```
Frame 1:  ⠋  (rotating)
Frame 2:  ⠙
Frame 3:  ⠹
Frame 4:  ⠸
Frame 5:  ⠼
Frame 6:  ⠴
Frame 7:  ⠦
Frame 8:  ⠧
(Loop)
```

**CSS**: `animate-spin` (60 frames per second)

### Source Links Hover
```
Normal:    [1] TechCrunch - AI News
Hover:    [1] TechCrunch - AI News (underlined, pointer cursor)
```

---

## 14. Typography

### Loading Message
- **Size**: 0.875rem (14px)
- **Weight**: 600 (semibold)
- **Color**: Tool-specific blue shade

### Tool Label
- **Size**: 0.75rem (12px)
- **Weight**: 400 (normal)
- **Color**: Slightly dimmer blue
- **Format**: "Using {tool_name} tool" (capitalized)

### Sources Header
- **Size**: 0.75rem (12px)
- **Weight**: 600 (semibold)
- **Format**: "📚 Sources"

### Source Links
- **Size**: 0.75rem (12px)
- **Format**: "[index] Title"
- **Color**: Blue-600 (light) / Blue-400 (dark)
- **Hover**: Underline, cursor pointer

---

## 15. Spacing & Padding

| Element | Padding | Margin | Gap |
|---------|---------|--------|-----|
| Loading Card | pt-6 pb-6 | mb-3 | gap-3 |
| Images Grid | p-0 | gap-4 | gap-4 |
| Sources | mt-4 pt-3 | - | gap-2 |
| Download Button | - | mr-2 | - |

---

## 16. Accessibility Features

- ✅ Text labels for screen readers
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Color not sole indicator (icons + text)
- ✅ Sufficient contrast ratios
- ✅ Focus indicators on links
- ✅ Alt text for images

---

## Quick Reference: Emoji Meanings

| Emoji | Meaning | Tool |
|-------|---------|------|
| 🔍 | Searching | Web Search |
| 🎨 | Creating/Drawing | Image Generation |
| 📄 | Document/Webpage | Web Fetch |
| ✓ | Complete/Success | All |
| ⏳ | Loading/Waiting | All |
| 📚 | Sources/References | Web Tools |
| ❌ | Error/Failed | All |
