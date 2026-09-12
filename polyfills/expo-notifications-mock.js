/**
 * Mock for expo-notifications on web platform
 * Prevents the actual module from being loaded and causing localStorage errors
 */

// Check if we're in a web bundling environment
const isWeb =
  typeof window !== "undefined" ||
  (process && process.env && process.env.EXPO_PUBLIC_PLATFORM === "web");

if (isWeb) {
  // Create a mock module
  const mockNotifications = {
    // Mock methods
    setNotificationHandler: () => {},
    getPermissionsAsync: async () => ({ status: "granted" }),
    requestPermissionsAsync: async () => ({ status: "granted" }),
    getExpoPushTokenAsync: async () => ({ data: "mock-push-token" }),
    scheduleNotificationAsync: async () => {},
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
    setNotificationChannelAsync: async () => {},
    AndroidImportance: {
      DEFAULT: 3,
      HIGH: 4,
      MAX: 5,
    },
    // Add other exports as needed
  };

  // Override the require cache for expo-notifications
  if (typeof require !== "undefined" && require.cache) {
    require.cache["expo-notifications"] = {
      exports: mockNotifications,
    };
  }

  // Also provide the mock as a global for ES modules
  if (typeof module !== "undefined") {
    module.exports = mockNotifications;
  }
}
