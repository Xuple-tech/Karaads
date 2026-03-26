import { DocsLayout } from "@/layouts/docs-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Cpu, 
  Smartphone, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Rocket,
  Sparkles,
  Zap
} from "lucide-react";

export default function DocsIndex() {
  const features = [
    {
      id: 1,
      title: "AI Agent for Websites",
      description: "Intelligent conversational agents that can understand and respond to user queries on your website in real-time.",
      status: "active",
      icon: Globe,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      docsLink: "/docs/ai-agent",
      capabilities: [
        "Real-time conversation processing",
        "Context-aware responses",
        "Multi-language support",
        "Customizable personality",
        "Analytics dashboard"
      ]
    },
    {
      id: 2,
      title: "LLM API",
      description: "Direct access to powerful language models for building custom AI applications and workflows.",
      status: "upcoming",
      icon: Cpu,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      eta: "Q2 2024",
      capabilities: [
        "Multiple model support",
        "Fine-tuning capabilities",
        "Batch processing",
        "Streaming responses",
        "Cost optimization"
      ]
    },
    {
      id: 3,
      title: "Mobile App API for Agents",
      description: "Embed AI agents directly into mobile applications with native SDKs for iOS and Android.",
      status: "upcoming",
      icon: Smartphone,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      borderColor: "border-purple-500/20",
      eta: "Q3 2024",
      capabilities: [
        "Native iOS & Android SDKs",
        "Offline capabilities",
        "Push notifications",
        "Voice interaction",
        "Mobile-optimized UI"
      ]
    },
    {
      id: 4,
      title: "TTS & STT API",
      description: "High-quality Text-to-Speech and Speech-to-Text services for voice-enabled applications.",
      status: "upcoming",
      icon: MessageSquare,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      eta: "Q4 2024",
      capabilities: [
        "Natural-sounding voices",
        "Multiple languages & accents",
        "Real-time streaming",
        "Custom voice cloning",
        "Noise cancellation"
      ]
    }
  ];

  return (
    <DocsLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Next-generation AI Platform
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Kwati AI Documentation
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build intelligent applications with our comprehensive suite of AI tools. 
            Start with our AI Agent for websites and explore upcoming features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2">
              <Rocket className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              View API Reference
            </Button>
          </div>
        </section>

        <Separator />

        {/* Features Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Platform Features</h2>
              <p className="text-muted-foreground mt-2">
                Explore our current and upcoming AI capabilities
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Zap className="h-3 w-3" />
              {features.filter(f => f.status === "active").length} Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                    feature.status === "active" 
                      ? "hover:border-emerald-500/30" 
                      : "opacity-90 hover:opacity-100"
                  } ${feature.borderColor}`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {feature.status === "active" ? (
                      <Badge className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                        <CheckCircle className="h-3 w-3" />
                        Available Now
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-2">
                        <Clock className="h-3 w-3" />
                        Coming {feature.eta}
                      </Badge>
                    )}
                  </div>

                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className={`inline-flex p-3 rounded-lg ${feature.color}/10`}>
                          <Icon className={`h-6 w-6 ${feature.textColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Capabilities */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                        Key Capabilities
                      </h4>
                      <ul className="space-y-2">
                        {feature.capabilities.map((capability, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className={`h-1.5 w-1.5 rounded-full ${feature.color}`} />
                            {capability}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div>
                      {feature.status === "active" ? (
                        <Button className="w-full gap-2" variant="default">
                          View Documentation
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="w-full gap-2" variant="outline" disabled>
                          <Clock className="h-4 w-4" />
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Quick Start
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight">
              Start Building with AI Agent
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Get your AI Agent running on your website in under 5 minutes with our simple integration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Rocket className="h-5 w-5" />
                Quick Start Guide
              </Button>
              <Button size="lg" variant="outline">
                Explore Examples
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground mt-2">Uptime SLA</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold">50ms</div>
              <div className="text-sm text-muted-foreground mt-2">Response Time</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold">30+</div>
              <div className="text-sm text-muted-foreground mt-2">Languages</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground mt-2">Support</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Transform Your User Experience?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers building intelligent applications with Kwaiti AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}