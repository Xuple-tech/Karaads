import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function SubscriptionOverview() {
    return (
        <GuestLayout>
            <Head title="Subscription Overview" />
            
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Subscription Plans
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Choose a plan that matches your usage and team size
                        </p>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Flexible Plans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Choose from multiple subscription tiers designed to fit different needs, from individual developers to large teams.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Scale As You Grow
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Upgrade or downgrade your plan anytime. Pay only for what you need as your usage grows.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    Fair Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Transparent pricing with no hidden fees. Monthly or yearly billing options available.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* What You Get */}
                    <Card className="mb-12">
                        <CardHeader>
                            <CardTitle>What Every Plan Includes</CardTitle>
                            <CardDescription>
                                All our plans come with core features to get you started
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold mb-3">Core Features</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>AI Agent Builder</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Chat Interface</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Knowledge Base Integration</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>API Access (plan dependent)</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold mb-3">Premium Features</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Email Automation</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Voice & TTS</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Multi-Tool Integration</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span>Priority Support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Limits */}
                    <Card className="mb-12">
                        <CardHeader>
                            <CardTitle>Understanding Usage Limits</CardTitle>
                            <CardDescription>
                                How API requests, tokens, and other metrics are counted
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">API Requests</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Each call to the API counts as one request. Daily and monthly limits reset at UTC midnight and the first day of the month respectively.
                                </p>
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    <strong>Example:</strong> A Free plan includes 100 requests per day. Once you reach 100 requests, additional calls will be blocked until the next day.
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Tokens</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Tokens represent the size of text data. Roughly 1 token ≈ 4 characters. Both input and output tokens are counted toward your limit.
                                </p>
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    <strong>Example:</strong> A 1000 character prompt and 500 character response = ~375 tokens total.
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Images Generated</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Each image generated from text or image editing counts toward your image limit.
                                </p>
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    <strong>Example:</strong> Generating 5 images from one prompt counts as 5 images.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trial Information */}
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-8">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                            <strong>Start with a 7-day free trial</strong> — Get full access to all features in any paid plan at no cost. No credit card required. Your trial includes all the features of the selected plan for testing and evaluation.
                        </AlertDescription>
                    </Alert>

                    {/* CTA */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button size="lg" asChild>
                                <Link href="/subscription/pricing">View All Plans</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/user/subscription">Manage Subscription</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
