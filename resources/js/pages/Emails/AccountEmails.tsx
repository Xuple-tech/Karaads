import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mail, ArrowLeft, RefreshCw, Eye, Send, Brain, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Email {
    id: number;
    subject: string;
    body_text: string;
    body_html: string;
    from: {
        name: string;
        email: string;
    };
    to: Array<{
        name: string;
        email: string;
    }>;
    sent_at: string;
    received_at: string;
    is_read: boolean;
    ai_analysis?: {
        sentiment: string;
        urgency_level: string;
        category: string;
        action_required: boolean;
    };
}

interface EmailAccount {
    id: number;
    email_address: string;
    provider: string;
}

interface Props {
    emailAccount: EmailAccount;
    emails: {
        data: Email[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function AccountEmails({ emailAccount, emails }: Props) {
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [responseDialogOpen, setResponseDialogOpen] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
// toast
    const handleViewEmail = (email: Email) => {
        setSelectedEmail(email);
        setEmailDialogOpen(true);
    };

    const handleProcessEmail = async (emailId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/emails/${emailId}/process`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Email processed with AI",
                });
                window.location.reload();
            } else {
                throw new Error('Failed to process email');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!selectedEmail) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/emails/responses/${selectedEmail.id}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    final_response: responseText
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Response sent successfully",
                });
                setResponseDialogOpen(false);
                setResponseText('');
                window.location.reload();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send response');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive': return 'bg-green-100 text-green-800';
            case 'negative': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <>
            <Head title={`Emails - ${emailAccount.email_address}`} />

            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                            <p className="text-muted-foreground">
                                {emailAccount.email_address} ({emailAccount.provider})
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Recent Emails
                                <Badge variant="secondary">{emails.total} total</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {emails.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No emails</h3>
                                    <p className="text-muted-foreground">
                                        No emails found in this account.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {emails.data.map((email) => (
                                        <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium truncate max-w-md">
                                                            {email.subject || '(No subject)'}
                                                        </p>
                                                        {!email.is_read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        From: {email.from.name} &lt;{email.from.email}&gt;
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(email.received_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                {email.ai_analysis && (
                                                    <div className="flex gap-2">
                                                        <Badge className={getSentimentColor(email.ai_analysis.sentiment)}>
                                                            {email.ai_analysis.sentiment}
                                                        </Badge>
                                                        <Badge className={getUrgencyColor(email.ai_analysis.urgency_level)}>
                                                            {email.ai_analysis.urgency_level} priority
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {email.ai_analysis.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewEmail(email)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleProcessEmail(email.id)}
                                                    disabled={loading}
                                                >
                                                    <Brain className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Email Detail Dialog */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedEmail?.subject || '(No subject)'}</DialogTitle>
                        <DialogDescription>
                            From: {selectedEmail?.from.name} &lt;{selectedEmail?.from.email}&gt; •
                            {selectedEmail && new Date(selectedEmail.received_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedEmail?.ai_analysis && (
                            <div className="flex gap-2 flex-wrap">
                                <Badge className={getSentimentColor(selectedEmail.ai_analysis.sentiment)}>
                                    Sentiment: {selectedEmail.ai_analysis.sentiment}
                                </Badge>
                                <Badge className={getUrgencyColor(selectedEmail.ai_analysis.urgency_level)}>
                                    Urgency: {selectedEmail.ai_analysis.urgency_level}
                                </Badge>
                                <Badge variant="outline">
                                    Category: {selectedEmail.ai_analysis.category}
                                </Badge>
                                {selectedEmail.ai_analysis.action_required && (
                                    <Badge variant="secondary">
                                        Action Required
                                    </Badge>
                                )}
                            </div>
                        )}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail?.body_html || selectedEmail?.body_text || '' }} />
                        </div>
                        {selectedEmail && (
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setResponseText('');
                                        setResponseDialogOpen(true);
                                    }}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Reply
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Response Dialog */}
            <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to: {selectedEmail?.subject}</DialogTitle>
                        <DialogDescription>
                            Compose your response to {selectedEmail?.from.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Type your response here..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={10}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendResponse} disabled={loading || !responseText.trim()}>
                            {loading ? 'Sending...' : 'Send Response'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
