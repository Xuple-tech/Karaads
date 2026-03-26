import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'Getting Started',
        question: 'How do I sign up for a plan?',
        answer: 'You can sign up from our pricing page or directly from your account dashboard. Choose your desired plan, and if it\'s a paid plan, we\'ll guide you through our secure checkout process powered by Stripe. Your plan will be activated immediately after payment.',
    },
    {
        category: 'Getting Started',
        question: 'What is the 7-day free trial?',
        answer: 'All paid plans come with a 7-day free trial that gives you full access to all plan features at no cost. You don\'t need to provide a credit card to start your trial. After 7 days, your trial will expire and you\'ll need to upgrade to continue access.',
    },
    {
        category: 'Getting Started',
        question: 'Can I try a plan before upgrading?',
        answer: 'Yes! All our paid plans include a 7-day free trial. This gives you plenty of time to test all the features and make sure the plan meets your needs before committing financially.',
    },
    {
        category: 'Billing & Payments',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, etc.) through Stripe. Your payment information is encrypted and secure.',
    },
    {
        category: 'Billing & Payments',
        question: 'How often will I be charged?',
        answer: 'You\'ll be charged according to your chosen billing period - either monthly or yearly. Monthly subscriptions renew on the same day each month, while yearly subscriptions renew on the same date each year.',
    },
    {
        category: 'Billing & Payments',
        question: 'Is there a discount for annual billing?',
        answer: 'Yes! When you choose yearly billing, you get a 20% discount compared to paying monthly. That\'s equivalent to getting about 2.4 months free per year.',
    },
    {
        category: 'Billing & Payments',
        question: 'Can I change my billing frequency?',
        answer: 'Yes, you can change between monthly and yearly billing anytime from your account settings. Changes take effect on your next billing cycle.',
    },
    {
        category: 'Billing & Payments',
        question: 'What happens if my payment fails?',
        answer: 'If a payment fails, we\'ll automatically retry it a few times. You\'ll receive email notifications about the failed payment. If the issue isn\'t resolved, your account will transition to a limited state. Contact support for help.',
    },
    {
        category: 'Plans & Features',
        question: 'What\'s the difference between the plans?',
        answer: 'Each plan offers different API limits, features, and support levels. The Free plan includes basic features with low limits, Starter adds email automation and more requests, Pro includes advanced analytics and team collaboration, and Enterprise offers unlimited resources with dedicated support.',
    },
    {
        category: 'Plans & Features',
        question: 'Can I upgrade mid-month?',
        answer: 'Yes! You can upgrade anytime. We\'ll charge the difference between your old plan and new plan prorated to your next billing cycle. You\'ll get immediate access to all features of your new plan.',
    },
    {
        category: 'Plans & Features',
        question: 'What happens when I downgrade my plan?',
        answer: 'Downgrades take effect at the start of your next billing cycle. You\'ll lose access to features not included in the new plan, but your data will be preserved. We recommend backing up any important data before downgrading.',
    },
    {
        category: 'Usage & Limits',
        question: 'What are API requests?',
        answer: 'An API request is any call made to our API. Each request counts toward your daily and monthly limits. For example, if you call the chat endpoint once, that\'s 1 request. If you make 100 separate API calls in a day, that\'s 100 requests.',
    },
    {
        category: 'Usage & Limits',
        question: 'How are tokens counted?',
        answer: 'Tokens represent chunks of text. Roughly 4 characters = 1 token. Both input (your prompt) and output (the response) tokens count toward your limit. For example, a 1000 character input and 500 character output ≈ 375 tokens total.',
    },
    {
        category: 'Usage & Limits',
        question: 'When do my limits reset?',
        answer: 'Daily limits reset at UTC midnight (00:00 UTC). Monthly limits reset on the first day of each calendar month. You can check your current usage in your account dashboard.',
    },
    {
        category: 'Usage & Limits',
        question: 'What happens when I reach my limit?',
        answer: 'Once you reach your daily or monthly limit, additional requests will be blocked with an error message. You\'ll need to wait for the limit to reset or upgrade to a plan with higher limits.',
    },
    {
        category: 'Usage & Limits',
        question: 'Can I purchase additional tokens or requests?',
        answer: 'Not at this time. We recommend upgrading to a plan with higher limits that matches your usage. Contact us if you need custom limits for your use case.',
    },
    {
        category: 'Cancellation & Refunds',
        question: 'How do I cancel my subscription?',
        answer: 'You can cancel anytime from your account settings. Go to your Subscription page and click "Cancel Subscription". Your access will continue until the end of your billing period.',
    },
    {
        category: 'Cancellation & Refunds',
        question: 'Is there a cancellation fee?',
        answer: 'No, there are no cancellation fees. You can cancel anytime without penalty. If you cancel mid-month, you retain access until the end of your billing period.',
    },
    {
        category: 'Cancellation & Refunds',
        question: 'Do you offer refunds?',
        answer: 'We do not offer refunds for subscription payments. However, if there\'s a billing error or issue with your account, please contact our support team to discuss your options.',
    },
    {
        category: 'Cancellation & Refunds',
        question: 'Can I reactivate a cancelled subscription?',
        answer: 'Yes! You can reactivate your subscription anytime by selecting a plan on the pricing page and completing the checkout process. If you were on a trial before, you won\'t be able to start another trial.',
    },
    {
        category: 'Support & Assistance',
        question: 'How can I contact support?',
        answer: 'You can reach our support team via email at support@rheaapp.com or through the help center on your account dashboard. Pro and Enterprise plan members get priority support with faster response times.',
    },
    {
        category: 'Support & Assistance',
        question: 'What support do Free plan users get?',
        answer: 'Free plan users have access to our documentation and community forums. For direct support, consider upgrading to a paid plan which includes email support.',
    },
    {
        category: 'Support & Assistance',
        question: 'How quickly will I get a response from support?',
        answer: 'Free plan users typically receive responses within 48 hours. Starter plan users get responses within 24 hours. Pro and Enterprise users receive priority support with responses within 4 business hours.',
    },
    {
        category: 'Account & Data',
        question: 'What happens to my data after cancellation?',
        answer: 'Your data is preserved for 30 days after cancellation. If you reactivate your subscription within this period, all your data will be restored. After 30 days, we may delete inactive account data.',
    },
    {
        category: 'Account & Data',
        question: 'Can I transfer my account to another email?',
        answer: 'No, accounts are tied to their email address. However, you can create a new account with a different email and recreate your agents. Contact support if you need help with this process.',
    },
];

