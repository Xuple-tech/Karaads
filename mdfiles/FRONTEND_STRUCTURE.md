# Frontend Role-Specific Structure Guide

## Overview

This document describes the role-specific frontend architecture for the Rhea application. Each user role has dedicated components, pages, and layouts to ensure separation of concerns and tailored user experiences.

---

## Directory Structure

```
resources/js/
├── layouts/
│   ├── UserLayout.tsx          # Standard user dashboard layout
│   ├── SaasOwnerLayout.tsx      # SaaS owner management layout
│   └── StaffLayout.tsx          # Tech staff monitoring layout
│
└── pages/
    ├── User/                    # Regular user role
    │   ├── Dashboard.tsx        # User home page with stats
    │   ├── Settings.tsx         # User preferences & account
    │   ├── Conversations.tsx    # Chat history management
    │   └── Help.tsx             # Help & documentation
    │
    ├── SaasOwner/              # SaaS instance owner role
    │   ├── Dashboard.tsx        # Instance analytics dashboard
    │   ├── TeamMembers.tsx      # Team management
    │   ├── Prompts.tsx          # Custom prompt management
    │   ├── Analytics.tsx        # Detailed usage analytics
    │   ├── Billing.tsx          # Subscription & billing
    │   └── Settings.tsx         # Instance configuration
    │
    └── Staff/                  # Tech staff role
        ├── Monitoring.tsx       # System & API monitoring
        ├── Health.tsx           # System health dashboard
        ├── ApiPerformance.tsx   # API performance metrics
        ├── Logs.tsx             # Error log viewer
        └── Settings.tsx         # Staff preferences
```

---

## Role-Specific Features

### 1. User Role (Standard Users)

**Purpose**: End-users who interact with the chat interface and manage their own data.

**Pages**:

#### Dashboard (`/user/dashboard`)
- **Stats**: Total conversations, messages, current month usage, API calls remaining
- **Features**: Enabled features display (Grok AI, Image Generation, Voice Chat)
- **Recent Conversations**: Quick access to last conversations
- **Quick Actions**: New chat, settings, help

#### Settings (`/user/settings`)
- **Account Information**: Name and email management
- **Preferences**: Theme selection, notification toggles
- **Usage Information**: Usage tracking display
- **Danger Zone**: Account deletion

#### Conversations (`/user/conversations`)
- **Search**: Find conversations by title
- **List**: Paginated conversation list with preview
- **Delete**: Remove individual conversations
- **Navigation**: Link to chat interface

#### Help (`/user/help`)
- **Features Overview**: Key features explained
- **Getting Started**: 4-step onboarding guide
- **FAQ**: Frequently asked questions with collapsible details
- **Support Contact**: Link to support team

**Layout** (`UserLayout.tsx`):
- Sidebar with navigation (hidden on mobile)
- User info section at bottom
- Responsive design with hamburger menu

---

### 2. SaaS Owner Role (Instance Managers)

**Purpose**: Manage SaaS instances, teams, billing, and instance-wide analytics.

**Pages**:

#### Dashboard (`/saas-owner/dashboard`)
- **KPI Cards**: Total messages, users, team members, subscription status
- **Usage Progress**: Monthly message usage with warning thresholds
- **Usage Trends**: Area chart showing message activity over time
- **Response Times**: Bar chart showing API latency
- **Top Features**: Feature usage breakdown
- **Team Members**: Quick team overview
- **Quick Actions**: Team management, analytics, settings

#### Team Members (`/saas-owner/team-members`)
- **Statistics**: Count of admins, managers, members
- **Members List**: Full team directory with roles
- **Actions**: Edit, delete, invite new members
- **Role Permissions Guide**: Visual guide to role capabilities
- **Role Hierarchy**:
  - **Admin**: Full access (team, analytics, prompts, billing)
  - **Manager**: Content creation (analytics, prompts)
  - **Member**: User access only

