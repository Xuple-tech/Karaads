import axios from 'axios'

const LAST_EMAIL_KEY = 'karaads_last_email'

function persistEmailCandidate(value: unknown) {
    if (typeof value !== 'string') return
    const email = value.trim()
    if (!email || !email.includes('@')) return
    localStorage.setItem(LAST_EMAIL_KEY, email)
}

function getEmailFromRequestData(data: unknown): string | undefined {
    if (!data) return undefined

    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data) as { email?: unknown }
            return typeof parsed.email === 'string' ? parsed.email : undefined
        } catch {
            return undefined
        }
    }

    if (typeof data === 'object') {
        const maybeEmail = (data as { email?: unknown }).email
        return typeof maybeEmail === 'string' ? maybeEmail : undefined
    }

    return undefined
}

function isGuestAuthPath(pathname: string): boolean {
    if (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password' ||
        pathname === '/auth/me/confirm/v0' ||
        pathname === '/reset-password'
    ) {
        return true
    }

    return /^\/reset-password\/[^/]+\/?$/.test(pathname)
}

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: '/',
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
})

// Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const message = String(
            error.response?.data?.message ??
                error.response?.data?.error?.message ??
                error.message ??
                ''
        ).toLowerCase()

        if (
            status === 403 &&
            message.includes('your email address is not verified')
        ) {
            const responseEmail = error.response?.data?.email
            const requestEmail = getEmailFromRequestData(error.config?.data)
            const storedEmail = localStorage.getItem(LAST_EMAIL_KEY)
            const resolvedEmail = [responseEmail, requestEmail, storedEmail].find(
                (value) => typeof value === 'string' && value.includes('@')
            ) as string | undefined

            persistEmailCandidate(resolvedEmail)

            if (location.pathname !== '/auth/verify-email/otp') {
                const params = new URLSearchParams()
                params.set('autoSendCode', '1')
                if (resolvedEmail) {
                    params.set('email', resolvedEmail)
                }
                window.location.href = `/auth/verify-email/otp?${params.toString()}`
            }
            return Promise.reject(error)
        }

        if (status === 401) {
            // Redirect to login on unauthorized requests except guest auth pages.
            if (!isGuestAuthPath(location.pathname)) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
