import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Bot,
    Code,
    BarChart3,
    Rocket,
    Globe,
    Smartphone,
    Server,
    Database,
    Brain,
    Zap,
    TrendingUp,
    GitBranch,
    Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
    availableModels: any;
    frameworks: any;
}

export default function EnhancedCreateProjectForm({ availableModels, frameworks }: Props) {
    const [selectedProjectType, setSelectedProjectType] = useState("");
    const [selectedFramework, setSelectedFramework] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        project_type: "",
        ai_model: "",
        coding_framework: "",
        analytics_enabled: false,
        auto_deploy: false,
        repository_url: "",
        environment_variables: {},
        dependencies: [],
        visibility: "private",
        template_id: "",
        category_id: "",
    });

    const projectTypes = [
        {
            id: "web",
            name: "Web Application",
            description: "Full-stack web applications with modern frameworks",
            icon: Globe,
            color: "blue",
        },
        {
            id: "mobile",
            name: "Mobile App",
            description: "Cross-platform mobile applications",
            icon: Smartphone,
            color: "green",
        },
        {
            id: "api",
            name: "API Service",
            description: "RESTful APIs and microservices",
            icon: Server,
            color: "purple",
        },
        {
            id: "data_analysis",
            name: "Data Analytics",
            description: "Data science and machine learning projects",
            icon: BarChart3,
            color: "orange",
        },
        {
            id: "desktop",
            name: "Desktop App",
            description: "Cross-platform desktop applications",
            icon: Settings,
            color: "teal",
        },
        {
            id: "library",
            name: "Library/Package",
            description: "Reusable libraries and packages",
            icon: Database,
            color: "pink",
        },
    ];

    const getFrameworksForType = (type: string) => {
        if (!type) return {};
        const typeFrameworks = frameworks[type];
        if (!typeFrameworks) return {};

        // Normalize frameworks object to key-value pairs
        if (Array.isArray(typeFrameworks)) {
            return typeFrameworks.reduce((acc: Record<string, string>, fw: string | { id: string; name: string }) => {
                if (typeof fw === 'string') {
                    acc[fw] = fw;
                } else if (fw && typeof fw === 'object' && 'id' in fw) {
                    acc[fw.id] = fw.name || fw.id;
                }
                return acc;
            }, {});
        }
        return typeFrameworks;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.title.trim()) {
            toast.error("Project title is required");
            return;
        }

        if (!data.project_type) {
            toast.error("Please select a project type");
            return;
        }

        post(route("p.s"), {
            onSuccess: () => {
                toast.success("AI project created successfully!");
                reset();
            },
            onError: (errors) => {
                console.error("Creation errors:", errors);
                toast.error("Failed to create project. Please check your inputs.");
            },
        });
    };

    const getProjectTypeColor = (color: string) => {
        const colors = {
            blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
            green: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
            purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
            orange: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
            teal: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
            pink: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                        Project Title *
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        placeholder="My Awesome AI Project"
                        className="h-11"
                        error={errors.title}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Describe what your project will do..."
                        rows={3}
                        className="resize-none"
                    />
                </div>
            </div>

            <Separator />

            {/* Project Type Selection */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Project Type *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projectTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = data.project_type === type.id;

                        return (
                            <Card
                                key={type.id}
                                className={`cursor-pointer transition-all duration-200 ${
                                    isSelected
                                        ? `ring-2 ring-primary ${getProjectTypeColor(type.color)}`
                                        : "hover:shadow-md border-gray-200"
                                }`}
                                onClick={() => {
                                    setData("project_type", type.id);
                                    setSelectedProjectType(type.id);
                                    setData("coding_framework", ""); // Reset framework when type changes
                                    setSelectedFramework("");
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getProjectTypeColor(type.color)}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{type.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {errors.project_type && (
                    <p className="text-sm text-red-600">{errors.project_type}</p>
                )}
            </div>

            {/* Framework Selection */}
            {selectedProjectType && (
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Framework</Label>
                    <Select
                        value={data.coding_framework}
                        onValueChange={(value) => {
                            setData("coding_framework", value);
                            setSelectedFramework(value);
                        }}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose a framework" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(getFrameworksForType(selectedProjectType)).map(
                                ([key, name]) => {
                                    // Ensure name is a string
                                    const displayName = typeof name === 'string' ? name :
                                                       (name && typeof name === 'object' && 'name' in name) ? name.name :
                                                       String(name || key);

                                    return (
                                        <SelectItem key={key} value={key}>
                                            {displayName}
                                        </SelectItem>
                                    );
                                }
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Separator />

            {/* AI Configuration */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-semibold">AI Configuration</Label>
                </div>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>AI Model</Label>
                        <Select
                            value={data.ai_model}
                            onValueChange={(value) => setData("ai_model", value)}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select AI model for coding assistance" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(availableModels).map(([key, model]: [string, any]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">{model.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {model.description}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Advanced Features */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Advanced Features</Label>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                            <div>
                                <Label className="font-medium">Analytics & Insights</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable data analytics and Python code generation
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.analytics_enabled}
                            onCheckedChange={(checked) => setData("analytics_enabled", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Rocket className="h-5 w-5 text-teal-600" />
                            <div>
                                <Label className="font-medium">Auto Deployment</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically deploy changes to production
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.auto_deploy}
                            onCheckedChange={(checked) => setData("auto_deploy", checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Repository Configuration */}
            {data.auto_deploy && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-gray-600" />
                        <Label className="text-base font-semibold">Repository</Label>
                    </div>
                    <Input
                        value={data.repository_url}
                        onChange={(e) => setData("repository_url", e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="h-11"
                    />
                </div>
            )}

            <Separator />

            {/* Project Settings */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Project Settings</Label>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Visibility</Label>
                        <Select
                            value={data.visibility}
                            onValueChange={(value) => setData("visibility", value)}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Private - Only you can access
                                    </div>
                                </SelectItem>
                                <SelectItem value="shared">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        Shared - Team members can access
                                    </div>
                                </SelectItem>
                                <SelectItem value="public">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Public - Anyone can view
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={processing}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 min-w-[140px]"
                >
                    {processing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4" />
                            Create Project
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
