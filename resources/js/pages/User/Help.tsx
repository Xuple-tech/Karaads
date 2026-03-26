import React from 'react';
import UserLayout from '@/layouts/UserLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, BookOpen, MessageSquare, Zap, AlertCircle } from 'lucide-react';

export default function UserHelp() {
    const faqs = [
        {
            question: 'How do I start a new conversation?',
            answer: 'Click the "New Chat" button from your dashboard or settings. Each conversation is isolated and can be managed separately.',
        },
        {
            question: 'What is my monthly message limit?',
            answer: 'Your limit depends on your subscription plan. Check your dashboard to see your current usage and remaining calls for this month.',
        },
        {
            question: 'Can I export my conversations?',
            answer: 'Currently, conversations are stored in your account. You can copy text from any conversation, but automatic export functionality is planned for future updates.',
        },
        {
            question: 'How is my data used?',
            answer: 'Your conversations are used only to provide the service. We do not train models on your data. See our privacy policy for complete details.',
        },
        {
            question: 'Can I delete specific messages?',
            answer: 'You can delete entire conversations, but individual message deletion is not currently supported. We are working on this feature.',
        },
    ];

    const features = [
        {
            icon: MessageSquare,
            title: 'Grok AI Chat',
            description: 'Chat with Grok AI for instant responses and creative tasks',
        },
        {
            icon: Zap,
            title: 'Real-time Responses',
            description: 'Get fast, accurate responses powered by advanced AI',
        },
        {
            icon: BookOpen,
            title: 'Conversation History',
            description: 'Access all your past conversations and pick up where you left off',
        },
        {
            icon: AlertCircle,
            title: 'Usage Tracking',
            description: 'Monitor your API usage and plan accordingly',
        },
    ];

    return (
        <UserLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold">Help & Documentation</h1>
                    <p className="text-gray-500 mt-1">Find answers and learn how to use Rhea</p>
                </div>

                {/* Features Overview */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={feature.title}>
                                    <CardContent className="pt-6">
                                        <div className="flex gap-4">
                                            <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-medium">{feature.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Getting Started */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>Quick steps to get the most out of Rhea</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {[
                                {
                                    step: 1,
                                    title: 'Create an Account',
                                    description: 'Sign up with your email to get started',
                                },
                                {
                                    step: 2,
                                    title: 'Start a Conversation',
                                    description: 'Click the "New Chat" button and begin messaging',
                                },
                                {
                                    step: 3,
                                    title: 'Customize Settings',
                                    description: 'Visit Settings to adjust theme and notification preferences',
                                },
                                {
                                    step: 4,
                                    title: 'Monitor Usage',
                                    description: 'Check your dashboard regularly to track API usage',
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 pb-3 border-b last:border-b-0">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                                            {item.step}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <details className="cursor-pointer">
                                        <summary className="font-medium flex items-center gap-2">
                                            <HelpCircle className="w-4 h-4" />
                                            {faq.question}
                                        </summary>
                                        <p className="text-gray-600 mt-3 ml-6">{faq.answer}</p>
                                    </details>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Need More Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-800">
                        <p className="mb-4">
                            If you cannot find an answer to your question, our support team is here to help.
                        </p>
                        <a href="mailto:support@rhea.app" className="text-blue-600 hover:underline font-medium">
                            Contact Support →
                        </a>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
