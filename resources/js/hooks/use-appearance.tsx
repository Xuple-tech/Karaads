import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const APPEARANCE_KEY = 'appearance';
const APPEARANCE_EVENT = 'appearancechange';
const APPEARANCES: Appearance[] = ['light', 'dark', 'system'];
const DEFAULT_APPEARANCE: Appearance = 'dark';

const isAppearance = (value: unknown): value is Appearance =>
    typeof value === 'string' && APPEARANCES.includes(value as Appearance);

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

export const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return DEFAULT_APPEARANCE;
    }

    const stored = window.localStorage.getItem(APPEARANCE_KEY);

    return isAppearance(stored) ? stored : DEFAULT_APPEARANCE;
};

export const getResolvedAppearance = (appearance: Appearance): 'light' | 'dark' =>
    appearance === 'dark' || (appearance === 'system' && prefersDark())
        ? 'dark'
        : 'light';

const notifyAppearanceChange = () => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT));
};

const handleSystemThemeChange = () => {
    applyTheme(getStoredAppearance());
    notifyAppearanceChange();
};

export function initializeTheme() {
    const savedAppearance = getStoredAppearance();

    applyTheme(savedAppearance);

    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(getStoredAppearance);
    const [resolvedAppearance, setResolvedAppearance] = useState<'light' | 'dark'>(
        () => getResolvedAppearance(getStoredAppearance()),
    );

    const syncAppearance = useCallback(() => {
        const savedAppearance = getStoredAppearance();

        setAppearance(savedAppearance);
        setResolvedAppearance(getResolvedAppearance(savedAppearance));
        applyTheme(savedAppearance);
    }, []);

    const updateAppearance = useCallback((mode: Appearance) => {
        if (!isAppearance(mode) || typeof window === 'undefined') {
            return;
        }

        setAppearance(mode);
        setResolvedAppearance(getResolvedAppearance(mode));

        window.localStorage.setItem(APPEARANCE_KEY, mode);

        setCookie(APPEARANCE_KEY, mode);

        applyTheme(mode);
        notifyAppearanceChange();
    }, []);

    useEffect(() => {
        syncAppearance();

        const handleStorage = (event: StorageEvent) => {
            if (event.key === APPEARANCE_KEY) {
                syncAppearance();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(APPEARANCE_EVENT, syncAppearance);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(APPEARANCE_EVENT, syncAppearance);
            mediaQuery()?.removeEventListener(
                'change',
                handleSystemThemeChange,
            );
        };
    }, [syncAppearance]);

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
