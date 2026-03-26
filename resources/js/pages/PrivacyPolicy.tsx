import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Lock, 
  Eye, 
  Download, 
  Mail, 
  Globe, 
  Users,
  Server,
  Bell,
  FileText,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ChevronUp
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function PrivacyAndPolicyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigationItems = [
    { id: "introduction", label: "Introduction", icon: FileText },
    { id: "collection", label: "Data Collection", icon: Server },
    { id: "usage", label: "Data Usage", icon: Users },
    { id: "security", label: "Security", icon: Lock },
    { id: "sharing", label: "Data Sharing", icon: Globe },
    { id: "rights", label: "Your Rights", icon: Eye },
    { id: "ai", label: "AI Specific", icon: Server },
    { id: "children", label: "Children's Privacy", icon: Users },
    { id: "contact", label: "Contact Us", icon: Mail },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full w-10 h-10 bg-background/80 backdrop-blur-sm"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
            <div className="h-full overflow-y-auto p-6 pt-16">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-lg py-6"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">
                  Related Documents
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="lg" className="w-full justify-start" asChild>
                    <Link href="/terms">
                      Terms of Service
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full justify-start" asChild>
                    <Link href="/cookies">
                      Cookie Policy
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full justify-start" asChild>
                    <Link href="/security">
                      Security Policy
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
              <FileText className="h-3 w-3" />
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
              <CheckCircle2 className="h-3 w-3" />
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
              <Server className="h-3 w-3" />
              Data Encrypted
            </Badge>
          </div>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Your privacy is our priority. Learn how Kwati AI collects, uses, and protects your data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Navigation Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sm"
                        onClick={() => scrollToSection(item.id)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Related Documents
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/terms">
                        Terms of Service
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/cookies">
                        Cookie Policy
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/security">
                        Security Policy
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)]">
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                  {/* Introduction */}
                  <section id="introduction" className="scroll-mt-16 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">1. Introduction</h2>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Welcome to Kwati AI. This Privacy Policy explains how we collect, use, disclose, 
                      and safeguard your information when you use our artificial intelligence services.
                    </p>
                    <div className="bg-primary/5 p-3 sm:p-4 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">Important Notice</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            By using Kwati AI, you agree to the collection and use of information in 
                            accordance with this policy. Please review it carefully.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Data Collection */}
                  <section id="collection" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Server className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">2. Information We Collect</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-2 sm:pb-3">
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              Email address and contact details
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              Account credentials
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              Billing and payment information
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-2 sm:pb-3">
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Server className="h-3 w-3 sm:h-4 sm:w-4" />
                            Usage Data
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                              IP address and device information
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                              AI interaction data
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                              Performance and error logs
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  <Separator />

                  {/* Data Usage */}
                  <section id="usage" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">3. How We Use Your Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { title: "Service Delivery", desc: "Provide and improve AI services" },
                        { title: "Personalization", desc: "Customize your experience" },
                        { title: "Communication", desc: "Send updates and support" },
                        { title: "Security", desc: "Protect against misuse" },
                        { title: "AI Improvement", desc: "Train and enhance models" },
                        { title: "Legal Compliance", desc: "Meet regulatory requirements" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-card border rounded-lg">
                          <div className="p-1 sm:p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">{item.title}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Security */}
                  <section id="security" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">4. Data Security</h2>
                    </div>
                    
                    <Card className="border-red-200 dark:border-red-800">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                            <h3 className="text-base sm:text-lg font-semibold">Security Measures</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[
                              "End-to-end encryption",
                              "Regular security audits",
                              "Access controls",
                              "Secure data centers",
                              "Two-factor authentication",
                              "Continuous monitoring"
                            ].map((measure, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{measure}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Data Sharing */}
                  <section id="sharing" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">5. Data Sharing & Disclosure</h2>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">We Never Sell Your Data</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Kwati AI does not sell, trade, or rent your personal information to third parties.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                      {[
                        {
                          title: "Service Providers",
                          desc: "Trusted partners under strict agreements",
                          type: "necessary"
                        },
                        {
                          title: "Legal Requirements",
                          desc: "When required by law or regulation",
                          type: "legal"
                        },
                        {
                          title: "Business Transfers",
                          desc: "Mergers, acquisitions, or asset sales",
                          type: "business"
                        }
                      ].map((item, index) => (
                        <Card key={index} className="border-yellow-200 dark:border-yellow-800">
                          <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Your Rights */}
                  <section id="rights" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">6. Your Rights & Choices</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { right: "Access", icon: Eye, color: "bg-indigo-100 text-indigo-600" },
                        { right: "Correction", icon: FileText, color: "bg-blue-100 text-blue-600" },
                        { right: "Deletion", icon: "trash", color: "bg-red-100 text-red-600" },
                        { right: "Export", icon: Download, color: "bg-green-100 text-green-600" },
                        { right: "Opt-out", icon: Bell, color: "bg-yellow-100 text-yellow-600" },
                        { right: "Object", icon: AlertCircle, color: "bg-purple-100 text-purple-600" },
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center justify-center p-3 border rounded-lg text-center">
                          <div className={`p-2 sm:p-3 rounded-full ${item.color} mb-2 sm:mb-3`}>
                            {typeof item.icon === 'string' ? (
                              <span className="font-bold text-sm">!</span>
                            ) : (
                              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>
                          <h3 className="font-semibold text-xs sm:text-sm">{item.right}</h3>
                          <p className="text-xs text-muted-foreground mt-1 hidden xs:block">
                            Request your data {item.right.toLowerCase()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm">
                        To exercise your rights, contact us at{" "}
                        <a href="mailto:privacy@kwatiai.com" className="text-primary hover:underline font-medium">
                          privacy@kwatiai.com
                        </a>
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* AI Specific */}
                  <section id="ai" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-primary to-purple-600">
                        <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">7. AI-Specific Considerations</h2>
                    </div>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg">AI Training & Model Improvement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                          <p className="text-muted-foreground text-sm sm:text-base">
                            Your interactions with Kwati AI help us improve our models. We:
                          </p>
                          <ul className="space-y-1.5 sm:space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Anonymize data before training</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Allow opt-out from model training</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Protect sensitive business information</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  <Separator />

                  {/* Children's Privacy */}
                  <section id="children" className="scroll-mt-16 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold">8. Children's Privacy</h2>
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Age Restriction</p>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                              Kwati AI is not intended for children under 13. We do not knowingly collect 
                              data from children under 13.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Contact */}
                  <section id="contact" className="scroll-mt-16 space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-primary to-blue-600">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">9. Contact Us</h2>
                    </div>

                    <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                      <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Privacy Team</h3>
                              <a 
                                href="mailto:privacy@kwatiai.com" 
                                className="text-primary hover:underline flex items-center gap-2 text-sm sm:text-base"
                              >
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                privacy@kwatiai.com
                              </a>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Data Protection Officer</h3>
                              <a 
                                href="mailto:dpo@kwatiai.com" 
                                className="text-primary hover:underline flex items-center gap-2 text-sm sm:text-base"
                              >
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                dpo@kwatiai.com
                              </a>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4 sm:my-6" />

                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            We typically respond to privacy inquiries within 48 hours.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Footer */}
                  <div className="pt-6 sm:pt-8 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          © {new Date().getFullYear()} Kwati AI. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Version 2.1 • Last reviewed {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                          <Link href="/terms">
                            Terms of Service
                          </Link>
                        </Button>
                        <Button size="sm" onClick={() => scrollToSection('introduction')}>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Back to Top
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile Footer Links */}
                    <div className="flex flex-wrap gap-2 mt-4 sm:hidden">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/terms">
                          Terms
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/cookies">
                          Cookies
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/security">
                          Security
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}