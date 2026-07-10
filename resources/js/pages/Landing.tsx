import { Head } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLogoIcon from '@/components/app-logo-icon';
import { motion } from 'framer-motion';

export default function Landing() {
    useEffect(() => {
        const appScheme = 'karaads://open';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = appScheme;
            document.body.appendChild(iframe);
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }
    }, []);

    const openApp = () => {
        window.location.href = 'karaads://open';
    };

    return (
        <div className="min-h-screen bg-[#0b0e13] text-white selection:bg-primary selection:text-primary-foreground">
            <Head title="Karaads - Connect with the world" />

            <div className="relative isolate overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#ff80b5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AppLogoIcon className="h-16 w-16 rounded-2xl bg-white/5 p-2 shadow-2xl ring-1 ring-white/10" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-12 sm:mt-24"
                        >
                            <Link to="/app" className="inline-flex space-x-6">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    What's new
                                </span>
                            </Link>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl"
                        >
                            Connect with the world on Karaads
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-6 text-lg leading-8 text-gray-400"
                        >
                            Experience the full power of Karaads. Share moments, connect with friends, and discover new trends in a space designed for you.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-10 flex items-center gap-x-6"
                        >
                            <Button
                                size="lg"
                                className="rounded-full px-8 py-6 text-lg font-semibold shadow-sm hover:scale-105 transition-transform"
                                onClick={openApp}
                            >
                                Open in App
                            </Button>
                            <a href="/app" className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors">
                                Continue on Web <span aria-hidden="true">→</span>
                            </a>
                        </motion.div>

                    </div>
                </div>

                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
                </div>
            </div>

            <footer className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-gray-400">
                        &copy; {new Date().getFullYear()} Karaads. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link to="/terms" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
