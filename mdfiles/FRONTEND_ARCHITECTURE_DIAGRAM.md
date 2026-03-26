# Frontend Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Rhea Application                            │
│                     Role-Based Frontend                             │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────────────┐
                              │      Authentication          │
                              │     (Laravel Sanctum)        │
                              └──────────────────┬───────────┘
                                                 │
                ┌────────────────────────────────┼────────────────────────────────┐
                │                                │                                │
                ▼                                ▼                                ▼
        ┌──────────────┐                ┌──────────────┐                ┌──────────────┐
        │  User Role   │                │ SaaS Owner   │                │  Tech Staff  │
        │  (Regular    │                │  Role        │                │  Role        │
        │   Users)     │                │ (Instance    │                │ (System      │
        │              │                │  Managers)   │                │  Admin)      │
        └──────┬───────┘                └──────┬───────┘                └──────┬───────┘
               │                               │                               │
        ┌──────▼──────────┐           ┌────────▼────────┐           ┌─────────▼────────┐
        │ UserLayout      │           │ SaasOwnerLayout │           │ StaffLayout      │
        │ (5 nav items)   │           │ (6 nav items)   │           │ (6 nav items)    │
        └──────┬──────────┘           └────────┬────────┘           └─────────┬────────┘
               │                               │                               │
        ┌──────┴──────────────────────┬────────┴────────────────────┬─────────┴─────────┐
        │                             │                            │                   │
        ▼                             ▼                            ▼                   ▼
   ┌─────────────┐             ┌──────────────┐           ┌────────────────┐    ┌─────────┐
   │ Dashboard   │             │ Dashboard    │           │ Monitoring     │    │ Health  │
   │ (Stats +    │             │ (Analytics + │           │ (System +      │    │ (CPU,   │
   │  Recent)    │             │  Team)       │           │  API)          │    │ Memory) │
   └─────────────┘             └──────────────┘           └────────────────┘    └─────────┘
        │                             │                            │
        ├─────────────────┐      ├────┴────────────┐       ├──────┴──────────┐
        │                 │      │                 │       │                 │
        ▼                 ▼      ▼                 ▼       ▼                 ▼
   ┌──────────┐      ┌────────┐ ┌──────────┐ ┌──────┐ ┌────────────┐    ┌─────┐
   │Settings  │      │Team    │ │Analytics │ │Logs  │ │API Perf    │    │Prompts
   │(Account) │      │Members │ │(Detailed)│ │      │ │(Charts)    │    │(CRUD)
   └──────────┘      └────────┘ └──────────┘ └──────┘ └────────────┘    └─────┘
        │                 │
        └─────────┬───────┘
                  │
        ┌─────────▼────────┐
        │ Help             │
        │ (FAQ, Docs)      │
        └──────────────────┘
```

---

## Page Hierarchy

```
User Role
├── 📊 Dashboard
│   ├── Stats Cards (4)
│   ├── Features List
│   ├── Recent Conversations
│   └── Quick Actions
├── 💬 Conversations
│   ├── Search Bar
│   ├── Pagination
│   └── Delete Actions
├── ⚙️ Settings
│   ├── Account Form
│   ├── Preferences
│   └── Danger Zone
└── ❓ Help
    ├── Features Overview
    ├── Getting Started
    ├── FAQ
    └── Support Contact

SaaS Owner Role
├── 📊 Dashboard
│   ├── KPI Cards (4)
│   ├── Usage Progress
│   ├── Trends Chart
│   ├── Performance Chart
│   ├── Team Preview
│   └── Quick Actions
├── 👥 Team Members
│   ├── Team Stats
│   ├── Members Directory
│   └── Role Guide
├── ✍️ Custom Prompts
│   ├── Categories
│   ├── Prompt List
│   └── Copy/Edit/Delete
├── 📈 Analytics (planned)
├── 💳 Billing (planned)
└── ⚙️ Settings (planned)

