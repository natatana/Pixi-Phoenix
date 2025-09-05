import { Texture } from "pixi.js";
import { useEffect, useMemo, useState } from "react";

interface BackgroundVideoProps {
    src: string;
    width: number;
    height: number;
}

export function BackgroundVideo({ src, width, height }: BackgroundVideoProps) {
    const [isVideoReady, setIsVideoReady] = useState(false);

    const texture = useMemo(() => {
        const texture = Texture.from(src);
        const video = texture.source.resource as HTMLVideoElement;

        video.muted = true;
        video.loop = false;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "auto"; // Preload the video

        video.oncanplaythrough = () => setIsVideoReady(true);

        video.play().catch(() => {
            console.warn("Autoplay blocked — will play after user interaction");
        });

        return texture;
    }, [src]);

    useEffect(() => {
        if (isVideoReady) {
            // Additional logic if needed when video is ready
        }
    }, [isVideoReady]);

    return (
        <>
            {!isVideoReady && (
                <pixiSprite
                    texture={Texture.from("images/stadium-4VozNg.jpg")} // Placeholder image
                    width={width}
                    height={height}
                />
            )}
            {isVideoReady && (
                <pixiSprite
                    texture={texture}
                    width={width}
                    height={height}
                />
            )}
        </>
    );
}
