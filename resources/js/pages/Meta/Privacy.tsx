import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, Users, Database, Mail } from "lucide-react";

export default function PrivacyAndPolicy() {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy & Terms</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn how we protect your data and ensure transparency in our AI-powered automation services
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
            </TabsTrigger>
          </TabsList>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-blue-600" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  Last updated: {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Summary</h3>
                  <p className="text-blue-800 text-sm">
                    We only access data necessary for automation, never store your login credentials,
                    and use enterprise-grade security to protect your information.
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {/* Data Collection */}
                  <AccordionItem value="data-collection">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        What Data We Collect
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">Facebook</Badge>
                          <span>Public profile info, page access (with permission), basic insights</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">Instagram</Badge>
                          <span>Profile data, post analytics, messaging capabilities</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">WhatsApp</Badge>
                          <span>Business account data, message templates, contact lists</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          * We only access data you explicitly grant permission for
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Data Usage */}
                  <AccordionItem value="data-usage">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        How We Use Your Data
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Power AI automation and personalized responses</li>
                        <li>Generate insights and analytics for your accounts</li>
                        <li>Schedule and manage content across platforms</li>
                        <li>Provide customer support and improve our services</li>
                        <li>Ensure compliance with platform policies</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Data Protection */}
                  <AccordionItem value="data-protection">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Data Protection & Security
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <h4 className="font-semibold text-green-800">Encryption</h4>
                          <p className="text-green-700">All data encrypted in transit and at rest</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <h4 className="font-semibold text-green-800">Access Controls</h4>
                          <p className="text-green-700">Strict role-based access to user data</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <h4 className="font-semibold text-green-800">No Credential Storage</h4>
                          <p className="text-green-700">We never store your platform login credentials</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Third Party Sharing */}
                  <AccordionItem value="sharing">
                    <AccordionTrigger className="text-left">
                      Third Party Data Sharing
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>We do not sell your personal data to third parties. We only share data with:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Meta Platforms (as required for API integration)</li>
                          <li>AI service providers (OpenAI, Anthropic, etc.) for processing</li>
                          <li>Legal authorities when required by law</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* User Rights */}
                  <AccordionItem value="rights">
                    <AccordionTrigger className="text-left">
                      Your Rights & Controls
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3 text-sm text-gray-700">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Access your data</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Export your data</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Delete your data</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Revoke platform access</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Important Notes</h4>
                  <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                    <li>You can disconnect platforms anytime from your account settings</li>
                    <li>We comply with Meta's Platform Terms and Developer Policies</li>
                    <li>AI responses are generated based on your connected account data</li>
                    <li>We regularly audit our security practices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service Tab */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Terms of Service
                </CardTitle>
                <CardDescription>
                  Last updated: {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {/* Account Terms */}
                  <AccordionItem value="account">
                    <AccordionTrigger className="text-left">
                      Account Terms & Responsibilities
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>By using our service, you agree to:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Provide accurate account information</li>
                          <li>Maintain security of your login credentials</li>
                          <li>Comply with all connected platform terms (Meta, WhatsApp, Instagram)</li>
                          <li>Use automation features responsibly and ethically</li>
                          <li>Not engage in spam, harassment, or illegal activities</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Service Usage */}
                  <AccordionItem value="service-usage">
                    <AccordionTrigger className="text-left">
                      Acceptable Use Policy
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 text-sm text-gray-700">
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <h4 className="font-semibold text-red-800">Prohibited Activities</h4>
                          <ul className="text-red-700 list-disc list-inside mt-2 space-y-1">
                            <li>Spamming or bulk messaging without consent</li>
                            <li>Spreading misinformation or harmful content</li>
                            <li>Impersonating others or fraudulent activities</li>
                            <li>Circumventing platform rate limits or restrictions</li>
                            <li>Data scraping or unauthorized data collection</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* AI & Automation */}
                  <AccordionItem value="ai-automation">
                    <AccordionTrigger className="text-left">
                      AI & Automation Terms
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>Our AI-powered automation:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Generates content based on your connected account data</li>
                          <li>May make mistakes - always review AI-generated content</li>
                          <li>Should not be used for critical or sensitive decisions</li>
                          <li>Is subject to the limitations of underlying AI models</li>
                          <li>Requires human oversight and responsibility</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Liability */}
                  <AccordionItem value="liability">
                    <AccordionTrigger className="text-left">
                      Liability & Limitations
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>Important limitations:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>We are not responsible for platform policy changes</li>
                          <li>Service availability is not guaranteed 100%</li>
                          <li>You are responsible for content posted via our service</li>
                          <li>AI-generated content should be reviewed before posting</li>
                          <li>We reserve the right to suspend accounts violating terms</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Termination */}
                  <AccordionItem value="termination">
                    <AccordionTrigger className="text-left">
                      Service Termination
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>We may suspend or terminate service for:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Violation of these terms or platform policies</li>
                          <li>Unauthorized or fraudulent use</li>
                          <li>Legal requirements or regulatory actions</li>
                          <li>Non-payment of applicable fees</li>
                        </ul>
                        <p>You may terminate service at any time by disconnecting platforms and deleting your account.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Questions?</h4>
                      <p className="text-blue-800 text-sm">
                        Contact our privacy team at privacy@yourapp.com for any questions about these terms or your data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1">
                    Download PDF
                  </Button>
                  <Button className="flex-1">
                    I Understand & Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
