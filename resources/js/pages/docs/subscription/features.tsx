import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

interface FeatureRow {
    category: string;
    description: string;
    free: boolean | string;
    starter: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
}

const features: FeatureRow[] = [
    // Core Features
    {
        category: 'AI Agent Builder',
        description: 'Create and customize AI agents',
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Knowledge Base',
        description: 'Upload and manage knowledge base documents',
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Chat Interface',
        description: 'Embed chat widget on your website',
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
    },
    {
        category: 'API Access',
        description: 'Access via REST API',
        free: false,
        starter: '100 req/day',
        pro: '10K req/day',
        enterprise: 'Unlimited',
    },
    
    // Premium Features
    {
        category: 'Email Automation',
        description: 'Automated email responses and workflows',
        free: false,
        starter: true,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Voice & TTS',
        description: 'Voice input and text-to-speech',
        free: false,
        starter: 'Limited',
        pro: true,
        enterprise: true,
    },
    {
        category: 'Image Generation',
        description: 'Generate and edit images with AI',
        free: false,
        starter: '10 images/day',
        pro: '500 images/day',
        enterprise: 'Unlimited',
    },
    {
        category: 'Multi-Tool Integration',
        description: 'Connect external tools and APIs',
        free: false,
        starter: '5 tools',
        pro: '25 tools',
        enterprise: 'Unlimited',
    },

    // Advanced Features
    {
        category: 'Advanced Analytics',
        description: 'Detailed usage and performance analytics',
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Priority Support',
        description: 'Priority support via email and chat',
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Custom Branding',
        description: 'White-label your agents',
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
    },
    {
        category: 'Team Collaboration',
        description: 'Invite team members and manage roles',
        free: false,
        starter: false,
        pro: '5 members',
        enterprise: 'Unlimited',
    },

    // Enterprise Features
    {
        category: 'Custom Integrations',
        description: 'Build custom integrations',
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
    },
    {
        category: 'Dedicated Account Manager',
        description: 'Personal support from account manager',
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
    },
    {
        category: 'SLA Guarantee',
        description: '99.9% uptime SLA',
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
    },
    {
        category: 'Advanced Security',
        description: 'Advanced security and compliance features',
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
    },
];

const FeatureCell = ({ feature }: { feature: boolean | string }) => {
    if (feature === false) {
        return (
            <div className="flex justify-center">
                <X className="h-5 w-5 text-red-500" />
            </div>
        );
    }
    if (feature === true) {
        return (
            <div className="flex justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
        );
    }
    return (
        <div className="text-center text-sm">
            <span className="inline-block bg-muted px-2 py-1 rounded text-xs font-medium">{feature}</span>
        </div>
    );
};

export default function SubscriptionFeatures() {
    return (
        <GuestLayout>
            <Head title="Plan Features Comparison" />
            
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Plan Features Comparison
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Compare features across all our subscription plans to find the right fit for your needs
                        </p>
                    </div>

                    {/* Pricing Cards (Quick View) */}
                    <div className="grid md:grid-cols-4 gap-4 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle>Free</CardTitle>
                                <CardDescription>Get started</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">$0</div>
                                <p className="text-sm text-muted-foreground mt-2">Forever free</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Starter
                                    <Badge>Popular</Badge>
                                </CardTitle>
                                <CardDescription>For individuals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">$29</div>
                                <p className="text-sm text-muted-foreground mt-2">/month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Pro</CardTitle>
                                <CardDescription>For teams</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">$99</div>
                                <p className="text-sm text-muted-foreground mt-2">/month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Enterprise</CardTitle>
                                <CardDescription>Custom solution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">Custom</div>
                                <p className="text-sm text-muted-foreground mt-2">Contact sales</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feature Comparison Table */}
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted">
                                        <th className="text-left p-4 font-semibold sticky left-0 bg-muted z-10" style={{ minWidth: '250px' }}>
                                            Feature
                                        </th>
                                        <th className="text-center p-4 font-semibold w-32">Free</th>
                                        <th className="text-center p-4 font-semibold w-32">Starter</th>
                                        <th className="text-center p-4 font-semibold w-32">Pro</th>
                                        <th className="text-center p-4 font-semibold w-32">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {features.map((row, idx) => (
                                        <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                                            <td className="p-4 sticky left-0 bg-background hover:bg-muted/50 z-10">
                                                <div>
                                                    <div className="font-medium text-sm">{row.category}</div>
                                                    <div className="text-xs text-muted-foreground">{row.description}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <FeatureCell feature={row.free} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <FeatureCell feature={row.starter} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <FeatureCell feature={row.pro} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <FeatureCell feature={row.enterprise} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Notes */}
                    <div className="mt-12 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Important Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Usage Limits</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All plans come with daily and monthly limits. When you reach your limit, your API requests will be blocked until the limit resets. Limits reset at UTC midnight (daily) and on the first day of the month (monthly).
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Flexible Billing</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Choose between monthly or yearly billing. Yearly billing offers a 20% discount compared to monthly billing.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Trial Period</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All paid plans include a 7-day free trial with full access to all plan features. No credit card required to start your trial.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Upgrade/Downgrade</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Change your plan anytime. Upgrades take effect immediately, while downgrades typically take effect at the start of your next billing cycle.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
