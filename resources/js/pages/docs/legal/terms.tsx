// app/terms/page.tsx
import { LegalLayout } from "@/layouts/legal-layout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "January 1, 2024";

  return (
    <LegalLayout title="Terms of Service" lastUpdated={lastUpdated}>
      {/* Important Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Important Notice</h3>
            <p className="text-amber-700 dark:text-amber-400 mt-2">
              By accessing or using Kwai AI services, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our services.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 rounded-xl border bg-card">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h4 className="font-semibold">Acceptable Use</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Guidelines for proper service usage
          </p>
        </div>
        <div className="text-center p-6 rounded-xl border bg-card">
          <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h4 className="font-semibold">Service Terms</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Rights, responsibilities, and limitations
          </p>
        </div>
        <div className="text-center p-6 rounded-xl border bg-card">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <h4 className="font-semibold">Prohibited Activities</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Actions that violate our terms
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Main Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
          <div className="space-y-4">
            <p>
              These Terms of Service constitute a legally binding agreement made between you, 
              whether personally or on behalf of an entity ("you") and Kwai AI Inc. ("Company," "we," "us," or "our"), 
              concerning your access to and use of our AI services.
            </p>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm">
                <strong>By accessing our services, you:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Confirm you are at least 18 years old or have parental consent</li>
                  <li>Agree to comply with all applicable laws and regulations</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Acknowledge these terms may be updated periodically</li>
                </ul>
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
          <div className="space-y-4">
            <p>
              Kwai AI provides artificial intelligence services including but not limited to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "AI conversational agents for websites",
                "Language model API access",
                "AI model training and fine-tuning",
                "Natural language processing services",
                "Speech-to-text and text-to-speech services",
                "AI-powered analytics and insights"
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <p className="text-sm">
                <strong>Note:</strong> Our services are provided "as is" and we reserve the right to modify, 
                suspend, or discontinue any service at any time without prior notice.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/20">
              <p className="text-sm">
                <strong>Upstream Infrastructure:</strong> Some services, including the developer API, may rely on third-party
                infrastructure or upstream model providers. Kwai AI remains your contractual service provider for the branded API experience.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Account Security</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
            
            <h3 className="font-semibold mt-6">Content Guidelines</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>You retain ownership of your input data but grant us license to process it</li>
              <li>You are responsible for the content you provide to our AI services</li>
              <li>You must ensure your content complies with applicable laws</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Acceptable Use Policy</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Permitted Uses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Customer support automation",
                  "Content generation and editing",
                  "Educational applications",
                  "Research and development",
                  "Business process automation",
                  "Creative writing assistance"
                ].map((use, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{use}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Prohibited Uses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Illegal activities or content",
                  "Harassment or abuse",
                  "Generating harmful code or malware",
                  "Creating fake or misleading information",
                  "Spam or unsolicited communications",
                  "Bypassing security measures",
                  "Violating intellectual property rights",
                  "High-risk decision making without human oversight"
                ].map((prohibition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{prohibition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Our Rights</h3>
              <p className="text-muted-foreground">
                All intellectual property rights in our services, including software, algorithms, 
                models, and documentation, are owned by or licensed to Kwai AI.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <p className="text-muted-foreground">
                You retain ownership of your input data. AI-generated output is provided for your use 
                under the terms of your subscription plan.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">License Grant</h3>
              <p className="text-muted-foreground">
                We grant you a limited, non-exclusive, non-transferable license to use our services 
                in accordance with these terms.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Payment & Billing</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card text-center">
                <div className="text-lg font-semibold">Pay-as-you-go</div>
                <div className="text-sm text-muted-foreground">Usage-based billing</div>
              </div>
              <div className="p-4 rounded-lg border bg-card text-center">
                <div className="text-lg font-semibold">Subscription</div>
                <div className="text-sm text-muted-foreground">Monthly/Annual plans</div>
              </div>
              <div className="p-4 rounded-lg border bg-card text-center">
                <div className="text-lg font-semibold">Enterprise</div>
                <div className="text-sm text-muted-foreground">Custom pricing</div>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Important Billing Terms</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>All fees are non-refundable unless required by law</li>
                <li>Prices may change with 30 days notice</li>
                <li>Late payments may result in service suspension</li>
                <li>Taxes are not included unless specified</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
          <div className="p-6 rounded-xl border bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-3">
              <p>
                <strong>To the maximum extent permitted by law:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Our services are provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Total liability is limited to the amount you paid in the last 12 months</li>
                <li>We are not responsible for third-party content or services</li>
                <li>AI outputs may contain inaccuracies - use at your own discretion</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">By You</h3>
              <p className="text-muted-foreground">
                You may terminate your account at any time by contacting support or using account 
                settings. Termination does not entitle you to refunds.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">By Us</h3>
              <p className="text-muted-foreground">
                We may suspend or terminate your access for violation of these terms, 
                non-payment, or for any reason with 30 days notice.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Governing Law & Disputes</h2>
          <div className="p-4 rounded-lg border bg-card">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">Governing Law</h3>
                <p className="text-muted-foreground">
                  These terms are governed by the laws of California, United States, 
                  without regard to conflict of law principles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Dispute Resolution</h3>
                <p className="text-muted-foreground">
                  Disputes shall be resolved through binding arbitration in San Francisco, CA, 
                  rather than in court.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Contact for Disputes</h3>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:legal@kwatiai.com" className="text-primary hover:underline">legal@kwatiai.com</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
          <div className="p-6 rounded-xl border bg-card">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Legal Department</h3>
                <p className="text-muted-foreground">
                  Kwai AI Inc.<br />
                  Attn: Legal Department<br />
                  123 AI Innovation Drive<br />
                  San Francisco, CA 94107<br />
                  United States
                </p>
                <p className="mt-2">
                  Email: <a href="mailto:legal@kwatiai.com" className="text-primary hover:underline">legal@kwatiai.com</a>
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild>
                <a href="mailto:legal@kwatiai.com">Contact Legal Department</a>
              </Button>
            </div>
          </div>
        </section>

        <div className="text-center p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-primary/10">
          <p className="font-semibold">
            By using Kwai AI services, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
