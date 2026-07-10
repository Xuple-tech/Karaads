import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmailVerificationOtpProps {
    email?: string;
    autoSendCode?: boolean;
}

type ErrorBag = {
    email?: string;
    code?: string;
};

const normalizeError = (value: unknown): string | undefined => {
    if (Array.isArray(value)) {
        return typeof value[0] === 'string' ? value[0] : undefined;
    }
    return typeof value === 'string' ? value : undefined;
};

export default function EmailVerificationOtp({
    email = '',
    autoSendCode = false,
}: EmailVerificationOtpProps) {
    const navigate = useNavigate();
    const [formEmail, setFormEmail] = useState(
        email || localStorage.getItem('karaads_last_email') || '',
    );
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState<ErrorBag>({});
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [autoSent, setAutoSent] = useState(false);

    useEffect(() => {
        const trimmed = formEmail.trim();
        if (trimmed && trimmed.includes('@')) {
            localStorage.setItem('karaads_last_email', trimmed);
        }
    }, [formEmail]);

    useEffect(() => {
        if (!autoSendCode || autoSent || !formEmail) {
            return;
        }

        setAutoSent(true);
        void sendCodeRequest();
    }, [autoSendCode, autoSent, formEmail]);

    const sendCodeRequest = async () => {
        setSendingCode(true);
        setErrors({});
        setFeedback(null);

        try {
            const response = await axiosInstance.post(
                '/auth/verify-email/otp/send-code',
                { email: formEmail },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            const responseStatus = response?.data?.status;
            setCodeSent(true);
            setFeedback({
                type: 'success',
                text:
                    responseStatus === 'already-verified'
                        ? 'Your email is already verified.'
                        : `A verification code was sent to ${formEmail}.`,
            });
        } catch (error) {
            const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
            const emailError = normalizeError(responseErrors.email);
            const codeError = normalizeError(responseErrors.code);
            setErrors({
                email: emailError,
                code: codeError,
            });
            setFeedback({
                type: 'error',
                text:
                    emailError ??
                    codeError ??
                    'We could not send a verification code. Please try again.',
            });
        } finally {
            setSendingCode(false);
        }
    };

    const submitSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendCodeRequest();
    };

    const submitVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyingCode(true);
        setErrors({});
        setFeedback(null);

        try {
            const response = await axiosInstance.post(
                '/auth/verify-email/otp/verify-code',
                { email: formEmail, code: code.toUpperCase() },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            setFeedback({
                type: 'success',
                text: 'Email verified successfully. Redirecting...',
            });
            const redirect = response?.data?.redirect || '/app';
            navigate(redirect);
        } catch (error) {
            const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
            const emailError = normalizeError(responseErrors.email);
            const codeError = normalizeError(responseErrors.code);
            setErrors({
                email: emailError,
                code: codeError,
            });
            setFeedback({
                type: 'error',
                text:
                    codeError ??
                    emailError ??
                    'We could not verify your code. Please try again.',
            });
        } finally {
            setVerifyingCode(false);
        }
    };

    return (
        <AuthLayout>
            <div className="px-4 pt-12 pb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Verify your email</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Enter the 8-character code sent to your email.
                </p>
            </div>

            <div className="px-4 space-y-6">
                {feedback && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm ${
                            feedback.type === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {!codeSent && (
                    <form onSubmit={submitSendCode} className="space-y-4">
                        <Input
                            id="email"
                            type="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            required
                            placeholder="Email address"
                            className="h-12 text-base border-gray-300 rounded-lg"
                        />
                        <InputError message={errors.email} />
                        <Button type="submit" disabled={sendingCode} className="w-full h-12 text-white rounded-lg text-base font-medium">
                            {sendingCode ? <Spinner className="mr-2 h-4 w-4" /> : null}
                            Send code
                        </Button>
                    </form>
                )}

                {codeSent && (
                    <form onSubmit={submitVerifyCode} className="space-y-4">
                        <Input
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
                            required
                            minLength={8}
                            maxLength={8}
                            placeholder="Enter 8-character code"
                            className="h-12 text-base border-gray-300 rounded-lg text-center tracking-widest"
                        />
                        <InputError message={errors.code} />
                        <Button type="submit" disabled={verifyingCode} className="w-full h-12 text-white rounded-lg text-base font-medium">
                            {verifyingCode ? <Spinner className="mr-2 h-4 w-4" /> : null}
                            Verify email
                        </Button>
                        <button
                            type="button"
                            onClick={() => void sendCodeRequest()}
                            disabled={sendingCode}
                            className="w-full text-sm text-gray-500 text-center"
                        >
                            Didn&apos;t receive code? Send again
                        </button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
