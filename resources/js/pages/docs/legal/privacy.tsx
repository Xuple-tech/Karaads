// app/privacy/page.tsx
import { LegalLayout } from "@/layouts/legal-layout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "January 1, 2024";

  return (
    <LegalLayout title="Privacy Policy" lastUpdated={lastUpdated}>
      {/* Executive Summary */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 mb-8">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold">Your Privacy Matters</h3>
            <p className="text-muted-foreground mt-1">
              This Privacy Policy explains how Kwai AI collects, uses, discloses, and safeguards 
              your information when you use our services. We're committed to protecting your 
              personal data and your right to privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <Lock className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <h4 className="font-medium">End-to-End Encryption</h4>
            <p className="text-sm text-muted-foreground mt-1">
              All data in transit is encrypted using TLS 1.2+ protocols
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <Eye className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-medium">Transparent Processing</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Clear disclosure of how and why we process your data
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Main Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials and profile information</li>
                <li>Payment and billing information</li>
                <li>Communication preferences</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Usage Data</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>API usage patterns and request logs</li>
                <li>Device information and IP addresses</li>
                <li>Browser type and operating system</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">AI Processing Data</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Conversation logs with AI agents</li>
                <li>Training data (anonymized and aggregated)</li>
                <li>Model improvement data</li>
                <li>Analytics and performance metrics</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <div className="grid gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Service Delivery</h3>
              <p className="text-muted-foreground">
                To provide, operate, and maintain our AI services, including processing API requests, 
                managing your account, and delivering AI responses.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Improvement & Innovation</h3>
              <p className="text-muted-foreground">
                To enhance and develop our AI models, improve service performance, 
                and develop new features while maintaining user privacy.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Security & Compliance</h3>
              <p className="text-muted-foreground">
                To protect against fraud, unauthorized access, and security threats, 
                and to comply with legal obligations and enforce our terms.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Data Sharing & Disclosure</h2>
          <div className="p-6 rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <div className="flex items-start gap-4">
              <Database className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
              <div>
                <h3 className="font-semibold">We Do Not Sell Your Data</h3>
                <p className="mt-2">
                  Kwai AI does not and will never sell your personal information to third parties. 
                  We only share data under the following limited circumstances:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-1">
                  <li>With your explicit consent</li>
                  <li>With service providers who assist our operations (under strict contracts)</li>
                  <li>With upstream AI or infrastructure providers when required to process your requests</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect rights and safety of our users</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <div className="space-y-4">
            <p>
              We implement industry-standard security measures including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="text-lg font-semibold">AES-256</div>
                <div className="text-sm text-muted-foreground">Encryption at Rest</div>
              </div>
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="text-lg font-semibold">TLS 1.3</div>
                <div className="text-sm text-muted-foreground">Encryption in Transit</div>
              </div>
              <div className="text-center p-4 rounded-lg border bg-card">
                <div className="text-lg font-semibold">SOC 2</div>
                <div className="text-sm text-muted-foreground">Compliance Certified</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Your Rights & Choices</h2>
          <div className="space-y-4">
            <p>Depending on your location, you may have the following rights:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Right to access your personal data",
                "Right to rectification of inaccurate data",
                "Right to deletion of your data",
                "Right to restrict processing",
                "Right to data portability",
                "Right to object to processing",
                "Right to withdraw consent",
                "Right to lodge complaints"
              ].map((right, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{right}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Contact Information</h2>
          <div className="p-6 rounded-xl border bg-card">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Data Protection Officer</h3>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:dpo@kwai.ai" className="text-primary hover:underline">dpo@kwai.ai</a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Privacy Concerns</h3>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:privacy@kwai.ai" className="text-primary hover:underline">privacy@kwai.ai</a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Physical Address</h3>
                <p className="text-muted-foreground">
                  Kwai AI Inc.<br />
                  123 AI Innovation Drive<br />
                  San Francisco, CA 94107<br />
                  United States
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild>
                <a href="mailto:privacy@kwai.ai">Contact Privacy Team</a>
              </Button>
            </div>
          </div>
        </section>

        <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg bg-card">
          <p>
            This Privacy Policy may be updated periodically. We will notify you of any material 
            changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
