import React, { useEffect, useRef, useState } from "react";
import { Assets, Texture } from "pixi.js";

interface Props {
    assetUrl: string;
    width: number;
    height: number;
}

const BackgroundSprite = React.memo(function BackgroundSprite({ assetUrl, width, height }: Props) {
    const [texture, setTexture] = useState(Texture.EMPTY);
    const spriteRef = useRef<any>(null);

    useEffect(() => {
        const tex = Assets.get(assetUrl) as Texture | undefined;
        setTexture(tex ?? Texture.EMPTY);
    }, [assetUrl]);

    useEffect(() => {
        if (spriteRef.current) {
            spriteRef.current.cacheAsTexture = true; // ✅ Pixi property set directly
        }
    }, [texture]);

    return (
        <pixiSprite
            ref={spriteRef}
            texture={texture}
            width={width}
            height={height}
            anchor={{ x: 0, y: 0 }}
            x={0}
            y={0}
        />
    );
},
    (prev, next) =>
        prev.assetUrl === next.assetUrl &&
        prev.width === next.width &&
        prev.height === next.height
);

export { BackgroundSprite };
