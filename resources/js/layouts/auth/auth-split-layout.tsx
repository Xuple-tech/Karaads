import AppLogoIcon from '@/components/app-logo-icon';
import { home, privacy, terms } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Brain, BarChart3, Users, Workflow } from 'lucide-react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

interface FeatureSlide {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    imageOverlay: string;
    gradient: string;
}

// Example images - replace with your actual image URLs or imports
const featureImages = {
    insights: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    analytics: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    collaboration: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    automation: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
};

const defaultFeatures: FeatureSlide[] = [
    {
        id: 1,
        title: "AI-Powered Insights",
        description: "Get intelligent, data-driven insights to optimize your workflow and decision-making.",
        icon: <Brain className="size-8" />,
        imageOverlay: featureImages.insights,
        gradient: "from-blue-900/80 to-purple-900/60"
    },
    {
        id: 2,
        title: "Real-time Analytics",
        description: "Monitor your performance with live dashboards and comprehensive analytics.",
        icon: <BarChart3 className="size-8" />,
        imageOverlay: featureImages.analytics,
        gradient: "from-emerald-900/80 to-cyan-900/60"
    },
    {
        id: 3,
        title: "Collaborate Seamlessly",
        description: "Work together with your team in real-time, no matter where you are.",
        icon: <Users className="size-8" />,
        imageOverlay: featureImages.collaboration,
        gradient: "from-violet-900/80 to-pink-900/60"
    },
    {
        id: 4,
        title: "Automate Workflows",
        description: "Streamline repetitive tasks with intelligent automation and smart triggers.",
        icon: <Workflow className="size-8" />,
        imageOverlay: featureImages.automation,
        gradient: "from-orange-900/80 to-rose-900/60"
    }
];

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [features] = useState<FeatureSlide[]>(defaultFeatures);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [features.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % features.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    };

    return (
        <div className="min-h-dvh flex flex-col lg:flex-row">
            {/* Left Side - Feature Slider with Image Overlays */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col overflow-hidden">
                {/* Background Images with Overlay */}
                <div className="absolute inset-0">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                index === currentSlide
                                    ? 'opacity-100'
                                    : 'opacity-0'
                            }`}
                        >
                            {/* Background Image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url('${feature.imageOverlay}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                                
                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                                        backgroundSize: '50px 50px'
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col h-full p-12 text-white">
                    {/* Logo */}
                    <Link 
                        href={home.url()} 
                        className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity mb-12"
                    >
                        <AppLogoIcon className="size-9 fill-current" />
                        <span className="text-xl font-semibold tracking-tight">Kwati AI</span>
                    </Link>

                    {/* Feature Slider Content */}
                    <div className="flex-1 flex flex-col justify-center items-center py-12">
                        <div className="w-full max-w-2xl mx-auto">
                            {/* Slides Content */}
                            <div className="relative h-72 overflow-hidden">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.id}
                                        className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                                            index === currentSlide
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-8 opacity-0'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center text-center px-8">
                                            {/* Icon Container */}
                                            <div className="size-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8 shadow-xl">
                                                <div className="text-white">
                                                    {feature.icon}
                                                </div>
                                            </div>
                                            
                                            {/* Title */}
                                            <h2 className="text-4xl font-bold mb-6 tracking-tight">
                                                {feature.title}
                                            </h2>
                                            
                                            {/* Description */}
                                            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-center gap-8 mt-16">
                                <button
                                    onClick={prevSlide}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
                                    aria-label="Previous feature"
                                >
                                    <ChevronLeft className="size-6" />
                                </button>
                                
                                {/* Dots Indicator */}
                                <div className="flex gap-4">
                                    {features.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`transition-all duration-300 relative ${
                                                index === currentSlide
                                                    ? 'w-12'
                                                    : 'w-3 hover:w-4'
                                            } h-3 rounded-full bg-white/40 hover:bg-white/60`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        >
                                            {index === currentSlide && (
                                                <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={nextSlide}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
                                    aria-label="Next feature"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress & Tagline */}
                    <div className="relative z-10">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-gradient-to-r from-white/80 to-white/40 transition-all duration-1000 ease-out"
                                style={{ 
                                    width: `${((currentSlide + 1) / features.length) * 100}%` 
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-white/80">
                                Transforming Productivity with AI
                            </div>
                            <div className="text-sm text-white/60">
                                {currentSlide + 1} / {features.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 flex flex-col lg:justify-center p-6 sm:p-8 lg:p-12">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link 
                        href={home.url()} 
                        className="flex items-center justify-center gap-3 lg:hidden mb-8"
                    >
                        <AppLogoIcon className="size-10 fill-current text--900" />
                        <span className="text-xl font-semibold">Kwati AI</span>
                    </Link>

                    {/* Auth Content */}
                    <div className="bg-= rounded-2xl p-8 shadow-lg border border--100">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text--900 mb-3 tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text--600 text-sm leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 text-center">
                       
                        <div className="flex justify-center gap-6 text-sm">
                            <a href={privacy.url()} className="text--500 hover:text--900 transition-colors">
                                Privacy
                            </a>
                            <a href={terms.url()} className="text--500 hover:text--900 transition-colors">
                                Terms
                            </a>
                          
                        </div>
                        <p className="mt-4 text-xs text--400">
                            © {new Date().getFullYear()} Kwati AI. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}