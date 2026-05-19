const KWATI_LOGO_URL = '/logo.png';

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
    });
}

function inferExtension(contentType: string): string {
    if (contentType.includes('jpeg')) return 'jpg';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
    return 'png';
}

async function buildWatermarkedBlob(imageBlob: Blob): Promise<Blob> {
    const sourceObjectUrl = URL.createObjectURL(imageBlob);
    try {
        const [sourceImage, logoImage] = await Promise.all([
            loadImage(sourceObjectUrl),
            loadImage(KWATI_LOGO_URL),
        ]);

        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.naturalWidth || sourceImage.width;
        canvas.height = sourceImage.naturalHeight || sourceImage.height;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Canvas context unavailable');
        }

        context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        const maxLogoWidth = Math.max(120, Math.floor(canvas.width * 0.18));
        const maxLogoHeight = Math.max(36, Math.floor(canvas.height * 0.12));
        const scale = Math.min(maxLogoWidth / logoImage.width, maxLogoHeight / logoImage.height, 1);
        const logoWidth = Math.max(1, Math.floor(logoImage.width * scale));
        const logoHeight = Math.max(1, Math.floor(logoImage.height * scale));
        const offsetX = Math.max(18, Math.floor(canvas.width * 0.025));
        const offsetY = Math.max(18, Math.floor(canvas.height * 0.025));
        const x = canvas.width - logoWidth - offsetX;
        const y = canvas.height - logoHeight - offsetY;

        context.globalAlpha = 0.9;
        context.drawImage(logoImage, x, y, logoWidth, logoHeight);
        context.globalAlpha = 1;

        const outputType = imageBlob.type || 'image/png';

        return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to render watermarked image'));
                    return;
                }
                resolve(blob);
            }, outputType);
        });
    } finally {
        URL.revokeObjectURL(sourceObjectUrl);
    }
}

function triggerDownload(blob: Blob, fileName: string) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    }, 1000);
}

export async function downloadImageWithKwatiWatermark(
    sourceUrl: string,
    fileNameBase: string,
    fetchOptions?: RequestInit,
): Promise<void> {
    const response = await fetch(sourceUrl, fetchOptions);
    if (!response.ok) {
        throw new Error('Download failed');
    }

    const contentType = response.headers.get('content-type') ?? 'image/png';
    if (contentType.includes('text/html')) {
        throw new Error('Unexpected HTML response');
    }

    const originalBlob = await response.blob();
    const fileName = fileNameBase.match(/\.(png|jpe?g|webp|gif)$/i)
        ? fileNameBase
        : `${fileNameBase}.${inferExtension(contentType)}`;

    try {
        const watermarkedBlob = await buildWatermarkedBlob(originalBlob);
        triggerDownload(watermarkedBlob, fileName);
        return;
    } catch {
        triggerDownload(originalBlob, fileName);
    }
}

export function getKwatiWatermarkLogoUrl(): string {
    return KWATI_LOGO_URL;
}
