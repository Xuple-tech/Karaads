import { Button } from '@/components/ui/button';
import { Head } from '@/components/page-head';
import { ArrowLeft } from 'lucide-react';

export default function CSAEPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="CSAE Policy" />

            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Child Safety Policy</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: December 31, 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold">
                            Our Commitment to Child Safety
                        </h2>
                        <p className="text-muted-foreground">
                            Karaads ("Company", "we", "our", or "us") is committed to creating a safe and
                            secure environment for all users, especially children and young people. We have
                            established comprehensive standards and policies to prevent Child Sexual Abuse
                            and Exploitation (CSAE) on our platform. This policy is published at
                            <strong> https://karaads.com/csae-policy</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Our Standards Against CSAE</h2>

                        <h3 className="text-lg font-semibold">1. Zero Tolerance Policy</h3>
                        <p className="text-muted-foreground">
                            Karaads maintains a zero-tolerance policy for any content, behavior, or activity
                            that sexualizes, exploits, or endangers children. We strictly prohibit:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Child Sexual Abuse Material (CSAM) in any form</li>
                            <li>Grooming, solicitation, or enticement of minors</li>
                            <li>Sexual exploitation or abuse imagery</li>
                            <li>Facilitating child trafficking or exploitation</li>
                            <li>Possession, distribution, or promotion of prohibited content</li>
                            <li>Any communication intended to exploit or harm children</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">2. Age Verification and Account Protection</h3>
                        <p className="text-muted-foreground">
                            We implement verification mechanisms to:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Verify user age during account creation and monetization access</li>
                            <li>Prevent underage users from accessing adult-only features</li>
                            <li>Protect minors from contact with predators through privacy controls</li>
                            <li>Restrict minor accounts from engaging in monetized content creation</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">3. Content Moderation and Monitoring</h3>
                        <p className="text-muted-foreground">
                            Our approach includes:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>24/7 automated and manual content moderation</li>
                            <li>Hash-matching technology to identify known CSAM</li>
                            <li>Machine learning models trained to detect suspicious activity patterns</li>
                            <li>Regular auditing of content and user behavior</li>
                            <li>Immediate removal of violating content</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">4. Reporting and Escalation</h3>
                        <p className="text-muted-foreground">
                            Users can report suspected CSAE content or behavior:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Through in-app reporting tools available on every post and user profile</li>
                            <li>Via email at abuse@karaads.com with details</li>
                            <li>All reports are reviewed within 24 hours</li>
                            <li>Confirmed violations are reported to law enforcement and the National Center for Missing & Exploited Children (NCMEC)</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">5. User Education and Resources</h3>
                        <p className="text-muted-foreground">
                            We provide:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Resources for parents and guardians on online safety</li>
                            <li>Information for young people on recognizing and reporting abuse</li>
                            <li>Links to trusted organizations like the Internet Watch Foundation and NCMEC</li>
                            <li>Tips for protecting personal information and privacy settings</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">6. Law Enforcement Cooperation</h3>
                        <p className="text-muted-foreground">
                            We actively cooperate with law enforcement agencies and child safety organizations:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Preserve evidence of suspected illegal activity</li>
                            <li>Respond to valid legal requests for user information</li>
                            <li>Participate in industry working groups on child safety</li>
                            <li>Report suspected CSAM to NCMEC's CyberTipline</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">7. Employee Training</h3>
                        <p className="text-muted-foreground">
                            All Karaads employees and contractors receive:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Mandatory child safety training upon hire</li>
                            <li>Regular updates on CSAE detection and prevention</li>
                            <li>Clear protocols for reporting suspected abuse internally</li>
                            <li>Zero-tolerance enforcement for violations</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">8. Account Suspension and Termination</h3>
                        <p className="text-muted-foreground">
                            Violators face:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Immediate account suspension pending investigation</li>
                            <li>Permanent account termination for confirmed violations</li>
                            <li>Prohibition from creating new accounts</li>
                            <li>Device-level bans when applicable</li>
                            <li>IP address blocking to prevent bypass attempts</li>
                        </ul>

                        <h3 className="text-lg font-semibold mt-4">9. Privacy and Data Protection</h3>
                        <p className="text-muted-foreground">
                            We protect children's data through:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Strict compliance with COPPA (Children's Online Privacy Protection Act) in the US</li>
                            <li>GDPR compliance for users in the EU</li>
                            <li>Limiting data collection from minors to only what's necessary</li>
                            <li>Not sharing minor user data with third parties for marketing</li>
                            <li>Regular privacy and security audits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Reporting and Support</h2>
                        <p className="text-muted-foreground">
                            If you encounter suspected child exploitation content or behavior on Karaads:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>Use the in-app report button on the content or profile</li>
                            <li>Email us at abuse@karaads.com with details</li>
                            <li>Report to the National Center for Missing & Exploited Children (NCMEC) at <strong>CyberTipline.org</strong></li>
                            <li>Contact your local law enforcement or Internet Crimes Against Children (ICAC) task force</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">External Resources</h2>
                        <p className="text-muted-foreground">
                            We recommend these trusted organizations for additional information:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                            <li>
                                <strong>National Center for Missing & Exploited Children (NCMEC):</strong>{' '}
                                <a href="https://www.ncmec.org" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    ncmec.org
                                </a>
                            </li>
                            <li>
                                <strong>Internet Watch Foundation:</strong>{' '}
                                <a href="https://www.iwf.org.uk" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    iwf.org.uk
                                </a>
                            </li>
                            <li>
                                <strong>Internet Crimes Against Children (ICAC) Task Force:</strong>{' '}
                                <a href="https://www.icactaskforce.org" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    icactaskforce.org
                                </a>
                            </li>
                            <li>
                                <strong>Thorn (Digital Defenders of Children):</strong>{' '}
                                <a href="https://www.thorn.org" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    thorn.org
                                </a>
                            </li>
                            <li>
                                <strong>WeProtect Global Alliance:</strong>{' '}
                                <a href="https://www.weprotect.org" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    weprotect.org
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Questions or Concerns</h2>
                        <p className="text-muted-foreground">
                            If you have questions about this Child Safety Policy or wish to report a concern,
                            please contact us at{' '}
                            <strong>abuse@karaads.com</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Changes to This Policy</h2>
                        <p className="text-muted-foreground">
                            We may update our Child Safety Policy from time to time. We will notify you of any
                            changes by updating the "Last updated" date at the top of this page and by providing
                            notice on our platform. Your continued use of Karaads following the posting of revised
                            policies means that you accept and agree to the changes.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
