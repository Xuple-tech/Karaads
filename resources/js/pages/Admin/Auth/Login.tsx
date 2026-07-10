import { login } from '@/routes/admin';
import { FormEvent } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(login.url());
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="border-none shadow-2xl dark:shadow-gray-900/30">
                    <CardHeader className="space-y-4 pb-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Admin Dashboard
                            </CardTitle>
                            <CardDescription className="text-base">
                                Secure access to admin controls
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* Error Alert */}
                        {(errors.email || errors.password) && (
                            <Alert variant="destructive" className="animate-in fade-in-50">
                                <AlertDescription className="flex items-center gap-2">
                                    {errors.email || errors.password}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-3">
                                <Label 
                                    htmlFor="email" 
                                    className="text-sm font-medium flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="admin@example.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.currentTarget.value)}
                                        className="h-12 pl-11 pr-4 text-base bg-background border-input"
                                    />
                                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-3">
                                <Label 
                                    htmlFor="password" 
                                    className="text-sm font-medium flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.currentTarget.value)}
                                        className="h-12 pl-11 pr-12 text-base bg-background border-input"
                                    />
                                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
                                size="lg"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign in to Dashboard'
                                )}
                            </Button>
                        </form>

                        {/* Security Note */}
                        <div className="pt-6 border-t">
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                <span className="font-medium">Security Notice:</span> This area is restricted to authorized personnel only. All access attempts are logged and monitored for security purposes.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Having trouble signing in?{' '}
                        <a 
                            href="mailto:admin-support@example.com" 
                            className="font-medium text-primary hover:underline transition-colors"
                        >
                            Contact support
                        </a>
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                        v2.1.0 • Secure Admin Portal
                    </p>
                </div>
            </div>
        </div>
    );
}