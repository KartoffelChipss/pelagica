export interface ImagePalette {
    colors: [string, string, string];
    gradient: string;
    isDark: boolean;
}

type Rgb = { r: number; g: number; b: number };

function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex: string): Rgb | null {
    const match = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
    if (!match) return null;
    const value = parseInt(match[1], 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function getLuminance({ r, g, b }: Rgb): number {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function colorDistance(a: Rgb, b: Rgb): number {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function pickDistinctColors(colors: Rgb[], count = 3): Rgb[] {
    if (colors.length === 0) return [];
    const picked = [colors[0]];

    while (picked.length < count && picked.length < colors.length) {
        let best = colors[0];
        let bestScore = -1;

        for (const candidate of colors) {
            if (picked.some((color) => colorDistance(color, candidate) < 1)) continue;
            const minDistance = Math.min(...picked.map((color) => colorDistance(color, candidate)));
            if (minDistance > bestScore) {
                bestScore = minDistance;
                best = candidate;
            }
        }

        if (picked.some((color) => colorDistance(color, best) < 1)) break;
        picked.push(best);
    }

    return picked;
}

function darkenHex(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const factor = 1 - amount;
    return rgbToHex(
        Math.round(rgb.r * factor),
        Math.round(rgb.g * factor),
        Math.round(rgb.b * factor)
    );
}

function buildGradient(colors: [string, string, string]): string {
    const stops = colors.map((color, index) => darkenHex(color, 0.12 + index * 0.06));
    return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 48%, ${stops[2]} 100%)`;
}

export async function extractImagePalette(imageUrl: string): Promise<ImagePalette | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const size = 64;
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) {
                    resolve(null);
                    return;
                }

                ctx.drawImage(img, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;
                const buckets = new Map<string, Rgb & { count: number }>();

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const alpha = data[i + 3];

                    if (alpha < 128) continue;

                    const luminance = getLuminance({ r, g, b });
                    if (luminance < 0.07 || luminance > 0.93) continue;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max === 0 ? 0 : (max - min) / max;
                    if (saturation < 0.08) continue;

                    const qr = Math.round(r / 24) * 24;
                    const qg = Math.round(g / 24) * 24;
                    const qb = Math.round(b / 24) * 24;
                    const key = `${qr},${qg},${qb}`;

                    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
                    bucket.r += r;
                    bucket.g += g;
                    bucket.b += b;
                    bucket.count += 1;
                    buckets.set(key, bucket);
                }

                const averaged = [...buckets.values()]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 12)
                    .map(({ r, g, b, count }) => ({
                        r: Math.round(r / count),
                        g: Math.round(g / count),
                        b: Math.round(b / count),
                    }));

                if (averaged.length === 0) {
                    resolve(null);
                    return;
                }

                const distinct = pickDistinctColors(averaged, 3);
                while (distinct.length < 3) {
                    distinct.push(distinct[distinct.length - 1]);
                }

                const colors = distinct.slice(0, 3).map(({ r, g, b }) => rgbToHex(r, g, b)) as [
                    string,
                    string,
                    string,
                ];
                const gradient = buildGradient(colors);
                const avgLuminance =
                    distinct.reduce((sum, color) => sum + getLuminance(color), 0) / distinct.length;

                resolve({
                    colors,
                    gradient,
                    isDark: avgLuminance < 0.5,
                });
            } catch {
                resolve(null);
            }
        };

        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}
