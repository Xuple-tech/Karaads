import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocsLayout } from '@/layouts/docs-layout';
import docs from '@/routes/docs';
import { Link } from '@inertiajs/react';
import { AlertCircle, Code2, Copy, Edit, Plus, Trash2, Zap } from 'lucide-react';

export default function ToolsIndex() {
    return (
        <DocsLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Tools Management</h1>
                    <p className="text-muted-foreground text-lg">Connect tools and integrations so your agent can take real actions</p>
                </div>

                {/* Quick Navigation */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Quick Start
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Set up your first tool in a few minutes</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Tool Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Compare tool types and when to use each one</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="h-5 w-5" />
                                Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Configure tools safely and predictably</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Overview */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">What are Tools?</h2>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Tools are extensions that give your AI agent the ability to perform actions beyond just answering questions. They enable
                            your agent to interact with external APIs, databases, and services.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <p className="text-base leading-relaxed">With tools, your AI agent can:</p>
                        <ul className="ml-6 space-y-2">
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Search and retrieve product information</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Check inventory and availability</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Book appointments and manage calendars</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Create support tickets</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Perform calculations and data validation</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Send emails and SMS messages</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-green-600">✓</span>
                                <span>Translate content between languages</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Tool Types */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Types of Tools</h2>

                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="calculator">🧮 Calculator</TabsTrigger>
                            <TabsTrigger value="booking">📅 Booking</TabsTrigger>
                            <TabsTrigger value="product">🛍️ Product</TabsTrigger>
                            <TabsTrigger value="support">🎫 Support</TabsTrigger>
                            <TabsTrigger value="custom">⚙️ Custom</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🧮 Calculator Tool</CardTitle>
                                    <CardDescription>Perform mathematical operations</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p>Perfect for agents that need to perform calculations.</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Supported Operations:</p>
                                        <code className="bg-muted block rounded p-2 text-xs">+, -, *, /, %, power, square root, absolute value</code>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Use when: Your agent needs to calculate totals, percentages, or perform mathematical operations.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="booking" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>📅 Booking Tool</CardTitle>
                                    <CardDescription>Schedule appointments and meetings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p>Enables your agent to check availability and book appointments.</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Capabilities:</p>
                                        <ul className="ml-4 list-disc space-y-1 text-xs">
                                            <li>Check available time slots</li>
                                            <li>Book appointments for customers</li>
                                            <li>Send confirmation messages</li>
                                            <li>Handle timezone conversions</li>
                                        </ul>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Use when: You want your agent to handle appointment scheduling for salons, doctors, consultants, etc.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="product" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🛍️ Product Search Tool</CardTitle>
                                    <CardDescription>Search and retrieve product information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p>Allows your agent to search your product catalog and provide detailed information.</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Capabilities:</p>
                                        <ul className="ml-4 list-disc space-y-1 text-xs">
                                            <li>Search by name or keyword</li>
                                            <li>Browse by category</li>
                                            <li>Get detailed product info</li>
                                            <li>Check inventory status</li>
                                            <li>Show pricing and availability</li>
                                        </ul>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Use when: You have an e-commerce business or product catalog to query.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="support" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🎫 Support Ticket Tool</CardTitle>
                                    <CardDescription>Create and manage support tickets</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p>Enable your agent to create support tickets for customer issues.</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Capabilities:</p>
                                        <ul className="ml-4 list-disc space-y-1 text-xs">
                                            <li>Create new tickets</li>
                                            <li>Set priority levels</li>
                                            <li>Categorize issues</li>
                                            <li>Assign to departments</li>
                                            <li>Track ticket status</li>
                                        </ul>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Use when: You want your agent to handle customer support escalations.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>⚙️ Custom Tool</CardTitle>
                                    <CardDescription>Create tools for your specific needs</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p>Build custom tools that connect to your own APIs and services.</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Perfect for:</p>
                                        <ul className="ml-4 list-disc space-y-1 text-xs">
                                            <li>Weather APIs</li>
                                            <li>Currency converters</li>
                                            <li>Email verification</li>
                                            <li>Translation services</li>
                                            <li>Data validation</li>
                                            <li>Any REST API</li>
                                        </ul>
                                    </div>
                                    <p className="text-muted-foreground text-sm">Use when: You need to integrate with external APIs or services.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* Quick Start */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Quick Start: Create Your First Tool</h2>

                    <div className="space-y-3">
                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">1</Badge>
                                <div>
                                    <h4 className="font-semibold">Go to Tools</h4>
                                    <p className="text-muted-foreground text-sm">Navigate to your Agent → Tools tab</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">2</Badge>
                                <div>
                                    <h4 className="font-semibold">Click "Add New Tool"</h4>
                                    <p className="text-muted-foreground text-sm">Look for the blue button in the top-right corner</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">3</Badge>
                                <div>
                                    <h4 className="font-semibold">Select Tool Type</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Choose from Calculator, Booking, Product Search, Support, or Custom
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">4</Badge>
                                <div>
                                    <h4 className="font-semibold">Get Auto-Filled Defaults</h4>
                                    <p className="text-muted-foreground text-sm">
                                        The form automatically fills with recommended configuration for your tool type
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">5</Badge>
                                <div>
                                    <h4 className="font-semibold">Configure (Optional)</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Edit the configuration details if needed. Use Form tab for easy editing or JSON tab for full control
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">6</Badge>
                                <div>
                                    <h4 className="font-semibold">Activate</h4>
                                    <p className="text-muted-foreground text-sm">Toggle "Make this tool active" so your agent can use it</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex gap-3">
                                <Badge className="h-fit">7</Badge>
                                <div>
                                    <h4 className="font-semibold">Save</h4>
                                    <p className="text-muted-foreground text-sm">Click "Create Tool" and you're done!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Configuration Guide */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Configuration Guide</h2>

                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Two Ways to Configure:</strong> Use the Form tab for a visual interface, or switch to the JSON tab for full
                            control. Both tabs are synchronized in real-time!
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">API Endpoint</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">The URL where your tool sends requests</p>
                                <code className="bg-muted block rounded p-2 text-xs">https://api.example.com/v1/endpoint</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">API Key</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">Authentication token for the API</p>
                                <code className="bg-muted block rounded p-2 text-xs">sk_test_xxxxxxxxxxxxx</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Timeout</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">How long to wait for a response (in seconds)</p>
                                <code className="bg-muted block rounded p-2 text-xs">10 seconds (fast APIs)</code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Method</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-muted-foreground text-sm">HTTP method to use</p>
                                <code className="bg-muted block rounded p-2 text-xs">GET, POST, PUT, DELETE</code>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Management Operations */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Managing Your Tools</h2>

                    <div className="space-y-3">
                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Edit className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold">Edit a Tool</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Click on any tool in the list to open the edit page. Make changes and click "Save Changes" to apply them instantly.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold">Activate/Deactivate</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Use the dropdown menu next to each tool to activate or deactivate it. Inactive tools are hidden from your agent.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold">Delete a Tool</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                Select the delete option from the tool menu. You'll be asked to confirm before deletion (this cannot be undone).
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Copy className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold">Copy Configuration</h4>
                            </div>
                            <p className="text-muted-foreground ml-7 text-sm">
                                In the edit page, switch to the JSON tab and click "Copy" to copy the configuration for use elsewhere.
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
                                <CardTitle className="text-lg">✓ Secure API Keys</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Store API keys in your .env file, never commit them to version control
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Test First</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Create tools as inactive first, test them, then enable for production</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Clear Names</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Use descriptive tool names that clearly indicate their purpose</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Add Descriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Write clear descriptions so your agent understands when to use each tool
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Set Timeouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Use appropriate timeouts (5-10 for fast APIs, 15-30 for slower ones)</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">✓ Monitor Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Check logs and monitor how your agent uses tools to optimize performance
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Configuration Examples */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Configuration Examples</h2>

                    <Tabs defaultValue="product" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="product">Product Search</TabsTrigger>
                            <TabsTrigger value="booking">Booking</TabsTrigger>
                            <TabsTrigger value="custom">Custom API</TabsTrigger>
                            <TabsTrigger value="weather">Weather</TabsTrigger>
                        </TabsList>

                        <TabsContent value="product" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Product Search Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                                        {`{
  "api_endpoint": "https://api.example.com/v1/products/search",
  "api_key": "sk_test_product_key",
  "timeout": 10,
  "max_results": 5,
  "authentication": "bearer"
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="booking" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Booking Tool Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                                        {`{
  "api_endpoint": "https://api.example.com/v1/bookings",
  "api_key": "sk_test_booking_key",
  "timeout": 15,
  "method": "POST",
  "duration_minutes": 30,
  "timezone": "UTC"
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Custom API Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                                        {`{
  "api_endpoint": "https://api.yourservice.com/v1/endpoint",
  "api_key": "sk_your_api_key",
  "timeout": 10,
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token",
    "Content-Type": "application/json"
  }
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="weather" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Weather API Configuration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                                        {`{
  "api_endpoint": "https://api.openweathermap.org/data/2.5/weather",
  "api_key": "sk_weather_key",
  "timeout": 5,
  "method": "GET",
  "params": {
    "units": "metric",
    "lang": "en"
  }
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* Tips */}
                <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        <strong>💡 Pro Tip:</strong> Start with pre-configured templates. When you select a tool type, the form auto-fills with
                        recommended defaults and example configurations. Just customize as needed!
                    </AlertDescription>
                </Alert>

                {/* Navigation */}
                <div className="flex gap-4 pt-6">
                    <Button asChild>
                        <Link href={docs.agents.knowledgeBase.url()}>← Knowledge Base</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={docs.agents.index.url()}>Back to Agents →</Link>
                    </Button>
                </div>
            </div>
        </DocsLayout>
    );
}
