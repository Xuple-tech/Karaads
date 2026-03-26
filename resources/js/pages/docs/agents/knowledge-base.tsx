import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocsLayout } from '@/layouts/docs-layout';
import docs from '@/routes/docs';
import { Link } from '@inertiajs/react';
import { AlertCircle, BookOpen, Edit, Eye, Plus, Settings, Trash2 } from 'lucide-react';

export default function KnowledgeBaseIndex() {
    return (
        <DocsLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Knowledge Base Management</h1>
                    <p className="text-muted-foreground text-lg">Learn how to create, organize, and manage your AI agent's knowledge base</p>
                </div>

                {/* Quick Navigation */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Getting Started
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Understand what a knowledge base is and why it matters for your AI agent</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Adding Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Step-by-step guide to adding knowledge base items</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Best Practices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Tips and best practices for maintaining your knowledge base</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Overview Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">What is a Knowledge Base?</h2>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            A knowledge base is a collection of information items that your AI agent uses to provide accurate and contextual
                            responses. Think of it as a custom database of facts, policies, and information specific to your business.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <p className="text-base leading-relaxed">Your knowledge base allows your AI agent to:</p>
                        <ul className="ml-6 space-y-2">
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Answer questions with company-specific information</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Provide accurate pricing and product details</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Share policies and procedures</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Help with FAQs and troubleshooting</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Provide documentation and guides</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Types of Knowledge Base Items */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Types of Knowledge Items</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">FAQ Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">Common questions and answers about your products or services</p>
                                <code className="bg-muted block rounded p-2 text-xs">Q: How do I reset my password?</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Product Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">Details about your products, features, and pricing</p>
                                <code className="bg-muted block rounded p-2 text-xs">Product: Premium Plan - $99/month</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Policies & Procedures</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">Business policies, terms, and standard procedures</p>
                                <code className="bg-muted block rounded p-2 text-xs">Return Policy: 30-day money-back guarantee</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Guidelines & Documentation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">User guides, tutorials, and technical documentation</p>
                                <code className="bg-muted block rounded p-2 text-xs">Getting started with our API...</code>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* How to Add Items */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Adding Knowledge Base Items</h2>

                    <div className="space-y-4">
                        <p className="text-base leading-relaxed">Follow these steps to add a new item to your knowledge base:</p>

                        <div className="space-y-3">
                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex gap-3">
                                    <Badge className="h-fit">1</Badge>
                                    <div>
                                        <h4 className="font-semibold">Navigate to Knowledge Base</h4>
                                        <p className="text-muted-foreground text-sm">Go to your Agent → Knowledge Base tab</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex gap-3">
                                    <Badge className="h-fit">2</Badge>
                                    <div>
                                        <h4 className="font-semibold">Click "Add Knowledge Item"</h4>
                                        <p className="text-muted-foreground text-sm">Click the button in the top-right to create a new item</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex gap-3">
                                    <Badge className="h-fit">3</Badge>
                                    <div>
                                        <h4 className="font-semibold">Fill in the Details</h4>
                                        <p className="text-muted-foreground text-sm">Enter a title, category, content, and any relevant metadata</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex gap-3">
                                    <Badge className="h-fit">4</Badge>
                                    <div>
                                        <h4 className="font-semibold">Make it Active</h4>
                                        <p className="text-muted-foreground text-sm">Toggle "Active" to make it available to your AI agent</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex gap-3">
                                    <Badge className="h-fit">5</Badge>
                                    <div>
                                        <h4 className="font-semibold">Save and Done!</h4>
                                        <p className="text-muted-foreground text-sm">Click "Save" and your knowledge item is now available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Managing Items */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Managing Your Knowledge Base</h2>

                    <div className="space-y-3">
                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Edit className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold">Edit an Item</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Click on any knowledge item in the list to edit its content, category, or other details.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Eye className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold">Activate/Deactivate</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Use the toggle in the action menu to make items visible or hidden from your AI agent.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold">Delete an Item</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">Remove items you no longer need. Note: This action cannot be undone.</p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold">Organize by Category</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Use categories to organize your knowledge base. Your agent uses these to better understand context.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Best Practices */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Best Practices</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Clear & Concise</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Write clear, concise content. Avoid jargon and keep information focused.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Well Organized</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Use consistent categories and naming conventions for easy navigation.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Keep it Updated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Regularly review and update your knowledge base as information changes.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Include Context</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Provide enough context for your agent to understand the information.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Use Metadata</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Add tags and metadata to help your agent find relevant information.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Regular Review</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Review your knowledge base monthly to remove outdated or irrelevant items.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Tips */}
                <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>💡 Tip:</strong> Start with the most important information. Your AI agent learns better with a focused, well-organized
                        knowledge base than with a large amount of scattered information.
                    </AlertDescription>
                </Alert>

                {/* Navigation */}
                <div className="flex gap-4 pt-6">
                    <Button asChild>
                        <Link href={docs.agents.index.url()}>← Back to Agents</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={docs.agents.tools.url()}>Tools Management →</Link>
                    </Button>
                </div>
            </div>
        </DocsLayout>
    );
}