Tech Staff Role
├── 📊 Monitoring
│   ├── Critical Alerts
│   ├── Health Metrics
│   ├── Performance Data
│   └── Recent Errors
├── 💚 Health
│   ├── Overall Status
│   ├── Resource Usage
│   ├── Uptime %
│   └── Health Checks
├── ⚡ API Performance
│   ├── Performance Cards
│   ├── Trend Chart
│   ├── Request Volume
│   └── Alerts
├── 🔴 Error Logs
│   ├── Search & Filter
│   ├── Error List
│   ├── Stack Traces
│   └── Export
├── 🔒 Security (planned)
└── ⚙️ Settings (planned)
```

---

## Data Flow

```
┌─────────────┐
│  Laravel    │
│ Controllers │
└──────┬──────┘
       │
       ├─► UserController::dashboard()
       │   └─► Returns: stats, recentConversations
       │
       ├─► SaasOwnerController::dashboard()
       │   └─► Returns: instanceSettings, stats, teamMembers
       │
       └─► StaffController::monitoring()
           └─► Returns: systemHealth, apiPerformance, recentErrors

       │
       ▼
┌─────────────────┐
│ Inertia Props   │
│ (TypeScript)    │
└────────┬────────┘
         │
         ├─► User Dashboard Props
         ├─► SaaS Owner Dashboard Props
         └─► Staff Monitoring Props

         │
         ▼
┌─────────────────┐
│ React Pages     │
└────────┬────────┘
         │
         ├─► UserLayout + Dashboard
         ├─► SaasOwnerLayout + Dashboard
         └─► StaffLayout + Monitoring

         │
         ▼
┌──────────────────┐
│ Browser Render   │
│ (HTML + CSS)     │
└──────────────────┘
```

---

## Component Tree

```
App (Root)
│
├─ User Routes (auth:user)
│  └─ UserLayout
│     ├─ Dashboard
│     ├─ Settings
│     ├─ Conversations
│     └─ Help
│
├─ SaaS Owner Routes (auth:saas_owner)
│  └─ SaasOwnerLayout
│     ├─ Dashboard
│     ├─ TeamMembers
│     ├─ Prompts
│     ├─ Analytics
│     ├─ Billing
│     └─ Settings
│
└─ Staff Routes (auth:staff)
   └─ StaffLayout
      ├─ Monitoring
      ├─ Health
      ├─ ApiPerformance
      ├─ Logs
      ├─ Security
      └─ Settings
```

---

## Shared Components

```
┌────────────────────────────────────────┐
│      UI Component Library              │
│      (Shadcn UI + Recharts)            │
└────────────────────────────────────────┘

Shadcn UI:
├─ Card (CardHeader, CardContent, CardDescription, CardTitle)
├─ Button (default, outline, destructive)
├─ Input (text, email, password)
├─ Label (form labels)
└─ Textarea (multi-line text)

Recharts:
├─ LineChart (performance trends)
├─ BarChart (request volume)
├─ AreaChart (usage trends)
├─ XAxis, YAxis
├─ CartesianGrid
├─ Tooltip
└─ Legend

Lucide Icons:
├─ Dashboard icons (📊)
├─ User icons (👥, 🧑)
├─ Settings icons (⚙️)
├─ Status icons (🟢, 🔴, ⚠️)
└─ Action icons (✏️, 🗑️, 📋)
```

---

## File Size Overview

```
Layouts:          ~250 lines
├─ UserLayout:    ~68 lines
├─ SaasOwnerLayout: ~96 lines
└─ StaffLayout:   ~83 lines

Pages:           ~1,850 lines
├─ User Pages:   ~452 lines
├─ SaaS Pages:   ~410 lines
└─ Staff Pages:  ~811 lines

Documentation:   ~1,000 lines
├─ FRONTEND_STRUCTURE.md: ~400 lines
├─ FRONTEND_FILES_REFERENCE.md: ~350 lines
└─ FRONTEND_IMPLEMENTATION_COMPLETE.md: ~350 lines

TOTAL:           ~3,100 lines of code + docs
```

---

## Navigation Structure

```
┌────────────────────────────────────────┐
│          Sidebar Navigation            │
└────────────────────────────────────────┘

