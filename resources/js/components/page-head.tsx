import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link as RouterLink, useInRouterContext } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

interface PageHeadProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;
}

/**
 * Simple replacement for Inertia's Head component
 * Updates the page title and meta description
 */
export function Head({ title, description, children }: PageHeadProps) {
    useEffect(() => {
        if (title) {
            document.title = `${title} - Karaads`;
        }
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }
        }
    }, [title, description]);

    // This component doesn't render anything
    return null;
}

/**
 * Mock useForm for compatibility with old Inertia code
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
    const [data, setData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const { setAuth } = useAuth();

    const clearErrors = (...fields: string[]) => {
        if (fields.length === 0) {
            setErrors({});
            return;
        }

        setErrors((prev) => {
            const next = { ...prev };
            fields.forEach((field) => {
                delete next[field];
            });
            return next;
        });
    };

    const submit = async (method: string, url: string, options: any = {}, submissionData?: any) => {
        setProcessing(true);
        setErrors({});
        setRecentlySuccessful(false);

        try {
            const body = submissionData || data;
            const response = await axiosInstance.request({
                method,
                url,
                data: body,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const result = response.data;

            // If this was a login or registration, refresh auth state.
            if (url === '/login' || url === '/register') {
                const profileResponse = await axiosInstance.get('/api/users/profile', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const profileResult = profileResponse.data;
                const user = profileResult.data || profileResult;
                setAuth({ user });
            }

            if (options.onSuccess) options.onSuccess(result);
            setRecentlySuccessful(true);
            window.setTimeout(() => setRecentlySuccessful(false), 2000);

            if (result.redirect) {
                window.history.pushState({}, '', result.redirect);
                window.dispatchEvent(new PopStateEvent('popstate'));
            } else if (url === '/login' || url === '/register') {
                window.history.pushState({}, '', '/app');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        } catch (error) {
            const status = (error as any)?.response?.status;
            if (status === 422) {
                const validationErrors = (error as any)?.response?.data;
                setErrors(validationErrors?.errors || {});
                if (options.onError) options.onError(validationErrors?.errors || {});
            } else {
                console.error('Submission error', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return {
        data,
        setData: (key: keyof T | Partial<T>, value?: any) => {
            if (typeof key === 'string') {
                setData(prev => ({ ...prev, [key]: value }));
            } else if (typeof key === 'object' && key !== null) {
                setData(prev => ({ ...prev, ...(key as Partial<T>) }));
            }
        },
        post: (url: string, options?: any, submissionData?: any) => submit('post', url, options, submissionData),
        put: (url: string, options?: any, submissionData?: any) => submit('put', url, options, submissionData),
        patch: (url: string, options?: any, submissionData?: any) => submit('patch', url, options, submissionData),
        delete: (url: string, options?: any, submissionData?: any) => submit('delete', url, options, submissionData),
        processing,
        recentlySuccessful,
        errors,
        clearErrors,
        resetAndClearErrors: (...fields: string[]) => {
            clearErrors(...fields);
            if (fields.length === 0) {
                setData(initialValues);
                return;
            }

            setData((prev) => {
                const next = { ...prev };
                fields.forEach((field) => {
                    next[field as keyof T] = initialValues[field as keyof T];
                });
                return next;
            });
        },
        reset: (...fields: string[]) => {
            if (fields.length === 0) {
                setData(initialValues);
            } else {
                const newData = { ...data };
                fields.forEach(f => {
                    newData[f as keyof T] = initialValues[f as keyof T];
                });
                setData(newData);
            }
        },
    };
}

/**
 * Mock Form component for compatibility
 */
