import { useEffect } from 'react';

interface ExternalAdProps {
    keyId: string;
    width?: number;
    height?: number;
    format?: 'iframe' | 'banner';
}

export function ExternalAd({
    keyId,
    width = 300,
    height = 250,
    format = 'iframe',
}: ExternalAdProps) {
    useEffect(() => {
        // Set up the ad options
        (window as any).atOptions = {
            key: keyId,
            format: format,
            height: height,
            width: width,
            params: {},
        };

        // Create and inject the script
        const script = document.createElement('script');
        script.src = `https://www.highperformanceformat.com/${keyId}/invoke.js`;
        script.async = true;
        script.type = 'text/javascript';

        document.body.appendChild(script);

        return () => {
            // Cleanup: remove the script when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [keyId, width, height, format]);

    return (
        <div className="flex justify-center items-center py-4">
            {/* The ad will be injected here by the external script */}
        </div>
    );
}
