import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
}

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    size = "md",
    className = ""
}: EmptyStateProps) {
    const sizeClasses = {
        sm: {
            icon: "h-8 w-8",
            title: "text-lg font-semibold",
            description: "text-sm",
            padding: "py-6",
            spacing: "space-y-2"
        },
        md: {
            icon: "h-12 w-12",
            title: "text-xl font-semibold",
            description: "text-sm",
            padding: "py-8",
            spacing: "space-y-3"
        },
        lg: {
            icon: "h-16 w-16",
            title: "text-2xl font-semibold",
            description: "text-base",
            padding: "py-12",
            spacing: "space-y-4"
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <Card className={`border-dashed ${className}`}>
            <CardContent className={`${currentSize.padding}`}>
                <div className={`flex flex-col items-center text-center ${currentSize.spacing}`}>
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Icon className={currentSize.icon} />
                    </div>
                    
                    <div className={`${currentSize.spacing}`}>
                        <h3 className={`${currentSize.title}`}>
                            {title}
                        </h3>
                        <p className={`${currentSize.description} text-muted-foreground max-w-sm mx-auto`}>
                            {description}
                        </p>
                    </div>

                    {action && (
                        <div className="pt-2">
                            {action}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default EmptyState;