import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import axiosInstance from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface AccountActivationProps {
    email?: string;
    autoSendCode?: boolean;
}

type ErrorBag = {
    email?: string;
    code?: string;
    password?: string;
    password_confirmation?: string;
};

const normalizeError = (value: unknown): string | undefined => {
    if (Array.isArray(value)) {
        return typeof value[0] === 'string' ? value[0] : undefined;
    }
    return typeof value === 'string' ? value : undefined;
};

export default function AccountActivation({
    email = '',
    autoSendCode = false,
}: AccountActivationProps) {
    const navigate = useNavigate();
    const [formEmail, setFormEmail] = useState(
        email || localStorage.getItem('karaads_last_email') || '',
    );
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<ErrorBag>({});
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [settingPassword, setSettingPassword] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const [autoSent, setAutoSent] = useState(false);

    useEffect(() => {
        if (!autoSendCode || autoSent || !formEmail) {
            return;
        }

        setAutoSent(true);
        setSendingCode(true);
        setErrors({});
        setFeedback(null);

        axiosInstance
            .post(
                '/auth/me/confirm/v0/send-code',
                { email: formEmail },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            )
            .then(() => {
                setCodeSent(true);
                setFeedback({
                    type: 'success',
                    text: `A confirmation code was sent to ${formEmail}.`,
                });
            })
            .catch((error) => {
                const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
                const emailError = normalizeError(responseErrors.email);
                setErrors({
                    email: emailError,
                });
                setFeedback({
                    type: 'error',
                    text:
                        emailError ??
                        'We could not send a confirmation code. Please try again.',
                });
            })
            .finally(() => setSendingCode(false));
    }, [autoSendCode, autoSent, formEmail]);

    useEffect(() => {
        const trimmed = formEmail.trim();
        if (trimmed && trimmed.includes('@')) {
            localStorage.setItem('karaads_last_email', trimmed);
        }
    }, [formEmail]);

    const submitSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingCode(true);
        setErrors({});
        setFeedback(null);

        try {
            await axiosInstance.post(
                '/auth/me/confirm/v0/send-code',
                { email: formEmail },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            setCodeSent(true);
            setFeedback({
                type: 'success',
                text: `A confirmation code was sent to ${formEmail}.`,
            });
        } catch (error) {
            const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
            const emailError = normalizeError(responseErrors.email);
            setErrors({
                email: emailError,
            });
            setFeedback({
                type: 'error',
                text:
                    emailError ??
                    'We could not send a confirmation code. Please try again.',
            });
        } finally {
            setSendingCode(false);
        }
    };

    const submitVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyingCode(true);
        setErrors({});
        setFeedback(null);

        try {
            await axiosInstance.post(
                '/auth/me/confirm/v0/verify-code',
                { email: formEmail, code: code.toUpperCase() },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            setCodeVerified(true);
            setFeedback({
                type: 'success',
                text: 'Code verified. Create a new password to finish setup.',
            });
        } catch (error) {
            const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
            const codeError = normalizeError(responseErrors.code);
            const emailError = normalizeError(responseErrors.email);
            setErrors({
                code: codeError,
                email: emailError,
            });
            setFeedback({
                type: 'error',
                text:
                    codeError ??
                    emailError ??
                    'We could not verify the code. Please try again.',
            });
        } finally {
            setVerifyingCode(false);
        }
    };

    const submitSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingPassword(true);
        setErrors({});
        setFeedback(null);

        try {
            await axiosInstance.post(
                '/auth/me/confirm/v0/set-password',
                {
                    email: formEmail,
                    password,
                    password_confirmation: passwordConfirmation,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            navigate('/login?status=account-activated');
        } catch (error) {
            const responseErrors = (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors || {};
            const emailError = normalizeError(responseErrors.email);
            const passwordError = normalizeError(responseErrors.password);
            const passwordConfirmationError = normalizeError(
                responseErrors.password_confirmation,
            );
            setErrors({
                email: emailError,
                password: passwordError,
                password_confirmation: passwordConfirmationError,
            });
            setFeedback({
                type: 'error',
                text:
                    emailError ??
                    passwordError ??
                    passwordConfirmationError ??
                    'We could not set your password. Please try again.',
            });
        } finally {
            setSettingPassword(false);
        }
    };

    const handleBack = () => {
        setFeedback(null);
        if (codeVerified) {
            setCodeVerified(false);
        } else if (codeSent) {
            setCodeSent(false);
        }
    };

    const getStepTitle = () => {
        if (codeVerified) return "Create new password";
        if (codeSent) return "Enter confirmation code";
        return "Confirm your email";
    };

    const getStepDescription = () => {
        if (codeVerified) return "Choose a strong password for your account";
        if (codeSent) return `We sent a code to ${formEmail}`;
        return "Enter the email address associated with your account";
    };

    return (
        <AuthLayout>
            <div >
                {/* Header */}
                <div className="px-4 pt-12 pb-4">
                    {(codeSent || codeVerified) && (
                        <button 
                            onClick={handleBack}
                            className="mb-6"
                        >
                            <ArrowLeft className="w-8 h-8 text-white fixed top-4 left-4 " />
                        </button>
                    )}
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {getStepTitle()} 
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {getStepDescription()}
                    </p>
                </div>

                {feedback && (
                    <div
                        className={`mx-4 mb-4 rounded-lg px-4 py-3 text-sm ${
                            feedback.type === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {/* Step 1: Email Form */}
                {!codeSent && !codeVerified && (
                    <div className="px-4">
                        <form onSubmit={submitSendCode} className="space-y-4">
                            <div>
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
                            </div>
                            <Button 
                                type="submit" 
                                disabled={sendingCode}
                                className="w-full h-12  text-white rounded-lg text-base font-medium"
                            >
                                {sendingCode ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : null}
                                Continue
                            </Button>
                        </form>
                    </div>
                )}

                {/* Step 2: Code Verification */}
                {codeSent && !codeVerified && (
                    <div className="px-4">
                        <form onSubmit={submitVerifyCode} className="space-y-4">
                            <div>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value.toUpperCase().slice(0, 8))
                                    }
                                    required
                                    minLength={8}
                                    maxLength={8}
                                    placeholder="Enter 8-character code"
                                    className="h-12 text-base border-gray-300 rounded-lg text-center tracking-widest"
                                />
                                <InputError message={errors.code} />
                            </div>
                            <Button
                                type="submit"
                                disabled={verifyingCode}
                                className="w-full h-12 e rounded-lg text-base font-medium"
                            >
                                {verifyingCode ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : null}
                                Continue
                            </Button>
                            <button
                                type="button"
                                onClick={submitSendCode}
                                disabled={sendingCode}
                                className="w-full text-sm text-gray-500 text-center"
                            >
                                Didn't receive code? Send again
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: Set Password */}
                {codeVerified && (
                    <div className="px-4">
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Code verified</span>
                        </div>
                        <form onSubmit={submitSetPassword} className="space-y-4">
                            <div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="New password"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                    required
                                    placeholder="Confirm new password"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                            <Button
                                type="submit"
                                disabled={settingPassword}
                                className="w-full h-12 text-white rounded-lg text-base font-medium"
                            >
                                {settingPassword ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : null}
                                Create account
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
