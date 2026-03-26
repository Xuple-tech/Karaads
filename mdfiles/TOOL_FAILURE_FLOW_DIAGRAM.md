# Tool Failure & Upgrade Flow Diagram

## Complete User Journey - Image Generation Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER SENDS PROMPT                              │
│                    "Generate me a cute cat image"                        │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND: GROKAPI SERVICE                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. Receive generate_image tool call                              │  │
│  │ 2. Check daily limit (1 image per day for free)                 │  │
│  │ 3. User already generated 1 image today                         │  │
│  │ 4. LIMIT EXCEEDED!                                              │  │
│  │ 5. Throw exception:                                             │  │
│  │    "Daily image generation limit reached (1 images per day)"    │  │
│  └───────────────────────────────────────────────────────────────────┘
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND: STREAM EVENT TO CLIENT                       │
│  Sends SSE event:                                                        │
│  {                                                                        │
│    "tool_status": "failed",              ← NEW! Was missing before      │
│    "tool_name": "generate_image",                                        │
│    "error": "Daily image generation limit reached..."                    │
│  }                                                                        │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               FRONTEND: ChatInterface.tsx Line 318                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ✅ NEW CODE:                                                      │  │
│  │ if (data.tool_status === 'failed') {                             │  │
│  │   const parsedError = parseLimitError(                           │  │
│  │     data.tool_name,           // "generate_image"               │  │
│  │     data.error               // Contains "limit" keyword        │  │
│  │   );                                                             │  │
│  │                                                                  │  │
│  │   if (parsedError) {    // ✅ LIMIT ERROR DETECTED!             │  │
│  │     setLimitError(parsedError);                                 │  │
│  │     toast.error('Limit reached - Upgrade to continue!');        │  │
│  │   }                                                              │  │
│  │ }                                                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
                    ▼                  ▼
        ┌───────────────────┐  ┌──────────────────┐
        │ TOAST SHOWS UP!   │  │ STATE UPDATES    │
        │                   │  │ limitError = {   │
        │ 🔔 Top-Right      │  │   message: "..." │
        │ "Limit reached    │  │   action:        │
        │  Upgrade to       │  │   "upgrade"      │
        │  continue!"       │  │ }                │
        │                   │  │                  │
        │ (Auto-dismiss     │  │ Message stored   │
        │  in 4 seconds)    │  │ in metadata      │
        └───────────────────┘  └──────────────────┘
                    │                  │
                    └────────┬─────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              FRONTEND: ChatInterface Render (Line 670)                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ✅ NEW CODE:                                                      │  │
│  │ {limitError && (                                                  │  │
│  │   <LimitNotification                                              │  │
│  │     error={limitError}                                            │  │
│  │     onClose={() => setLimitError(null)}                           │  │
│  │     onUpgrade={() =>                                              │  │
│  │       window.location.href = '/subscription/pricing'              │  │
│  │     }                                                              │  │
│  │   />                                                               │  │
│  │ )}                                                                │  │
│  │                                                                   │  │
│  │ RENDERS:                                                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
    ┌────────────────────────────────────────────┐
    │  📊 LIMIT NOTIFICATION CARD APPEARS        │
    │  ┌──────────────────────────────────────┐  │
    │  │ ⚠️ Upgrade Required                │  │
    │  │                                      │  │
    │  │ Daily image generation limit reached │  │
    │  │ Upgrade to generate more images!     │  │
    │  │                                      │  │
    │  │ Current Plan: Free                   │  │
    │  │ Resets: Tomorrow at 12:00 AM         │  │
    │  │                                      │  │
    │  │ ┌────────────────────────────────┐  │  │
    │  │ │ 💪 Upgrade Now      │ Dismiss │  │  │
    │  │ └────────────────────────────────┘  │  │
    │  └──────────────────────────────────────┘  │
    └────────────────────────────────────────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
                    ▼                  ▼
        ┌──────────────────────┐  ┌──────────────────┐
        │  USER CLICKS         │  │  USER CLICKS     │
        │  "Upgrade Now"       │  │  "Dismiss"       │
        │                      │  │                  │
        │  Navigate to pricing │  │  Close card      │
        │  /subscription/      │  │  setLimitError   │
        │  pricing             │  │  (null)          │
        │                      │  │                  │
        │  User sees plans     │  │  Continue chat   │
        │  ↓                   │  │  Try again later │
        │  Upgrades to Pro     │  │                  │
        │  ↓                   │  │                  │
        │  Redirects back      │  │                  │
        │  ↓                   │  │                  │
        │  Can generate more!  │  │                  │
        │  🎉                  │  │                  │
        └──────────────────────┘  └──────────────────┘
```

---

## Code Flow Details

### Step 1: Backend Sends Failed Status
```php
// GrokApiService.php - executeTool()
case 'generate_image':
    $cacheKey = "user_{$user_id}_image_generations_daily";
    $newCount = Cache::get($cacheKey, 0) + 1;
    
    if ($newCount > $dailyLimit) {
        // ✅ SENDS: tool_status = "failed"
        throw new \Exception("Daily image generation limit reached (1 images per day)");
    }
```

### Step 2: Stream SSE With Failed Status
```php
// GrokApiService.php - processStreamingResponse()
$callback([
    'tool_status' => 'failed',
    'tool_name' => 'generate_image',
    'error' => 'Daily image generation limit reached (1 images per day)'
], false);
```

### Step 3: Frontend Detects & Parses
```tsx
// ChatInterface.tsx - SSE listener
const parseLimitError = (toolName: string, errorMessage: string) => {
    // Check if error contains limit keywords
    const isLimitError = errorMessage.toLowerCase().includes('limit') || 
                        errorMessage.toLowerCase().includes('exceeded') ||
                        errorMessage.toLowerCase().includes('quota');
    
    if (!isLimitError) return null;  // Generic error
    
    // Parse reset type
    const isDaily = errorMessage.toLowerCase().includes('daily');
    const resetType = isDaily ? 'daily' : 'monthly';
    
    // Create user-friendly message
    return {
        message: 'Daily image generation limit reached. Upgrade to generate more images!',
        action: 'upgrade',
        type: toolName,
        reset_type: resetType,
    };
};
```

### Step 4: Set State & Show Toast
```tsx
// ChatInterface.tsx - SSE handler
if (data.tool_status === 'failed') {
    const parsedError = parseLimitError(data.tool_name, data.error);
    if (parsedError) {
        setLimitError(parsedError);  // ← Triggers re-render
        
        // Show toast notification
        toast.error('Limit reached - Upgrade to continue!', {
            duration: 4000,
            position: 'top-right',
        });
    }
}
```

### Step 5: Store Error in Message Metadata
```tsx
// ChatInterface.tsx - Message metadata
if (data.tool_status === 'failed' && data.error) {
    lastMessage.metadata.tool_error = data.error;
}
```

### Step 6: Message Component Shows Error Card
```tsx
// Message.tsx - renderContent()
if (message.metadata?.tool_status === 'failed' && message.metadata?.tool_error) {
    const toolEmojis = {
        'generate_image': '🎨',
        'web_search': '🔍',
        'web_fetch': '📄'
    };
    
    return (
        <Card className="bg-red-50 border-red-200">
            <CardContent>
                <div className="flex items-start gap-3">
                    <div className="text-2xl">{toolEmojis[toolName]}</div>
                    <div>
                        <p className="font-medium text-red-700">Tool Failed</p>
                        <p className="text-sm text-red-600">{errorMessage}</p>
                        <p className="text-xs text-red-500 capitalize">
                            {toolName.replace('_', ' ')} tool
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
```

### Step 7: Render LimitNotification
```tsx
// ChatInterface.tsx - render()
{limitError && (
    <LimitNotification
        error={limitError}
        onClose={() => setLimitError(null)}
        onUpgrade={() => {
            window.location.href = '/subscription/pricing';
        }}
    />
)}
```

### Step 8: User Interaction
```tsx
// LimitNotification.tsx - Button handlers
const handleAction = () => {
    if (isUpgradeAction && onUpgrade) {
        onUpgrade();  // Navigate to pricing
    }
};

// Return
<Button onClick={handleAction} className="w-full">
    <Zap className="w-4 h-4" />
    Upgrade My Plan
</Button>
```

---

## Data Flow: Before vs After

### ❌ BEFORE (Problem)
```
Tool Failed
    ↓
Backend exception thrown
    ↓
No tool_status: "failed" sent
    ↓
Frontend receives generic response
    ↓
Assistant shows confusing message:
"I'm sorry, but I've hit my daily limit..."
    ↓
User confused: "Where do I upgrade?"
    ↓
User searches for link in UI
    ↓
No obvious path to upgrade
```

### ✅ AFTER (Solution)
```
Tool Failed
    ↓
Backend sends tool_status: "failed"
    ↓
Frontend detects "limit" in error
    ↓
Calls parseLimitError()
    ↓
setLimitError() updates state
    ↓
Toast notification appears (4 sec)
    ↓
LimitNotification card renders
    ↓
User sees upgrade button
    ↓
Clicks "Upgrade Now"
    ↓
Navigates to pricing page
    ↓
User upgrades plan
    ↓
PROBLEM SOLVED! 🎉
```

---

## State Management Flow

```
Initial State:
{
  limitError: null,
  error: null,
  messages: [],
  isLoading: true
}

User sends message:
  ↓ setLimitError(null)
  ↓ setError(null)
  ↓

Backend responds with tool_status: "failed":
  ↓ parseLimitError() → returns error object
  ↓ setLimitError({ message: "...", action: "upgrade" })
  ↓

State updates to:
{
  limitError: {
    message: "Daily image generation limit...",
    action: "upgrade",
    type: "generate_image",
    reset_type: "daily"
  },
  error: null,
  messages: [
    {
      role: "assistant",
      metadata: {
        tool_status: "failed",
        tool_error: "Daily image generation limit reached..."
      }
    }
  ],
  isLoading: false
}

Component re-renders:
  ↓ Renders LimitNotification (because limitError !== null)
  ↓ Renders error card in Message (because metadata.tool_status === "failed")
  ↓

User clicks "Upgrade Now":
  ↓ onUpgrade() called
  ↓ window.location.href = '/subscription/pricing'
  ↓

Or user clicks "Dismiss":
  ↓ onClose() called
  ↓ setLimitError(null)
  ↓ LimitNotification disappears
  ↓
```

---

## Error Detection Logic

```
Error Message from Backend:
"Daily image generation limit reached (1 images per day)"

                    ↓

Parse with parseLimitError():
├─ Tool: "generate_image"
└─ Error: "Daily image generation limit reached..."

                    ↓

Check keywords (case-insensitive):
├─ Contains "limit"? ✓ YES
├─ Contains "exceeded"? ✗ no
└─ Contains "quota"? ✗ no

                    ↓

Is Limit Error? YES → Show upgrade
                ↓
Parse reset type:
├─ Contains "daily"? ✓ YES → reset_type: "daily"
└─ Contains "monthly"? ✗ no

                    ↓

Generate Message:
"Daily image generation limit reached. Upgrade to generate more images!"

                    ↓

Return:
{
  message: "Daily image generation limit reached...",
  action: "upgrade",
  type: "generate_image",
  reset_type: "daily"
}
```

---

## Component Render Tree

```
<ChatInterface>
  ├─ <FeedBackForm />
  ├─ <div className="relative mx-auto...">
  │  ├─ {limitError && <LimitNotification />}  ← ✅ NEW!
  │  ├─ {error && <Alert />}
  │  ├─ <div className="space-y-1">
  │  │  └─ {messages.map(message => (
  │  │     <Message>
  │  │       ├─ <Avatar />
  │  │       ├─ renderContent()
  │  │       │  ├─ [if tool failed] → Tool Error Card  ← ✅ NEW!
  │  │       │  ├─ [if tool executing] → Loading Card
  │  │       │  ├─ [if image] → Image Grid
  │  │       │  └─ [if text] → MarkdownMessage
  │  │       └─ Action Buttons
  │  │     ))}
  │  ├─ {isLoading && <Loading Indicator />}
  │  └─ <div ref={messagesEndRef} />
  └─ <ChatInput />
```

---

**Flow Created**: 2024  
**Status**: Complete ✅  
**Visual Complexity**: Medium  
**User Impact**: High (much better UX!)
