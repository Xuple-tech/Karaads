/**
 * Application bootstrapping and initialization
 * Configure global dependencies and utilities
 */

// Declare global Echo and Pusher for TypeScript
declare global {
    interface Window {
        Echo?: any;
        Pusher?: any;
    }
}

// Bootstrap placeholder - Laravel Echo will be initialized when needed
// This prevents TypeScript errors while packages are being installed

export {};
