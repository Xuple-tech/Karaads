import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
// 1. Define the shape of your context value
interface LanguageContextType {
    lang: string;
    changeLanguage: (newLanguage: string) => Promise<void>;
    getLanguageForSpeech: (code: string) => string;
}

// Create the context with a default undefined value (it will be provided by the Provider)
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * 2. LanguageProvider Component:
 * This component will manage the global language state and provide it to its children.
 * It should wrap the root of your application or the part of the tree that needs language access.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
    // Initialize language state from Inertia.js props, defaulting to 'Eng' if not set.
    const initialLanguage = usePage().props.auth.user?.language ?? 'Eng';
    const [lang, setLang] = useState(initialLanguage);

    /**
     * Changes the current language and saves the preference to the server.
     * Uses useCallback to memoize the function, preventing unnecessary re-renders.
     * @param {string} newLanguage - The new language code (e.g., 'HAUSA', 'YORUBA', 'ENGLISH').
     */
    const changeLanguage = useCallback(async (newLanguage: string) => {
        setLang(newLanguage); // Optimistically update the UI

        try {
            const response = await axios.post('/user/setting/language', {
                language: newLanguage,
                h: window.crypto.randomUUID(),
            });

            if (response.status === 200) {
                toast.success(`Language preference updated to ${newLanguage} successfully! 🎉`);
            } else {
                toast.error(`Failed to update language preference to ${newLanguage}. Please try again.`);
                // Consider reverting setLang(initialLanguage) here if the save truly failed
            }
        } catch (error) {
            console.error("Error saving language preference:", error);
            toast.error('An unexpected error occurred while saving language preference. Please check your connection.');
            // Consider reverting setLang(initialLanguage) here on network error
        }
    }, []); // Dependencies for changeLanguage are empty, as it only depends on setLang which is stable

    /**
     * Returns the appropriate BCP 47 language tag for speech synthesis.
     * Uses useCallback to memoize the function.
     * @param {string} code - The language code (e.g., 'HAUSA', 'IGBO', 'YORUBA', 'ENGLISH').
     * @returns {string} The BCP 47 language tag.
     */
    const getLanguageForSpeech = useCallback((code: string): string => {
        const normalizedCode = code.toUpperCase();
        switch (normalizedCode) {
            case 'HAUSA':
                return 'ha-NG';
            case 'IGBO':
                return 'ig-NG';
            case 'YORUBA':
                return 'yo-NG';
            case 'ENGLISH':
                return 'en-US';
            default:
                return 'en-NG';
        }
    }, []); // Dependencies for getLanguageForSpeech are empty, as it's a pure function

    // The value provided to consumers of this context
    const contextValue = {
        lang,
        changeLanguage,
        getLanguageForSpeech,
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * 3. Updated useLang Hook:
 * This hook now consumes the LanguageContext, providing access to the shared state and functions.
 */
export function useLang() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLang must be used within a LanguageProvider');
    }
    return context;
}
