import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Search,
    Play,
    Copy,
    Trash2,
    Plus,
    ArrowRight,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: Record<string, any>;
    return_schema: Record<string, any>;
}

interface MCPServer {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'error';
    error?: string;
}

interface TestResult {
    status: 'success' | 'error';
    output?: any;
    error?: string;
    duration_ms: number;
}

interface MCPToolDiscoveryProps {
    teamId: string;
}

export function MCPToolDiscovery({ teamId }: MCPToolDiscoveryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [testInput, setTestInput] = useState<Record<string, any>>({});
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [selectedServer, setSelectedServer] = useState<string>('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [newServerUrl, setNewServerUrl] = useState('');

    // Fetch MCP servers
    const { data: servers, refetch: refetchServers } = useQuery({
        queryKey: ['mcp-servers', teamId],
        queryFn: async () => {
            const res = await axios.get(`/api/mcp/servers`);
            return res.data.data;
        },
    });

    // Fetch available tools from selected server
    const { data: tools, isLoading: toolsLoading } = useQuery({
        queryKey: ['mcp-tools', selectedServer],
        queryFn: async () => {
            if (!selectedServer) return [];
            const res = await axios.post('/api/mcp/tools/list', {
                server_id: selectedServer,
            });
            return res.data.data?.tools || [];
        },
        enabled: !!selectedServer,
    });

    // Test tool mutation
    const testToolMutation = useMutation({
        mutationFn: async (input: Record<string, any>) => {
            if (!selectedTool || !selectedServer) throw new Error('Tool or server not selected');

            const startTime = Date.now();
            const res = await axios.post('/api/mcp/tools/call', {
                server_id: selectedServer,
                tool_name: selectedTool.name,
                arguments: input,
            });
            const duration = Date.now() - startTime;

            return {
                status: 'success' as const,
                output: res.data.data?.result,
                duration_ms: duration,
            };
        },
        onSuccess: (result) => {
            setTestResult(result);
            toast.success('Tool executed successfully');
        },
        onError: (error: any) => {
            setTestResult({
                status: 'error',
                error: error.response?.data?.message || error.message,
                duration_ms: 0,
            });
            toast.error('Tool execution failed');
        },
    });

    // Register server mutation
    const registerServerMutation = useMutation({
        mutationFn: async (url: string) => {
            const res = await axios.post('/api/mcp/servers', {
                name: new URL(url).hostname,
                url,
            });
            return res.data.data;
        },
        onSuccess: () => {
            refetchServers();
            setNewServerUrl('');
            toast.success('MCP server registered');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to register server');
        },
    });

    // Test connection mutation
    const testConnectionMutation = useMutation({
        mutationFn: async (serverId: string) => {
            const res = await axios.post(`/api/mcp/servers/${serverId}/test`);
            return res.data.data;
        },
        onSuccess: () => {
            refetchServers();
            toast.success('Connection successful');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Connection failed');
        },
    });

    // Delete server mutation
    const deleteServerMutation = useMutation({
        mutationFn: async (serverId: string) => {
            await axios.delete(`/api/mcp/servers/${serverId}`);
        },
        onSuccess: () => {
            refetchServers();
            setDeleteTarget(null);
            toast.success('Server deleted');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete server');
        },
    });

    const handleTestTool = () => {
        try {
            const parsed = JSON.parse(JSON.stringify(testInput));
            setIsTesting(true);
            testToolMutation.mutate(parsed);
            setIsTesting(false);
        } catch (error: any) {
            toast.error('Invalid input: ' + error.message);
        }
    };

    const filteredTools = tools?.filter((tool: Tool) => {
        const matchesSearch =
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !categoryFilter || tool.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(
        new Set((tools || []).map((t: Tool) => t.category))
    ) as string[];

    const getServerStatusIcon = (status: string) => {
        return status === 'active' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
        ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
        ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
        );
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="tools" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                    <TabsTrigger value="servers">MCP Servers</TabsTrigger>
                </TabsList>

                {/* Tools Tab */}
                <TabsContent value="tools" className="space-y-6">
                    {/* Server Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Select MCP Server</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedServer} onValueChange={setSelectedServer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a server..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {servers?.map((server: MCPServer) => (
                                        <SelectItem key={server.id} value={server.id}>
                                            <div className="flex items-center gap-2">
                                                {getServerStatusIcon(server.status)}
                                                {server.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {selectedServer && (
                        <>
                            {/* Search and Filter */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Browse Tools</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="Search tools..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Categories</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {toolsLoading ? (
                                    <div className="col-span-2 text-center py-8 text-gray-500">
                                        Loading tools...
                                    </div>
                                ) : filteredTools?.length === 0 ? (
                                    <div className="col-span-2 text-center py-8 text-gray-500">
                                        No tools found
                                    </div>
                                ) : (
                                    filteredTools?.map((tool: Tool) => (
                                        <Card
                                            key={tool.id}
                                            className="cursor-pointer hover:border-blue-300 transition"
                                            onClick={() => setSelectedTool(tool)}
                                        >
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base">
                                                            {tool.name}
                                                        </CardTitle>
                                                        <Badge className="mt-2">{tool.category}</Badge>
                                                    </div>
                                                    {selectedTool?.id === tool.id && (
                                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription>{tool.description}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Tool Details and Test */}
                            {selectedTool && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test Tool: {selectedTool.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium mb-2">
                                                Description
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {selectedTool.description}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Parameters</div>
                                            <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                                                <pre>
                                                    {JSON.stringify(
                                                        selectedTool.parameters,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Test Input</div>
                                            <Textarea
                                                placeholder="Enter input as JSON"
                                                value={JSON.stringify(testInput, null, 2)}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setTestInput(parsed);
                                                    } catch {
                                                        // Allow invalid JSON while typing
                                                    }
                                                }}
                                                className="font-mono text-sm min-h-24"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleTestTool}
                                            disabled={isTesting || testToolMutation.isPending}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            {isTesting ? 'Testing...' : 'Test Tool'}
                                        </Button>

                                        {testResult && (
                                            <div
                                                className={`p-4 rounded border ${
                                                    testResult.status === 'success'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                }`}
                                            >
                                                <div className="text-sm font-medium mb-2">
                                                    {testResult.status === 'success'
                                                        ? '✓ Success'
                                                        : '✗ Error'}{' '}
                                                    ({testResult.duration_ms}ms)
                                                </div>
                                                <div className="bg-white p-2 rounded text-xs font-mono overflow-x-auto max-h-40">
                                                    <pre>
                                                        {JSON.stringify(
                                                            testResult.output || testResult.error,
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Servers Tab */}
                <TabsContent value="servers" className="space-y-6">
                    {/* Register New Server */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Register MCP Server</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://mcp-server-url:port"
                                    value={newServerUrl}
                                    onChange={(e) => setNewServerUrl(e.target.value)}
                                />
                                <Button
                                    onClick={() => registerServerMutation.mutate(newServerUrl)}
                                    disabled={registerServerMutation.isPending || !newServerUrl}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Register
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Servers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Servers</CardTitle>
                            <CardDescription>
                                {servers?.length || 0} server(s) configured
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!servers || servers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No servers registered. Add one above.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {servers.map((server: MCPServer) => (
                                        <div
                                            key={server.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {getServerStatusIcon(server.status)}
                                                    <div>
                                                        <div className="font-medium">{server.name}</div>
                                                        <div className="text-xs text-gray-600">
                                                            {server.url}
                                                        </div>
                                                    </div>
                                                </div>
                                                {server.error && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Error: {server.error}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        testConnectionMutation.mutate(server.id)
                                                    }
                                                    disabled={testConnectionMutation.isPending}
                                                >
                                                    Test
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteTarget(server.id)}
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation */}
            {deleteTarget && (
                <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Server?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will remove the server from your MCP configuration.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteServerMutation.mutate(deleteTarget)}
                                disabled={deleteServerMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

export default MCPToolDiscovery;
