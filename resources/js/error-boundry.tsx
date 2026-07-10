import React from 'react';
import { AlertCircle, Home, RefreshCw, Mail, Bug, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount, showDetails } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/30">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full"
          >
            <div className="relative overflow-hidden bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-xl">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-8 p-4 bg-red-500/10 rounded-2xl ring-1 ring-red-500/20">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight mb-4">
                  Something unexpected happened
                </h1>
                
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                  The application encountered an error. We've been notified and are looking into it.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                  <Button
                    onClick={this.handleReload}
                    className="h-14 rounded-2xl text-lg font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Try Refreshing
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="h-14 rounded-2xl text-lg font-semibold border-border bg-background hover:bg-accent transition-all"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Safety
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-6 w-full pt-8 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => window.location.href = 'mailto:support@karaads.com'}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>

                  {isDevelopment && error && (
                    <button 
                      onClick={() => this.setState({ showDetails: !showDetails })}
                      className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                      <Bug className="h-3 w-3" />
                      View Technical details
                      <ChevronRight className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showDetails && isDevelopment && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full mt-8 text-left overflow-hidden"
                    >
                      <div className="bg-muted/60 rounded-2xl p-6 border border-border font-mono text-[11px] leading-relaxed">
                        <div className="text-red-400 mb-4 pb-4 border-b border-white/5">
                          <p className="font-bold mb-1 uppercase tracking-tighter opacity-50">Error Message</p>
                          {error.toString()}
                        </div>
                        {errorInfo && (
                          <div className="text-muted-foreground max-h-48 overflow-y-auto scrollbar-hide">
                            <p className="font-bold mb-1 uppercase tracking-tighter opacity-50">Component Stack</p>
                            {errorInfo.componentStack}
                          </div>
                        )}
                        <Button
                          onClick={this.handleReset}
                          variant="ghost"
                          size="sm"
                          className="w-full mt-6 rounded-xl border border-border hover:bg-accent"
                        >
                          Attempt Recovery
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Error code: 0x{errorCount.toString(16).padStart(4, '0')}
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