export function Form({ children, action, method, onSuccess, onError, transform, resetOnSuccess, ...props }: any) {
    const form = useForm({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;

        // Collect data from form fields
        const formData = new FormData(formElement);
        const rawData = Object.fromEntries(formData.entries());
        const data = typeof transform === 'function' ? transform(rawData) : rawData;
        const normalizedMethod = String(method || 'post').toLowerCase();
        const submitMethod = ['post', 'put', 'patch', 'delete'].includes(normalizedMethod)
            ? normalizedMethod
            : 'post';
        const submit = (form as any)[submitMethod] || form.post;

        submit(action, {
            onError,
            onSuccess: (result: any) => {
                if (resetOnSuccess) {
                    if (Array.isArray(resetOnSuccess)) {
                        resetOnSuccess.forEach((fieldName) => {
                            const field = formElement.elements.namedItem(fieldName);
                            if (!field) return;

                            if (field instanceof RadioNodeList) {
                                Array.from({ length: field.length }).forEach((_, index) => {
                                    const item = field.item(index) as HTMLInputElement | null;
                                    if (!item) return;
                                    item.checked = false;
                                    item.value = '';
                                });
                                return;
                            }

                            const input = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                            if ('checked' in input) input.checked = false;
                            if ('value' in input) input.value = '';
                        });
                    } else {
                        formElement.reset();
                    }
                }

                if (onSuccess) onSuccess(result);
            },
        }, data);
    };

    if (typeof children === 'function') {
        return (
            <form onSubmit={handleSubmit} {...props}>
                {children({
                    data: form.data,
                    setData: form.setData,
                    errors: form.errors,
                    processing: form.processing,
                    recentlySuccessful: form.recentlySuccessful,
                    clearErrors: form.clearErrors,
                    reset: form.reset,
                    resetAndClearErrors: form.resetAndClearErrors,
                })}
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} {...props}>
            {children}
        </form>
    );
}

export const Link = ({ href, children, prefetch, as, ...props }: any) => {
    const inRouter = useInRouterContext();

    if (typeof href === 'string') {
        if (href?.startsWith('http') || href?.startsWith('//') || as === 'button') {
            return <a href={href} {...props}>{children}</a>;
        }
    }
    if(typeof href === 'object' && 'url' in href) {
        href = href.url;
        if (href?.startsWith('http') || href?.startsWith('//') || as === 'button') {
            return <a href={href} {...props}>{children}</a>;
        }

    }
    if (!inRouter) {
        return <a href={href} {...props}>{children}</a>;
    }
    return <RouterLink to={href} {...props}>{children}</RouterLink>;
};

export const usePage = <T extends Record<string, any> = any>() => {
    try {
        const { auth } = useAuth();

        // Try to get data from Inertia's data-page attribute
        let inertiaData = {};
        const appElement = document.getElementById('app');
        if (appElement && appElement.dataset.page) {
            try {
                const page = JSON.parse(appElement.dataset.page);
                inertiaData = page.props || {};
            } catch (e) {
                console.error('Failed to parse Inertia data-page', e);
            }
        }

        // Also check window.laravel as fallback
        const laravelData = (window as any).laravel?.page?.props || {};
        const mergedProps = {
            ...inertiaData,
            ...laravelData,
        } as Record<string, unknown>;

        const payloadAuth =
            mergedProps.auth && typeof mergedProps.auth === 'object'
                ? mergedProps.auth
                : null;

        return {
            props: {
                ...mergedProps,
                auth: auth ?? payloadAuth,
            } as unknown as T,
            url: window.location.pathname,
            component: '',
            version: ''
        };
    } catch (e) {
        return { props: { auth: null } as unknown as T, url: window.location.pathname, component: '', version: '' };
    }
};

export const router = {
    visit: (url: string) => {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
    },
    get: (url: string) => {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
    },
    post: async (url: string, data?: any) => {
        const response = await axiosInstance.post(url, data, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        return response;
    },
    flushAll: () => {
        axiosInstance.post('/logout')
            .catch((error) => {
                console.error('Logout failed:', error);
            })
            .finally(() => {
                window.location.href = '/login';
            });
    }
};