#### Custom Prompts (`/saas-owner/prompts`)
- **Statistics**: Total, active, and usage count
- **Categories**: Browse prompts by category
- **Prompt List**: View, edit, delete, copy prompts
- **Usage Tracking**: See how many times each prompt is used
- **Quick Create**: Button to create new prompts

#### Analytics (`/saas-owner/analytics`)
- **Usage by Date Range**: Selectable periods (7d, 30d, 90d)
- **API Provider Breakdown**: Usage per provider (Grok, Gemini, etc.)
- **Top Features**: Most used capabilities
- **Response Time Distribution**: Latency percentiles
- **Cost Estimation**: Estimated API costs

#### Billing (`/saas-owner/billing`)
- **Subscription Info**: Current plan details
- **Usage Against Quota**: Progress bar for message limits
- **Upgrade Options**: Plan comparison
- **Invoice History**: Previous invoices
- **Payment Methods**: Saved payment information

#### Settings (`/saas-owner/settings`)
- **Instance Configuration**: Name, branding
- **Feature Toggles**: Enable/disable features per instance
- **API Keys**: Manage instance-specific keys
- **Webhooks**: Configure webhooks for events

**Layout** (`SaasOwnerLayout.tsx`):
- Sidebar with instance-specific navigation
- Focused on business/operations tasks
- Responsive mobile menu

---

### 3. Tech Staff Role (System Administrators)

**Purpose**: Monitor system health, troubleshoot issues, and manage infrastructure.

**Pages**:

#### Monitoring (`/staff/monitoring`)
- **Critical Alerts**: Display critical issues at top
- **Health Metrics**: CPU, Memory, Error Rate, API Health
- **Response Time Percentiles**: Average, P95, P99
- **Performance Trends**: 24-hour performance chart
- **Recent Errors**: List of last 10 errors with details

#### System Health (`/staff/health`)
- **Overall Status Card**: Visual indicator (healthy/degraded/critical)
- **Resource Usage**: CPU, Memory, Disk with progress bars
- **API Uptime**: 30-day uptime percentage
- **Service Latencies**: Database query times
- **Health Checks History**: Pass/fail status of recent checks

#### API Performance (`/staff/api-performance`)
- **Performance Summary**: Average, P95, P99, error rate, total requests
- **Performance Alerts**: High error rate or latency warnings
- **Response Time Trends**: 24-hour line chart
- **Request Volume**: Requests and errors by hour (dual-axis bar chart)

#### Error Logs (`/staff/logs`)
- **Statistics**: Total errors (24h), critical count, warning count
- **Search & Filter**: Search messages, filter by severity
- **Log Details**: Expandable logs with full details
- **Export**: Download logs for analysis
- **Stack Traces**: Full error traces visible when expanded

#### Security (`/staff/security`)
- **Login Attempts**: Recent login activity
- **Suspicious Activity**: Failed login detection
- **API Key Activity**: API key usage and rotation
- **Audit Trail**: Administrative actions log

#### Settings (`/staff/settings`)
- **Alert Thresholds**: Configure warning levels
- **Notification Preferences**: Email/SMS alerts
- **Dashboard Refresh Rate**: Auto-refresh interval
- **Export Settings**: Log export options

**Layout** (`StaffLayout.tsx`):
- Technical dashboard appearance
- Sidebar with monitoring-focused navigation
- Real-time data emphasis

---

## Layout Components

### UserLayout.tsx
```tsx
Features:
- Fixed sidebar (desktop) / hamburger menu (mobile)
- User profile section
- Navigation items specific to user role
- Logout button
- Responsive max-width content

Props:
- children: React.ReactNode
```

### SaasOwnerLayout.tsx
```tsx
Features:
- Business-focused design
- Instance context awareness
- Business metrics emphasis
- Team collaboration features

Props:
- children: React.ReactNode
```

### StaffLayout.tsx
```tsx
Features:
- Technical dashboard appearance
- Real-time monitoring capability
- Alert emphasis
- System metrics focus

Props:
- children: React.ReactNode
```

---

## Shared Components Used

All role-specific pages use these common components from `@/components/ui/`:

