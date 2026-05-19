"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  HelpCircle, 
  Zap, 
  Shield, 
  CreditCard, 
  Users,
  MessageSquare,
  Code,
  Globe,
  Lock,
  Download,
  Upload,
  Brain,
  Database,
  Settings,
  ChevronRight,
  Mail,
  MessageCircle,
  Bot,
  Cpu,
  BarChart,
  Cloud,
  Smartphone,
  Building,
  School,
  Sparkles,
  TrendingUp,
  Puzzle
} from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqCategories = [
    {
      id: "general",
      title: "General Questions",
      icon: HelpCircle,
      color: "bg-blue-100 text-blue-600",
      questions: [
        {
          q: "What is Kwati AI?",
          a: "Kwati AI is an advanced artificial intelligence platform that provides intelligent automation, natural language processing, and machine learning solutions for businesses and developers. Our platform helps streamline workflows, analyze data, and enhance productivity through cutting-edge AI technology.",
          tags: ["overview", "platform"]
        },
        {
          q: "Who can use Kwati AI?",
          a: "Kwati AI is designed for a wide range of users including developers, data scientists, business professionals, students, and organizations of all sizes. We offer different tiers to suit individual needs, startups, and enterprise requirements.",
          tags: ["users", "access"]
        },
        {
          q: "Do I need technical skills to use Kwati AI?",
          a: "Not necessarily! While developers can leverage our API and advanced features, we provide user-friendly interfaces and pre-built solutions that require no coding. Our platform is designed to be accessible to both technical and non-technical users.",
          tags: ["technical", "accessibility"]
        },
        {
          q: "How does Kwati AI differ from other AI platforms?",
          a: "Kwati AI stands out with our focus on real-time processing, high accuracy, customizable models, and enterprise-grade security. We offer unique features like multi-model orchestration, advanced analytics dashboards, and seamless integration capabilities.",
          tags: ["comparison", "features"]
        }
      ]
    },
    {
      id: "features",
      title: "Features & Capabilities",
      icon: Zap,
      color: "bg-purple-100 text-purple-600",
      questions: [
        {
          q: "What AI models does Kwati AI support?",
          a: "We support a wide range of models including GPT-4, Claude, Llama, and our proprietary Kwati models. You can also bring your own models or fine-tune existing ones on our platform.",
          tags: ["models", "technology"]
        },
        {
          q: "Can I train custom AI models?",
          a: "Yes! Kwati AI provides comprehensive tools for training custom models with your own data. Our platform supports transfer learning, fine-tuning, and full model training with GPU acceleration.",
          tags: ["custom", "training"]
        },
        {
          q: "What file formats are supported?",
          a: "We support PDF, DOCX, TXT, CSV, JSON, images, and audio files. Our OCR and transcription capabilities can extract text from various formats automatically.",
          tags: ["files", "formats"]
        },
        {
          q: "Is there an API available?",
          a: "Absolutely! We provide a RESTful API with comprehensive documentation and SDKs for Python, JavaScript, and other popular languages. Our API includes rate limiting, webhooks, and real-time streaming.",
          tags: ["api", "developers"]
        },
        {
          q: "Do you offer real-time processing?",
          a: "Yes, our platform supports real-time AI inference with low latency. We guarantee response times under 500ms for standard requests and offer dedicated infrastructure for time-sensitive applications.",
          tags: ["real-time", "performance"]
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      color: "bg-green-100 text-green-600",
      questions: [
        {
          q: "How is my data protected?",
          a: "We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. All data is stored in SOC 2 compliant data centers with regular security audits and penetration testing.",
          tags: ["security", "encryption"]
        },
        {
          q: "Is my data used for training?",
          a: "By default, we do not use your data to train our models without explicit consent. You can control data usage preferences in your account settings and sign Data Processing Agreements for enterprise plans.",
          tags: ["privacy", "training"]
        },
        {
          q: "Do you comply with GDPR and other regulations?",
          a: "Yes, we are fully GDPR compliant and adhere to CCPA, HIPAA (for healthcare customers), and other international data protection regulations. We offer data residency options for different regions.",
          tags: ["compliance", "gdpr"]
        },
        {
          q: "Can I delete my data permanently?",
          a: "Yes, you can delete your data at any time through the dashboard or by contacting support. We provide data export tools before deletion and follow strict data retention policies.",
          tags: ["deletion", "data-management"]
        }
      ]
    },
    {
      id: "pricing",
      title: "Pricing & Billing",
      icon: CreditCard,
      color: "bg-amber-100 text-amber-600",
      questions: [
        {
          q: "What's included in the free tier?",
          a: "Our free tier includes 1000 AI calls per month, access to basic models, 5GB storage, and community support. It's perfect for testing and small projects.",
          tags: ["free", "limits"]
        },
        {
          q: "How does billing work?",
          a: "We offer monthly and annual billing options. You're billed based on usage (API calls, compute time, storage) with predictable pricing. All major credit cards and enterprise invoicing are supported.",
          tags: ["billing", "payment"]
        },
        {
          q: "Can I upgrade or downgrade my plan?",
          a: "Yes, you can change plans at any time. Upgrades take effect immediately with pro-rated billing. Downgrades apply at the next billing cycle.",
          tags: ["plans", "changes"]
        },
        {
          q: "Do you offer discounts for startups or nonprofits?",
          a: "Yes! We offer special discounts for startups, educational institutions, and nonprofit organizations. Contact our sales team for eligibility details.",
          tags: ["discounts", "special"]
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: Settings,
      color: "bg-red-100 text-red-600",
      questions: [
        {
          q: "What's your API rate limit?",
          a: "Free tier: 10 requests per minute. Pro: 100 RPM. Business: 1000 RPM. Enterprise: Custom limits based on your needs. We also offer burst capacity for spikes in traffic.",
          tags: ["api", "limits"]
        },
        {
          q: "How do I handle API errors?",
          a: "Our API returns standard HTTP status codes with detailed error messages. We provide comprehensive error handling guides and SDKs with built-in retry logic.",
          tags: ["errors", "troubleshooting"]
        },
        {
          q: "What's your uptime SLA?",
          a: "We guarantee 99.9% uptime for all paid plans, with 99.99% available for enterprise customers. Our status page provides real-time system updates.",
          tags: ["uptime", "reliability"]
        },
        {
          q: "Do you provide webhooks?",
          a: "Yes! Webhooks are available on all paid plans. You can configure webhooks for various events including job completion, errors, and usage alerts.",
          tags: ["webhooks", "integration"]
        }
      ]
    },
    {
      id: "integration",
      title: "Integration & API",
      icon: Puzzle,
      color: "bg-indigo-100 text-indigo-600",
      questions: [
        {
          q: "What platforms can I integrate with?",
          a: "We offer native integrations with popular platforms like Slack, Discord, Microsoft Teams, Salesforce, Zapier, and more. Our API makes it easy to connect with any platform.",
          tags: ["integrations", "connectivity"]
        },
        {
          q: "Is there a mobile SDK?",
          a: "Yes! We provide iOS and Android SDKs for mobile app integration. The SDKs handle authentication, caching, and offline capabilities.",
          tags: ["mobile", "sdk"]
        },
        {
          q: "Can I use Kwati AI with my existing infrastructure?",
          a: "Absolutely. Our platform supports hybrid deployments, on-premise installations (Enterprise), and can integrate with your existing data pipelines and cloud services.",
          tags: ["hybrid", "infrastructure"]
        },
        {
          q: "How do I migrate from another AI service?",
          a: "We provide migration tools and expert support to help you transition smoothly. Our team can assist with data migration, API compatibility, and deployment strategies.",
          tags: ["migration", "transition"]
        }
      ]
    }
  ];

  const popularQuestions = [
    "How do I get started?",
    "Is there a free trial?",
    "What makes Kwati AI different?",
    "How secure is my data?",
    "Can I cancel anytime?",
    "What languages are supported?",
    "How accurate are the AI models?",
    "Do you offer enterprise support?"
  ];

  const filteredFAQs = searchQuery 
    ? faqCategories.flatMap(category => 
        category.questions.filter(q => 
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        ).map(q => ({ ...q, category: category.title }))
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-purple-600">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about Kwati AI. Can't find what you're looking for? 
            <a href="#contact" className="text-primary hover:underline ml-1">Contact our team.</a>
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="Search questions, topics, or keywords..."
                className="pl-12 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div className="absolute z-10 w-full bg-white dark:bg-gray-900 border rounded-lg shadow-lg mt-1">
                {filteredFAQs.length > 0 ? (
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {filteredFAQs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => {
                          const element = document.getElementById(`category-${faq.category.toLowerCase().replace(/\s+/g, '-')}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{faq.q}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {faq.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {faq.a.substring(0, 60)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Popular Questions */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {popularQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setSearchQuery(question.replace('?', ''))}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <Card className="lg:col-span-1 h-fit sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {faqCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => {
                      document.getElementById(`category-${category.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <category.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{category.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.questions.length} questions
                      </p>
                    </div>
                  </Button>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Need more help?</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="/developer-docs">
                      <MessageSquare className="h-4 w-4" />
                      Documentation
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="/tutorials">
                      <Code className="h-4 w-4" />
                      Tutorials
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href="/community">
                      <Users className="h-4 w-4" />
                      Community
                    </a>
                  </Button>
                  <Button className="w-full gap-2" asChild>
                    <a href="#contact">
                      <Mail className="h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Results View */}
            {searchQuery && filteredFAQs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search Results for "{searchQuery}"
                  </CardTitle>
                  <CardDescription>
                    {filteredFAQs.length} questions found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`search-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 mt-1">
                              <HelpCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{faq.q}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-12 pr-4">
                            <p className="text-muted-foreground mb-4">{faq.a}</p>
                            <div className="flex gap-2">
                              {faq.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Category View */}
            {!searchQuery && faqCategories.map((category) => (
              <Card key={category.id} id={`category-${category.id}`} className="scroll-mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>
                        {category.questions.length} questions about {category.title.toLowerCase()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 mt-1 flex-shrink-0">
                              <HelpCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-left">{faq.q}</p>
                              <div className="flex gap-2 mt-2">
                                {faq.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-12 pr-4 space-y-4">
                            <p className="text-muted-foreground">{faq.a}</p>
                            {index === 0 && category.id === "general" && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Pro Tip</p>
                                    <p className="text-sm text-muted-foreground">
                                      Check out our <a href="/getting-started" className="text-blue-600 hover:underline">Getting Started guide</a> for step-by-step tutorials.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {/* Quick Start Guide */}
            {!searchQuery && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription>
                    New to Kwati AI? Follow these steps to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="developer" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="developer">Developers</TabsTrigger>
                      <TabsTrigger value="business">Business Users</TabsTrigger>
                      <TabsTrigger value="student">Students</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="developer" className="space-y-4">
                      {[
                        { step: 1, title: "Sign Up & Get API Key", desc: "Create account and generate your first API key" },
                        { step: 2, title: "Explore Documentation", desc: "Check our API reference and SDKs" },
                        { step: 3, title: "Run First Query", desc: "Make your first API call with our examples" },
                        { step: 4, title: "Integrate & Deploy", desc: "Add Kwati AI to your applications" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="p-2 rounded-full bg-primary text-white font-bold">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="business" className="space-y-4">
                      {[
                        { step: 1, title: "Schedule Demo", desc: "See Kwati AI in action with our team" },
                        { step: 2, title: "Free Trial", desc: "Test with your own data and workflows" },
                        { step: 3, title: "Plan Selection", desc: "Choose the right plan for your needs" },
                        { step: 4, title: "Onboarding", desc: "Get expert setup and training" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="p-2 rounded-full bg-purple-600 text-white font-bold">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="student" className="space-y-4">
                      {[
                        { step: 1, title: "Educational Access", desc: "Get free educational credits" },
                        { step: 2, title: "Learning Resources", desc: "Access tutorials and course materials" },
                        { step: 3, title: "Project Setup", desc: "Start your first AI project" },
                        { step: 4, title: "Community Support", desc: "Join our student community" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="p-2 rounded-full bg-green-600 text-white font-bold">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Still Need Help? */}
            <Card id="contact" className="scroll-mt-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-primary to-purple-600">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Still have questions?</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Our support team is here to help you get the most out of Kwati AI.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Card className="border-primary/20">
                      <CardContent className="p-6 text-center">
                        <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Email Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get detailed responses within 24 hours
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="mailto:support@kwati.ai">support@kwati.ai</a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                      <CardContent className="p-6 text-center">
                        <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Live Chat</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Available 9am-6pm EST, Monday-Friday
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/chat">Start Chat</a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                      <CardContent className="p-6 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Community</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ask questions and share knowledge
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/community">Join Community</a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      Check our <a href="/status" className="text-primary hover:underline">system status</a> for real-time updates on platform availability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
