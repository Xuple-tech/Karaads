/**
 * Polyfill for localStorage in Node.js environment
 * This fixes the issue where Expo CLI creates a localStorage object without proper API methods
 * when running with --localstorage-file flag
 * 
 * This polyfill MUST run before any other module imports
 */

// Immediately execute to patch localStorage before any imports
(function() {
  // Check if we're in a Node.js-like environment
  const isNode = typeof window === 'undefined' || (window && typeof window.setImmediate === 'function');
  
  if (isNode && typeof localStorage === 'object' && localStorage) {
    // Check if localStorage exists but lacks proper methods
    const needsPatch = !localStorage.getItem || !localStorage.setItem || !localStorage.removeItem || !localStorage.clear;
    
    if (needsPatch) {
      console.log('[Polyfill] localStorage needs patching in Node.js environment');
      
      // Try to patch methods if they're missing
      try {
        // Create a simple in-memory store
        const store = {};
        
        // Only add methods if they don't exist
        if (!localStorage.getItem) {
          localStorage.getItem = function(key) {
            return store[key] || null;
          };
        }
        
        if (!localStorage.setItem) {
          localStorage.setItem = function(key, value) {
            store[key] = String(value);
          };
        }
        
        if (!localStorage.removeItem) {
          localStorage.removeItem = function(key) {
            delete store[key];
          };
        }
        
        if (!localStorage.clear) {
          localStorage.clear = function() {
            Object.keys(store).forEach(key => {
              delete store[key];
            });
          };
        }
        
        // Add length property if needed
        if (!localStorage.length) {
          Object.defineProperty(localStorage, 'length', {
            get: function() { return Object.keys(store).length; },
            enumerable: false,
            configurable: false
          });
        }
        
        // Add key method if needed
        if (!localStorage.key) {
          localStorage.key = function(index) {
            const keys = Object.keys(store);
            return index >= 0 && index < keys.length ? keys[index] : null;
          };
        }
        
        console.log('[Polyfill] localStorage methods added for Node.js environment');
      } catch (error) {
        console.warn('[Polyfill] Failed to patch localStorage:', error.message);
        
        // If we can't patch localStorage, create a global mock
        // This is a last resort for when localStorage is a frozen proxy
        if (typeof global !== 'undefined') {
          global.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            length: 0,
            key: () => null,
          };
          console.log('[Polyfill] Created global localStorage mock');
        }
      }
    }
  }
})();

// Export nothing to avoid interfering with module system
export {};
