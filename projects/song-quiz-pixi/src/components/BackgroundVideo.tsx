import { Texture } from "pixi.js";
import { useMemo } from "react";

interface BackgroundVideoProps {
    src: string;
    width: number;
    height: number;
}

export function BackgroundVideo({ src, width, height }: BackgroundVideoProps) {

    // Create video texture once
    const texture = useMemo(() => {
        const texture = Texture.from(src);
        const video = texture.source.resource as HTMLVideoElement;

        // Ensure autoplay works across browsers
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;

        video.play().catch(() => {
            console.warn("Autoplay blocked — will play after user interaction");
        });

        return texture;
    }, [src]);

    return <pixiSprite texture={texture} width={width} height={height} />;
}
