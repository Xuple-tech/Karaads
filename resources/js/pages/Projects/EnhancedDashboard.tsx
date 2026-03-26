import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/layouts/app-layout";
import {
    Bot,
    Code,
    BarChart3,
    Rocket,
    Globe,
    Settings,
    Users,
    FileText,
    MessageCircle,
    Activity,
    TrendingUp,
    Zap,
    Brain,
    CheckCircle,
    AlertCircle,
    XCircle,
    Clock,
    GitBranch,
    Play,
    Pause,
    MoreVertical,
    Download,
    Share,
    Eye,
    Terminal,
    Database,
    Server,
    Monitor,
    Cpu,
    HardDrive,
    Network,
    Shield,
    Star,
    Target,
    Layers,
    Code2,
    LineChart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Props {
    project: any;
    analytics: any;
    healthScore: number;
    complexity: string;
    recentActivity: any[];
    deploymentStatus: any;
    aiCapabilities: any;
}

export default function EnhancedProjectDashboard({
    project,
    analytics,
    healthScore,
    complexity,
    recentActivity,
    deploymentStatus,
    aiCapabilities,
}: Props) {
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        // Load project metrics
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const response = await fetch(route('projects.metrics', project.id));
            const data = await response.json();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    };

    const handleGenerateCode = () => {
        setIsGeneratingCode(true);
        // This would open a modal or navigate to code generation interface
        toast.success("Code generation interface opened!");
        setIsGeneratingCode(false);
    };

    const handleAnalyzeCode = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(route('projects.analyze-quality', project.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            toast.success(`Code quality score: ${data.score}%`);
        } catch (error) {
            toast.error("Failed to analyze code quality");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            const response = await fetch(route('projects.deploy', project.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Deployment successful!");
                if (data.url) {
                    toast.success(`Live at: ${data.url}`);
                }
            } else {
                toast.error("Deployment failed");
            }
        } catch (error) {
            toast.error("Deployment error");
        } finally {
            setIsDeploying(false);
        }
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity.toLowerCase()) {
            case 'simple': return "text-green-600";
            case 'moderate': return "text-blue-600";
            case 'complex': return "text-orange-600";
            case 'enterprise': return "text-red-600";
            default: return "text-gray-600";
        }
    };

    const getBuildStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'building':
                return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <AppLayout>
            <Head title={`${project.title} - AI Dashboard`} />
            <div className="container mx-auto p-6 space-y-8">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Link href={route('p.i')} className="text-muted-foreground hover:text-primary">
                                Projects
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-semibold">{project.title}</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
                                {aiCapabilities.hasCoding ? (
                                    <Bot className="h-6 w-6 text-blue-600" />
                                ) : (
                                    <Code className="h-6 w-6 text-gray-600" />
                                )}
                            </div>
                            {project.title}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="text-sm">
                                {project.visibility}
                            </Badge>
                            {project.ai_model && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                    <Bot className="h-3 w-3 mr-1" />
                                    {aiCapabilities.model_info?.name || project.ai_model}
                                </Badge>
                            )}
                            {project.coding_framework && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Code className="h-3 w-3 mr-1" />
                                    {aiCapabilities.framework_info?.name || project.coding_framework}
                                </Badge>
                            )}
                            {project.analytics_enabled && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    Analytics
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {aiCapabilities.hasCoding && (
                            <Button
                                onClick={handleGenerateCode}
                                disabled={isGeneratingCode}
                                className="gap-2"
                                variant="outline"
                            >
                                {isGeneratingCode ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Zap className="h-4 w-4" />
                                )}
                                Generate Code
                            </Button>
                        )}

                        <Button
                            onClick={handleAnalyzeCode}
                            disabled={isAnalyzing}
                            variant="outline"
                            className="gap-2"
                        >
                            {isAnalyzing ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Target className="h-4 w-4" />
                            )}
                            Analyze
                        </Button>

                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('projects.chat.index', project.id)}>
                                <MessageCircle className="h-4 w-4" />
                                Chat
                            </Link>
                        </Button>

                        {project.auto_deploy && (
                            <Button
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="gap-2"
                            >
                                {isDeploying ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Rocket className="h-4 w-4" />
                                )}
                                Deploy
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={route("projects.settings", project.id)}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Health Score</p>
                                    <p className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
                                        {healthScore}%
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                            <Progress value={healthScore} className="mt-3 h-2" />
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Complexity</p>
                                    <p className={`text-2xl font-bold ${getComplexityColor(complexity)}`}>
                                        {complexity}
                                    </p>
                                </div>
                                <Layers className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Build Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getBuildStatusIcon(project.build_status)}
                                        <span className="text-lg font-semibold text-purple-900 capitalize">
                                            {project.build_status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <GitBranch className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Deployment</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {deploymentStatus.is_deployed ? (
                                            <>
                                                <Globe className="h-5 w-5 text-green-500" />
                                                <span className="text-lg font-semibold text-green-700">Live</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-5 w-5 text-gray-500" />
                                                <span className="text-lg font-semibold text-gray-700">Not Deployed</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Rocket className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="ai-tools" className="gap-2">
                            <Bot className="h-4 w-4" />
                            AI Tools
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="deployment" className="gap-2">
                            <Rocket className="h-4 w-4" />
                            Deployment
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Project Stats */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Project Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-blue-900">{analytics.conversations_count}</p>
                                            <p className="text-sm text-blue-700">Conversations</p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-900">{analytics.files_count}</p>
                                            <p className="text-sm text-green-700">Files</p>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-purple-900">{analytics.members_count}</p>
                                            <p className="text-sm text-purple-700">Team Members</p>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <Bot className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-orange-900">{analytics.agents_count}</p>
                                            <p className="text-sm text-orange-700">AI Agents</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button asChild className="w-full justify-start gap-2" variant="outline">
                                        <Link href={route('projects.chat.index', project.id)}>
                                            <MessageCircle className="h-4 w-4" />
                                            Start Chat
                                        </Link>
                                    </Button>
                                    <Button className="w-full justify-start gap-2" variant="outline">
                                        <Code2 className="h-4 w-4" />
                                        Generate Component
                                    </Button>
                                    <Button className="w-full justify-start gap-2" variant="outline">
                                        <Database className="h-4 w-4" />
                                        Create Migration
                                    </Button>
                                    <Button className="w-full justify-start gap-2" variant="outline">
                                        <Terminal className="h-4 w-4" />
                                        Run Tests
                                    </Button>
                                    <Button className="w-full justify-start gap-2" variant="outline">
                                        <LineChart className="h-4 w-4" />
                                        Generate Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Project Description */}
                        {project.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>About This Project</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {project.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* AI Tools Tab */}
                    <TabsContent value="ai-tools" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="h-5 w-5 text-purple-600" />
                                        Code Generation
                                    </CardTitle>
                                    <CardDescription>
                                        Generate code using AI assistance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Brain className="h-4 w-4" />
                                        Model: {aiCapabilities.model_info?.name || 'Not configured'}
                                    </div>
                                    <Button
                                        className="w-full gap-2"
                                        onClick={handleGenerateCode}
                                        disabled={!aiCapabilities.hasCoding}
                                    >
                                        <Zap className="h-4 w-4" />
                                        Start Code Generation
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                        Data Analytics
                                    </CardTitle>
                                    <CardDescription>
                                        Generate Python code for data analysis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Database className="h-4 w-4" />
                                        Status: {project.analytics_enabled ? 'Enabled' : 'Disabled'}
                                    </div>
                                    <Button
                                        className="w-full gap-2"
                                        variant="outline"
                                        disabled={!project.analytics_enabled}
                                    >
                                        <LineChart className="h-4 w-4" />
                                        Generate Analytics
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Code Quality</span>
                                            <span className="text-sm text-muted-foreground">
                                                {project.code_quality_score || 'N/A'}%
                                            </span>
                                        </div>
                                        <Progress value={project.code_quality_score || 0} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Test Coverage</span>
                                            <span className="text-sm text-muted-foreground">85%</span>
                                        </div>
                                        <Progress value={85} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Performance</span>
                                            <span className="text-sm text-muted-foreground">92%</span>
                                        </div>
                                        <Progress value={92} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Resource Usage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Cpu className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium">CPU</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">45%</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium">Memory</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">2.1 GB</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Network className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium">Network</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">12 MB/s</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Deployment Tab */}
                    <TabsContent value="deployment" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="h-5 w-5" />
                                        Deployment Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status</span>
                                        <Badge variant={deploymentStatus.is_deployed ? "default" : "secondary"}>
                                            {deploymentStatus.is_deployed ? "Deployed" : "Not Deployed"}
                                        </Badge>
                                    </div>

                                    {deploymentStatus.deployment_url && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Live URL</span>
                                            <Link
                                                href={deploymentStatus.deployment_url}
                                                target="_blank"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                View Live Site
                                            </Link>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Auto Deploy</span>
                                        <Badge variant={project.auto_deploy ? "default" : "secondary"}>
                                            {project.auto_deploy ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>

                                    {deploymentStatus.last_build && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Last Build</span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(deploymentStatus.last_build).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="h-5 w-5" />
                                        Repository
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {project.repository_url ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Repository</span>
                                            <Link
                                                href={project.repository_url}
                                                target="_blank"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                View on GitHub
                                            </Link>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No repository configured
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Activity className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        by {activity.user} • {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            No recent activity
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
