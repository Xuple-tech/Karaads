import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { apiRequest } from '@/spa/lib/api';
import { useSessionQuery } from '@/spa/lib/session';

type LangContextValue = {
    lang: string;
    changeLanguage: (language: string) => Promise<void>;
    getLanguageForSpeech: (code: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

const getLanguageForSpeech = (code: string): string => {
    switch (code.toUpperCase()) {
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
};

export function SpaLanguageProvider({ children }: { children: ReactNode }) {
    const session = useSessionQuery();
    const [lang, setLang] = useState('ENGLISH');

    const currentLang = (session.data?.user as { language?: string } | null)?.language;
    const effectiveLang = currentLang ?? lang;

    const changeLanguage = useCallback(async (language: string) => {
        setLang(language);
        await apiRequest('/user/setting/language', {
            method: 'POST',
            json: {
                language,
                h: window.crypto.randomUUID(),
            },
        });
    }, []);

    const value = useMemo(
        () => ({
            lang: effectiveLang,
            changeLanguage,
            getLanguageForSpeech,
        }),
        [changeLanguage, effectiveLang],
    );

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useSpaLang() {
    const context = useContext(LangContext);

    if (!context) {
        throw new Error('useSpaLang must be used within SpaLanguageProvider');
    }

    return context;
}
