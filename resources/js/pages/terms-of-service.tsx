import { Button } from '@/components/ui/button';
import { Head } from '@/components/page-head';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Terms of Service" />

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
                        <h1 className="text-xl font-bold">Terms of Service</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: December 19, 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold">
                            1. Agreement to Terms
                        </h2>
                        <p className="text-muted-foreground">
                            By accessing and using Shoplace, you accept and
                            agree to be bound by the terms and provision of this
                            agreement. If you do not agree to abide by the
                            above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">2. Use License</h2>
                        <p className="text-muted-foreground">
                            Permission is granted to temporarily download one
                            copy of the materials (information or software) on
                            Shoplace for personal, non-commercial transitory
                            viewing only. This is the grant of a license, not a
                            transfer of title, and under this license you may
                            not:
                        </p>
                        <ul className="mt-4 space-y-2 text-muted-foreground">
                            <li>• Modifying or copying the materials</li>
                            <li>
                                • Using the materials for any commercial purpose
                                or for any public display
                            </li>
                            <li>
                                • Attempting to decompile or reverse engineer
                                any software contained on Shoplace
                            </li>
                            <li>
                                • Transferring the materials to another person
                                or "mirroring" the materials on any other server
                            </li>
                            <li>
                                • Violating any applicable laws or regulations
                            </li>
                            <li>
                                • Removing any copyright or other proprietary
                                notations from the materials
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">3. Disclaimer</h2>
                        <p className="text-muted-foreground">
                            The materials on Shoplace are provided on an 'as is'
                            basis. Shoplace makes no warranties, expressed or
                            implied, and hereby disclaims and negates all other
                            warranties including, without limitation, implied
                            warranties or conditions of merchantability, fitness
                            for a particular purpose, or non-infringement of
                            intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">4. Limitations</h2>
                        <p className="text-muted-foreground">
                            In no event shall Shoplace or its suppliers be
                            liable for any damages (including, without
                            limitation, damages for loss of data or profit, or
                            due to business interruption) arising out of the use
                            or inability to use the materials on Shoplace, even
                            if Shoplace or a Shoplace authorized representative
                            has been notified orally or in writing of the
                            possibility of such damage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">
                            5. Accuracy of Materials
                        </h2>
                        <p className="text-muted-foreground">
                            The materials appearing on Shoplace could include
                            technical, typographical, or photographic errors.
                            Shoplace does not warrant that any of the materials
                            on its website are accurate, complete, or current.
                            Shoplace may make changes to the materials contained
                            on its website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">6. Links</h2>
                        <p className="text-muted-foreground">
                            Shoplace has not reviewed all of the sites linked to
                            its website and is not responsible for the contents
                            of any such linked site. The inclusion of any link
                            does not imply endorsement by Shoplace of the site.
                            Use of any such linked website is at the user's own
                            risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">7. Modifications</h2>
                        <p className="text-muted-foreground">
                            Shoplace may revise these terms of service for its
                            website at any time without notice. By using this
                            website, you are agreeing to be bound by the then
                            current version of these terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">8. Governing Law</h2>
                        <p className="text-muted-foreground">
                            These terms and conditions are governed by and
                            construed in accordance with the laws of the
                            jurisdiction in which Shoplace operates, and you
                            irrevocably submit to the exclusive jurisdiction of
                            the courts in that location.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">9. User Conduct</h2>
                        <p className="text-muted-foreground">
                            You agree not to post any content that:
                        </p>
                        <ul className="mt-4 space-y-2 text-muted-foreground">
                            <li>
                                • Is illegal, abusive, threatening, defamatory,
                                obscene, or otherwise objectionable
                            </li>
                            <li>
                                • Infringes any patent, trademark, trade secret,
                                copyright, or other intellectual property right
                            </li>
                            <li>
                                • Constitutes unsolicited or unauthorized
                                advertising
                            </li>
                            <li>• Impersonates any person or entity</li>
                            <li>
                                • Spams, floods, or otherwise disrupts the
                                platform
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Contact</h2>
                        <p className="text-muted-foreground">
                            If you have any questions about these Terms of
                            Service, please contact us at:
                        </p>
                        <ul className="mt-4 space-y-2 text-muted-foreground">
                            <li>
                                <strong>Email:</strong> legal@shoplace.com
                            </li>
                            <li>
                                <strong>Address:</strong> 123 Social Street,
                                Tech City, TC 12345
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