- **Card**: Container for grouped content
- **Button**: Actions and navigation
- **Input**: Text and search input
- **Label**: Form labels
- **Textarea**: Multi-line text input

---

## Navigation Routes

### User Routes
```
GET  /user/dashboard          # Dashboard
GET  /user/settings           # Settings
GET  /user/conversations      # Conversations list
DELETE /user/conversations/:id # Delete conversation
GET  /user/help               # Help
POST /user/settings (update)  # Save settings
```

### SaaS Owner Routes
```
GET  /saas-owner/dashboard                    # Dashboard
GET  /saas-owner/team-members                 # Team list
POST /saas-owner/team-members                 # Invite member
PUT  /saas-owner/team-members/:id             # Update member
DELETE /saas-owner/team-members/:id           # Remove member
GET  /saas-owner/prompts                      # Prompts list
POST /saas-owner/prompts                      # Create prompt
PUT  /saas-owner/prompts/:id                  # Update prompt
DELETE /saas-owner/prompts/:id                # Delete prompt
GET  /saas-owner/analytics                    # Analytics
GET  /saas-owner/billing                      # Billing
GET  /saas-owner/settings                     # Settings
```

### Tech Staff Routes
```
GET  /staff/monitoring                 # Monitoring dashboard
GET  /staff/health                     # System health
GET  /staff/api-performance            # API performance
GET  /staff/logs                       # Error logs
GET  /staff/security                   # Security logs
GET  /staff/settings                   # Settings
```

---

## Data Flow

### Props Pattern
Each page receives role-specific props from controllers:

**User Dashboard Props**:
```typescript
{
  stats: {
    total_conversations: number;
    total_messages: number;
    current_month_usage: number;
    api_calls_remaining: number;
    feature_access: {...};
  };
  recentConversations: Array<{...}>;
}
```

**SaaS Owner Dashboard Props**:
```typescript
{
  instanceSettings: {...};
  stats: {...};
  teamMembers: Array<{...}>;
  responseTimeDistribution: Array<{...}>;
}
```

**Staff Monitoring Props**:
```typescript
{
  systemHealth: {...};
  apiPerformance: {...};
  recentErrors: Array<{...}>;
  performanceByHour: Array<{...}>;
}
```

---

## Charts Used

Using **Recharts** library for visualizations:

**User Pages**: None (kept simple)

**SaaS Owner Pages**:
- AreaChart: Usage trends
- BarChart: Response times
- LineChart: Performance trends

**Tech Staff Pages**:
- LineChart: Performance metrics over time
- BarChart: Request volume and errors

---

## Authentication & Authorization

Each layout component assumes the user is already authenticated. Authorization is handled by:

1. **Route Middleware**: Backend middleware checks role before rendering
2. **Component Guards**: Pages use helper functions to verify access
3. **Navigation Scope**: Each layout only shows navigation for their role

---

## Responsive Design

All pages are fully responsive:

- **Desktop**: Full sidebar visible, optimal spacing
- **Tablet**: Sidebar visible, responsive grid layouts
- **Mobile**: Hamburger menu, single column layouts, touch-friendly buttons

---

## Performance Considerations

1. **Lazy Loading**: Chart components load on page view
2. **Pagination**: List pages use pagination (10-20 items per page)
3. **Filtering**: Search/filter done client-side for fast response
4. **Data Prop Optimization**: Only necessary data passed to components

---

## Future Enhancements

1. **Dark Mode**: Add dark mode toggle in each layout
2. **Customizable Dashboard**: Drag-to-rearrange cards
3. **Export Functionality**: PDF export for reports
4. **Real-time Updates**: WebSocket for live metrics
5. **Internationalization**: Multi-language support
6. **Accessibility**: Enhanced ARIA labels and keyboard navigation

---

## Integration with Backend

Each page integrates with specific controllers:

**User Pages** → `UserController`
**SaaS Owner Pages** → `SaasOwnerController`
**Tech Staff Pages** → `StaffController`

See `MANAGEMENT_INTEGRATION_GUIDE.md` for controller implementation details.

