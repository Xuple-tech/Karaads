import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { AudioWaveform, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StudioIndex() {
    const apps = [
        {
            name: "Podcast Generator",
            description: "Create engaging podcasts with AI-powered tools.",
            link: "/studio/podcast-master",
            is_active: true,
            is_upcoming: false,
            icon: AudioWaveform
        },
    ];

    return (
        <AppLayout>
            <Head title="AI Studio" />

            {/* Hero Section */}
            <div className="container max-w-6xl mx-auto px-6 py-12 lg:py-16">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                        Welcome to KwatiAI Studio
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Discover powerful AI tools designed to enhance your creative workflow.
                        Explore our comprehensive collection of intelligent solutions for modern content creation.
                    </p>
                </div>
            </div>

            {/* Apps Grid */}
            <div className="container max-w-6xl mx-auto px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => {
                        const IconComponent = app.icon;

                        return (
                            <Card
                                key={app.name}
                                className="group relative overflow-hidden transition-all hover:shadow-lg border-border/50"
                            >
                                <CardHeader className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                            <IconComponent className="h-6 w-6" />
                                        </div>

                                        {app.is_upcoming && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                Coming Soon
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <CardTitle className="text-xl">
                                            {app.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {app.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardFooter className="pt-4">
                                    {app.is_upcoming ? (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            disabled
                                        >
                                            <Clock className="mr-2 h-4 w-4" />
                                            Coming Soon
                                        </Button>
                                    ) : app.is_active ? (
                                        <Button
                                            asChild
                                            className="w-full group/button"
                                        >
                                            <Link href={app.link}>
                                                Launch App
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            disabled
                                        >
                                            Unavailable
                                        </Button>
                                    )}
                                </CardFooter>

                                {/* Subtle gradient overlay on hover */}
                                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

export default StudioIndex;
