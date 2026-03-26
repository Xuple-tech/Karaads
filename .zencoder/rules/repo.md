---
description: Repository Information Overview
alwaysApply: true
---

# Rhea AI Application

## Summary
A full-stack Laravel 12 and React 19 application with TypeScript integration, featuring AI-powered chat capabilities via GROK Cloud API. The application includes multilingual support (English, Hausa, Yoruba, Igbo), modern UI with Shadcn/UI components, and streaming chat with tool calling support. Built with Inertia.js for seamless server-side rendering.

## Structure
**Backend** (/app, /routes, /config, /database): Laravel 12 framework with service architecture, including OllamaCloudService for AI integration, authentication, and database migrations.

**Frontend** (/resources/js, /resources/css, /resources/views): React 19 with TypeScript, Inertia.js for SSR, Radix UI for accessible components, Tailwind CSS for styling, and Monaco Editor for code display.

**Configuration**: Vite build tool with Laravel plugin, PHPUnit/Pest for testing, ESLint/Prettier for code quality.

## Language & Runtime
**Backend Language**: PHP ^8.2
**Backend Framework**: Laravel Framework ^12.0
**Frontend Language**: TypeScript 5.7.2, React 19.0.0
**Build System**: Vite 6.0
**Node.js**: Required for frontend build tooling
**Package Manager**: Composer (PHP), npm (Node.js)

## Dependencies

### Backend (PHP)
**Core Framework**:
- laravel/framework ^12.0
- inertiajs/inertia-laravel ^2.0 (Server-side rendering)
- tightenco/ziggy ^2.4 (URL generation)

**Utilities**:
- laravel/tinker ^2.10.1 (REPL)
- guzzlehttp/guzzle (HTTP client for Ollama API)
- firebase/php-jwt (JWT handling)

**Development**:
- pestphp/pest ^3.8, pestphp/pest-plugin-laravel ^3.2 (Testing)
- laravel/pint ^1.18 (Code formatting)
- laravel/sail ^1.41 (Docker development)
- mockery/mockery ^1.6, fakerphp/faker ^1.23

### Frontend (JavaScript/TypeScript)
**Core**:
- react ^19.0.0, react-dom ^19.0.0
- @inertiajs/react ^2.0.0
- typescript ^5.7.2
- tailwindcss ^4.0.0, @tailwindcss/vite ^4.0.6

**UI & Components**:
- @radix-ui/react-* (Accessible UI primitives)
- @shadcn/ui ^0.0.4 (Component library)
- lucide-react ^0.475.0 (Icons)
- react-hot-toast ^2.5.2 (Notifications)

**Markdown & Display**:
- react-markdown ^10.1.0, remark-gfm ^4.0.1
- react-katex ^3.1.0 (LaTeX rendering)
- react-syntax-highlighter ^15.6.1 (Code highlighting)
- @monaco-editor/react ^4.7.0 (Code editor)

**Utilities**:
- axios ^1.13.2 (HTTP requests)
- zustand ^5.0.8 (State management)
- dompurify ^3.2.6 (HTML sanitization)
- recharts ^2.15.3 (Charting)

**Development**:
- eslint ^9.17.0, prettier ^3.4.2
- @vitejs/plugin-react ^4.3.4
- vite ^6.0

## Build & Installation

### Backend Setup
`ash
# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate

# Start development server
php artisan serve

# Queue listener (if needed)
php artisan queue:listen --tries=1
`

### Frontend Setup
`ash
# Install Node dependencies
npm install

# Development with hot reload
npm run dev

# Production build
npm run build

# SSR build
npm run build:ssr

# Code quality
npm run lint
npm run format
npm run types
`

### Concurrent Development
`ash
# Run both Laravel server and Vite dev server with queue listener
composer run dev

# With SSR enabled
composer run dev:ssr
`

## Main Files & Entry Points
**Backend Entry**: 
outes/web.php, 
outes/api.php, 
outes/console.php - Route definitions
**AI Service**: pp/Services/OllamaCloudService.php - Ollama Cloud API integration with streaming, tool calling, and multilingual support
**Frontend Entry**: 
esources/js/app.tsx - Main React application component
**SSR Entry**: 
esources/js/ssr.tsx - Server-side rendering entry point
**Blade Template**: 
esources/views/app.blade.php - HTML template

## Testing
**Framework**: Pest PHP with Laravel plugin
**Test Directories**: 	ests/Unit/, 	ests/Feature/
**Configuration**: phpunit.xml
**Test Database**: SQLite in-memory
**Run Tests**:
`ash
composer test
`

**Pest Configuration**: Uses Laravel plugin for database transactions and assertions. Tests include Feature and Unit test suites with automatic database reset.

## Docker
Uses Laravel Sail for containerized development. Docker runtime images located at endor/laravel/sail/runtimes/8.{2,3,4}/Dockerfile. Database and Redis services can be configured via .env and Docker Compose through Sail commands.

