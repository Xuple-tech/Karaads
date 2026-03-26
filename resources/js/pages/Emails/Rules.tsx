import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Edit, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';


interface EmailAccount {
    id: number;
    email_address: string;
    provider: string;
}

interface EmailRule {
    id: number;
    name: string;
    description: string | null;
    email_account_id: number | null;
    conditions: Array<{
        field: string;
        operator: string;
        value: string;
    }>;
    actions: Array<{
        type: string;
        [key: string]: any;
    }>;
    is_active: boolean;
    priority: number;
}

interface Props {
    emailAccounts: EmailAccount[];
    emailRules: EmailRule[];
}

export default function Rules({ emailAccounts, emailRules }: Props) {
    const [rules, setRules] = useState<EmailRule[]>(emailRules);
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<EmailRule | null>(null);
    const [loading, setLoading] = useState(false);
    // toast

    const [ruleForm, setRuleForm] = useState({
        name: '',
        description: '',
        email_account_id: '',
        conditions: [{ field: 'subject', operator: 'contains', value: '' }],
        actions: [{ type: 'generate_response', tone: 'professional', length: 'medium' }],
        is_active: true,
        priority: 0,
    });

    const handleCreateRule = () => {
        setEditingRule(null);
        setRuleForm({
            name: '',
            description: '',
            email_account_id: '',
            conditions: [{ field: 'subject', operator: 'contains', value: '' }],
            actions: [{ type: 'generate_response', tone: 'professional', length: 'medium' }],
            is_active: true,
            priority: 0,
        });
        setRuleDialogOpen(true);
    };

    const handleEditRule = (rule: EmailRule) => {
        setEditingRule(rule);
        setRuleForm({
            name: rule.name,
            description: rule.description || '',
            email_account_id: rule.email_account_id?.toString() || '',
            conditions: rule.conditions,
            actions: rule.actions,
            is_active: rule.is_active,
            priority: rule.priority,
        });
        setRuleDialogOpen(true);
    };

    const handleSaveRule = async () => {
        setLoading(true);
        try {
            const data = {
                ...ruleForm,
                email_account_id: ruleForm.email_account_id ? parseInt(ruleForm.email_account_id) : null,
            };

            let response;
            if (editingRule) {
                response = await fetch(`/api/emails/rules/${editingRule.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(data),
                });
            } else {
                response = await fetch('/api/emails/rules', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(data),
                });
            }

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Success",
                    description: `Rule ${editingRule ? 'updated' : 'created'} successfully`,
                });
                setRuleDialogOpen(false);

                if (editingRule) {
                    setRules(rules.map(r => r.id === editingRule.id ? result.rule : r));
                } else {
                    setRules([...rules, result.rule]);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save rule');
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

    const handleDeleteRule = async (ruleId: number) => {
        if (!confirm('Are you sure you want to delete this rule?')) {
            return;
        }

        try {
            const response = await fetch(`/api/emails/rules/${ruleId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Rule deleted successfully",
                });
                setRules(rules.filter(r => r.id !== ruleId));
            } else {
                throw new Error('Failed to delete rule');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const addCondition = () => {
        setRuleForm({
            ...ruleForm,
            conditions: [...ruleForm.conditions, { field: 'subject', operator: 'contains', value: '' }]
        });
    };

    const updateCondition = (index: number, field: string, value: any) => {
        const newConditions = [...ruleForm.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setRuleForm({ ...ruleForm, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
        setRuleForm({
            ...ruleForm,
            conditions: ruleForm.conditions.filter((_, i) => i !== index)
        });
    };

    const addAction = () => {
        setRuleForm({
            ...ruleForm,
            actions: [...ruleForm.actions, { type: 'generate_response', tone: 'professional', length: 'medium' }]
        });
    };

    const updateAction = (index: number, field: string, value: any) => {
        const newActions = [...ruleForm.actions];
        newActions[index] = { ...newActions[index], [field]: value };
        setRuleForm({ ...ruleForm, actions: newActions });
    };

    const removeAction = (index: number) => {
        setRuleForm({
            ...ruleForm,
            actions: ruleForm.actions.filter((_, i) => i !== index)
        });
    };

    return (
        <AppLayout>
            <>
                <Head title="Email Rules" />

                <div className="container mx-auto py-8 px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
                            <p className="text-muted-foreground">
                                Configure rules to automatically process and respond to emails
                            </p>
                        </div>
                        <Button onClick={handleCreateRule}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Rule
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Email Rules
                                </CardTitle>
                                <CardDescription>
                                    Manage your email automation rules
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {rules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No automation rules</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Create your first rule to start automating email responses
                                        </p>
                                        <Button onClick={handleCreateRule}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Rule
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {rules.map((rule) => (
                                            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-medium">{rule.name}</p>
                                                        {rule.is_active && (
                                                            <Badge variant="secondary">Active</Badge>
                                                        )}
                                                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                                                    </div>
                                                    {rule.description && (
                                                        <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                                                    )}
                                                    <div className="flex gap-2 flex-wrap">
                                                        <Badge variant="outline">
                                                            {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                        {rule.email_account_id && (
                                                            <Badge variant="secondary">
                                                                {emailAccounts.find(a => a.id === rule.email_account_id)?.email_address}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditRule(rule)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

                {/* Rule Creation/Edit Dialog */}
                <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
                            <DialogDescription>
                                Configure conditions and actions for email automation
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Rule Name</Label>
                                    <Input
                                        id="name"
                                        value={ruleForm.name}
                                        onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                                        placeholder="e.g., Urgent Customer Inquiries"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={ruleForm.description}
                                        onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                                        placeholder="Describe what this rule does..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account">Email Account (Optional)</Label>
                                    <Select value={ruleForm.email_account_id} onValueChange={(value) => setRuleForm({ ...ruleForm, email_account_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Apply to all accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem>All accounts</SelectItem>
                                            {emailAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.email_address} ({account.provider})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={ruleForm.is_active}
                                        onCheckedChange={(checked) => setRuleForm({ ...ruleForm, is_active: checked })}
                                    />
                                    <Label htmlFor="active">Active</Label>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        value={ruleForm.priority}
                                        onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Conditions</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Condition
                                    </Button>
                                </div>
                                {ruleForm.conditions.map((condition, index) => (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="grid gap-2 flex-1">
                                            <Label>Field</Label>
                                            <Select value={condition.field} onValueChange={(value) => updateCondition(index, 'field', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="subject">Subject</SelectItem>
                                                    <SelectItem value="from_email">From Email</SelectItem>
                                                    <SelectItem value="from_name">From Name</SelectItem>
                                                    <SelectItem value="body">Body</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label>Operator</Label>
                                            <Select value={condition.operator} onValueChange={(value) => updateCondition(index, 'operator', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="contains">Contains</SelectItem>
                                                    <SelectItem value="equals">Equals</SelectItem>
                                                    <SelectItem value="starts_with">Starts With</SelectItem>
                                                    <SelectItem value="ends_with">Ends With</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label>Value</Label>
                                            <Input
                                                value={condition.value}
                                                onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                placeholder="Search value"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeCondition(index)}
                                            disabled={ruleForm.conditions.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Actions</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addAction}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Action
                                    </Button>
                                </div>
                                {ruleForm.actions.map((action, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Select value={action.type} onValueChange={(value) => updateAction(index, 'type', value)}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="generate_response">Generate Response</SelectItem>
                                                    <SelectItem value="mark_read">Mark as Read</SelectItem>
                                                    <SelectItem value="mark_unread">Mark as Unread</SelectItem>
                                                    <SelectItem value="forward">Forward Email</SelectItem>
                                                    <SelectItem value="label">Add Label</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeAction(index)}
                                                disabled={ruleForm.actions.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {action.type === 'generate_response' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Tone</Label>
                                                    <Select value={action.tone || 'professional'} onValueChange={(value) => updateAction(index, 'tone', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="professional">Professional</SelectItem>
                                                            <SelectItem value="friendly">Friendly</SelectItem>
                                                            <SelectItem value="formal">Formal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Length</Label>
                                                    <Select value={action.length || 'medium'} onValueChange={(value) => updateAction(index, 'length', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="short">Short</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="long">Long</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                        {action.type === 'forward' && (
                                            <div className="grid gap-2">
                                                <Label>Forward To</Label>
                                                <Input
                                                    value={action.to || ''}
                                                    onChange={(e) => updateAction(index, 'to', e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        )}
                                        {action.type === 'label' && (
                                            <div className="grid gap-2">
                                                <Label>Label</Label>
                                                <Input
                                                    value={action.label || ''}
                                                    onChange={(e) => updateAction(index, 'label', e.target.value)}
                                                    placeholder="Important, Work, etc."
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveRule} disabled={loading || !ruleForm.name.trim()}>
                                {loading ? 'Saving...' : 'Save Rule'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        </AppLayout>
    );
}