Desktop:
┌─────────────┐
│   Logo      │
│ UserLayout  │ (fixed left)
│             │
│ • Dashboard │
│ • Settings  │
│ • Help      │
│             │
│  [User Info]│
└─────────────┼─────────────────────────┐
              │  Main Content Area      │
              │  (scales with nav)      │
              │                         │
              │  Page Content Here      │
              │                         │
              └─────────────────────────┘

Mobile:
┌──────────────────────────────┐
│ ☰ Menu  |  Title  |  Profile │
├──────────────────────────────┤
│                              │
│   Page Content               │
│                              │
│                              │
└──────────────────────────────┘

(Menu expands to full screen on mobile)
```

---

## State Management

```
Page Component
├─ useState: form state (if needed)
├─ useForm: Inertia form handling
├─ usePage: access to props
└─ useEffect: side effects (if needed)

Example (Settings Page):
┌─────────────────────┐
│ form state          │
│ ├─ name             │
│ ├─ email            │
│ ├─ theme            │
│ └─ notifications    │
└─────────────────────┘
        │
        ├─ onChange → setData
        ├─ Submit → post()
        └─ Processing → disabled UI
```

---

## Routing Matrix

```
URL                          | Component         | Layout            | Auth
─────────────────────────────┼──────────────────┼──────────────────┼──────────
/user/dashboard              | Dashboard        | UserLayout       | user
/user/conversations          | Conversations    | UserLayout       | user
/user/settings               | Settings         | UserLayout       | user
/user/help                   | Help             | UserLayout       | user
/saas-owner/dashboard        | Dashboard        | SaasOwnerLayout  | saas
/saas-owner/team-members     | TeamMembers      | SaasOwnerLayout  | saas
/saas-owner/prompts          | Prompts          | SaasOwnerLayout  | saas
/staff/monitoring            | Monitoring       | StaffLayout      | staff
/staff/health                | Health           | StaffLayout      | staff
/staff/api-performance       | ApiPerformance   | StaffLayout      | staff
/staff/logs                  | Logs             | StaffLayout      | staff
```

---

## Key Features by Page

```
Dashboard Pages:
✓ KPI Cards with real-time data
✓ Charts showing trends
✓ Recent/upcoming items
✓ Quick action buttons

List Pages:
✓ Search functionality
✓ Pagination (if large dataset)
✓ Filter/sort options
✓ Action buttons (edit, delete)
✓ Empty state messages

Settings Pages:
✓ Form with validation
✓ Save/cancel buttons
✓ Success feedback
✓ Error messages

Analytics Pages:
✓ Multiple chart types
✓ Date range selection
✓ Export functionality
✓ Alert thresholds
```

---

## Responsive Breakpoints

```
Mobile (< 768px):
├─ Single column layout
├─ Hamburger navigation
├─ Touch-friendly buttons
├─ Stacked cards
└─ Full-width forms

Tablet (768px - 1024px):
├─ Sidebar visible
├─ 2-column grid layouts
├─ Medium card sizes
└─ Optimized spacing

Desktop (> 1024px):
├─ Fixed sidebar
├─ Multi-column grids
├─ Full charts
└─ Optimal spacing
```

---

## Performance Considerations

```
Code Splitting:
├─ UserLayout (users)
├─ SaasOwnerLayout (instances)
└─ StaffLayout (admin)

Lazy Loading:
├─ Charts render only when visible
├─ Heavy lists use pagination
└─ Modals load on demand

Caching:
├─ Props cached by Inertia
├─ Navigation cached
└─ Component memoization
```

---

## Testing Checklist

```
✓ Responsive Design
  ├─ Mobile (375px)
  ├─ Tablet (768px)
  └─ Desktop (1920px)

✓ Functionality
  ├─ Navigation works
  ├─ Forms submit
  ├─ Search filters
  ├─ Pagination works
  └─ Delete confirms

✓ Accessibility
  ├─ Keyboard navigation
  ├─ ARIA labels
  ├─ Color contrast
  └─ Screen reader

✓ Performance
  ├─ Load time < 2s
  ├─ Charts render smooth
  ├─ Pagination instant
  └─ No memory leaks
```

This comprehensive diagram shows the complete role-based frontend architecture!
