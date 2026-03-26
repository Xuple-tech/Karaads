import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, AlertTriangle, Users, Cpu, Mail, Scale } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg--to-b from--50 to--100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <FileText className="h-12 w-12 text--700" />
          </div>
          <h1 className="text-4xl font-bold text--900 mb-4">Terms of Service</h1>
          <p className="text-xl text--600 max-w-2xl mx-auto">
            Please read these terms carefully before using KwatiAI services.
          </p>
          <Badge variant="secondary" className="mt-4">
            Effective: {new Date().getFullYear()}
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Acceptance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-blue-600" />
                <CardTitle>Acceptance of Terms</CardTitle>
              </div>
              <CardDescription>
                By accessing and using KwatiAI, you agree to these terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text--600">
                  By accessing and using the KwatiAI platform (the "Service"), you accept and agree to be bound
                  by the terms and provision of this agreement. If you do not agree to abide by these terms,
                  please do not use this service.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Important Notice</h4>
                  <p className="text-sm text-blue-800">
                    These terms constitute a legally binding agreement between you and KwatiAI.
                    We recommend reviewing them periodically for updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-green-600" />
                <CardTitle>Service Description</CardTitle>
              </div>
              <CardDescription>
                What KwatiAI provides and its intended use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">What We Provide</h4>
                    <ul className="text-sm text--600 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>AI-powered chat and conversation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Content generation and editing tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>File processing and analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>API access for developers</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">Service Limitations</h4>
                    <ul className="text-sm text--600 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span>AI responses may contain inaccuracies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Service availability not guaranteed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Usage limits may apply</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Content moderation in place</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600" />
                <CardTitle>User Responsibilities</CardTitle>
              </div>
              <CardDescription>
                Your obligations when using our service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg--50 rounded-lg p-4">
                  <h4 className="font-semibold text--900 mb-3">You Agree To:</h4>
                  <ul className="text-sm text--600 space-y-2 list-disc list-inside">
                    <li>Provide accurate registration information</li>
                    <li>Maintain the security of your account</li>
                    <li>Use the service in compliance with applicable laws</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not engage in abusive or harmful behavior</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Prohibited Activities</h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Illegal or fraudulent activities</li>
                    <li>Spamming or bulk messaging</li>
                    <li>Attempting to disrupt service</li>
                    <li>Sharing harmful or explicit content</li>
                    <li>Impersonating others</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-orange-600" />
                <CardTitle>Intellectual Property</CardTitle>
              </div>
              <CardDescription>
                Ownership and usage rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">Our Rights</h4>
                    <p className="text-sm text--600">
                      KwatiAI and its original content, features, and functionality are owned by KwatiAI
                      and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">Your Content</h4>
                    <p className="text-sm text--600">
                      You retain ownership of any content you create using our service. By using our service,
                      you grant us a license to process your content to provide the service.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitations & Disclaimers */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <CardTitle>Limitations & Disclaimers</CardTitle>
              </div>
              <CardDescription>
                Important limitations of our service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">AI Disclaimer</h4>
                  <p className="text-sm text-amber-800">
                    KwatiAI uses artificial intelligence to generate responses. These responses may contain
                    inaccuracies, biases, or outdated information. Always verify critical information from
                    authoritative sources.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text--900">Service "As Is"</h4>
                  <p className="text-sm text--600">
                    The service is provided on an "as is" and "as available" basis. KwatiAI makes no warranties,
                    expressed or implied, and hereby disclaims and negates all other warranties including, without
                    limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                    or non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text--900">Limitation of Liability</h4>
                  <p className="text-sm text--600">
                    In no event shall KwatiAI, nor its directors, employees, partners, agents, suppliers, or affiliates,
                    be liable for any indirect, incidental, special, consequential or punitive damages, including without
                    limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
              <CardDescription>
                When and how accounts may be terminated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">By You</h4>
                    <p className="text-sm text--600">
                      You may stop using our service at any time. You can also request deletion of your account
                      and associated data through your account settings.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text--900">By Us</h4>
                    <p className="text-sm text--600">
                      We may terminate or suspend your account immediately, without prior notice or liability,
                      for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
              <CardDescription>
                How we handle updates to these terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text--600">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                  If a revision is material, we will provide at least 30 days' notice prior to any new terms
                  taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
                <div className="bg--50 rounded-lg p-4">
                  <h4 className="font-semibold text--900 mb-2">Continued Use</h4>
                  <p className="text-sm text--600">
                    By continuing to access or use our Service after those revisions become effective,
                    you agree to be bound by the revised terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <CardTitle>Contact Information</CardTitle>
              </div>
              <CardDescription>
                How to reach us with questions about these terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text--600">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Legal Team</h4>
                  <p className="text-sm text-blue-800">
                    Email: legal@kwatiai.com<br />
                    Response Time: Within 5 business days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text--500">
          <p>© {new Date().getFullYear()} KwatiAI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