const categories = Array.from(new Set(faqs.map(f => f.category)));

export default function SubscriptionFAQ() {
    const [expandedStates, setExpandedStates] = useState<{ [key: string]: boolean }>({});

    const toggleExpanded = (question: string) => {
        setExpandedStates(prev => ({
            ...prev,
            [question]: !prev[question],
        }));
    };

    return (
        <GuestLayout>
            <Head title="Subscription FAQ" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Find answers to common questions about our subscription plans and billing
                        </p>
                    </div>

                    {/* FAQs by Category */}
                    <div className="space-y-8">
                        {categories.map((category) => (
                            <div key={category}>
                                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1 h-8 bg-primary rounded-full"></span>
                                    {category}
                                </h2>
                                <div className="space-y-3">
                                    {faqs
                                        .filter(faq => faq.category === category)
                                        .map((faq, idx) => (
                                            <Card key={idx} className="overflow-hidden">
                                                <Collapsible
                                                    open={expandedStates[faq.question] || false}
                                                    onOpenChange={() => toggleExpanded(faq.question)}
                                                >
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                                            <div className="flex-1 text-left">
                                                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                                                                    {faq.question}
                                                                </h3>
                                                            </div>
                                                            <ChevronDown
                                                                className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                                                    expandedStates[faq.question] ? 'rotate-180' : ''
                                                                }`}
                                                            />
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="px-4 pb-4">
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            {faq.answer}
                                                        </p>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still Need Help */}
                    <Card className="mt-12 bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="h-6 w-6" />
                                Still have questions?
                            </CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Can't find the answer you're looking for? Please contact our support team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-primary-foreground/90">
                                Email us at <strong>support@rheaapp.com</strong> or visit our Help Center for more assistance.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
