import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Database, Share2, Lock, Mail } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg--to-b from--50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text--900 mb-4">Privacy Policy</h1>
          <p className="text-xl text--600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <Badge variant="secondary" className="mt-4">
            Last updated: {new Date().getFullYear()}
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Information Collection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-600" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
              <CardDescription>
                What data we collect and why we collect it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text--900">Personal Information</h4>
                  <ul className="text-sm text--600 space-y-1 list-disc list-inside">
                    <li>Email address</li>
                    <li>Name and profile information</li>
                    <li>Account preferences</li>
                    <li>Communication history</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text--900">Usage Data</h4>
                  <ul className="text-sm text--600 space-y-1 list-disc list-inside">
                    <li>IP address and browser type</li>
                    <li>Pages visited and features used</li>
                    <li>API usage and request logs</li>
                    <li>Error reports and diagnostics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-green-600" />
                <CardTitle>How We Use Your Data</CardTitle>
              </div>
              <CardDescription>
                The purposes for which we process your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="text-center p-4 rounded-lg border border--200 bg-white">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Service Delivery</h4>
                    <p className="text-sm text--600">Provide and maintain our AI services</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border border--200 bg-white">
                    <Share2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Improvements</h4>
                    <p className="text-sm text--600">Enhance and optimize our platform</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border border--200 bg-white">
                    <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Security</h4>
                    <p className="text-sm text--600">Protect against abuse and fraud</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Share2 className="h-6 w-6 text-orange-600" />
                <CardTitle>Data Sharing</CardTitle>
              </div>
              <CardDescription>
                When and with whom we share your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">We Do Not Sell Your Data</h4>
                  <p className="text-sm text-amber-800">
                    We never sell your personal information to third parties. We only share data when necessary for service provision or when required by law.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text--900">Limited Sharing Circumstances:</h4>
                  <ul className="text-sm text--600 space-y-2 list-disc list-inside">
                    <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform</li>
                    <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
                    <li><strong>Consent:</strong> When you explicitly give us permission</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-purple-600" />
                <CardTitle>Data Protection</CardTitle>
              </div>
              <CardDescription>
                How we keep your information secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text--900">Security Measures</h4>
                    <ul className="text-sm text--600 space-y-1">
                      <li>• Encryption in transit and at rest</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and authentication</li>
                      <li>• Secure data centers</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text--900">Your Rights</h4>
                    <ul className="text-sm text--600 space-y-1">
                      <li>• Access your personal data</li>
                      <li>• Correct inaccurate information</li>
                      <li>• Delete your account and data</li>
                      <li>• Export your data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies & Tracking</CardTitle>
              <CardDescription>
                How we use cookies and similar technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text--600">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                  Cookies are files with a small amount of data which may include an anonymous unique identifier.
                </p>
                <div className="bg--50 rounded-lg p-4">
                  <h4 className="font-semibold text--900 mb-2">Types of Cookies We Use:</h4>
                  <ul className="text-sm text--600 space-y-1 list-disc list-inside">
                    <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact</li>
                    <li><strong>Security Cookies:</strong> Used for security purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                How to reach us with privacy concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text--600">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Privacy Team</h4>
                  <p className="text-sm text-blue-800">
                    Email: privacy@kwatiai.com<br />
                    Response Time: Within 48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">Policy Updates</CardTitle>
              <CardDescription className="text-amber-800">
                How we notify you of changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to
                review this Privacy Policy periodically for any changes.
              </p>
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
