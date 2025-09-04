import React, { useEffect, useRef, useState } from "react";
import { Assets, BlurFilter, Texture } from "pixi.js";

interface Props {
    assetUrl: string;
    width: number;
    height: number;
    gameOver?: boolean;
}

const BackgroundSprite = React.memo(function BackgroundSprite({ assetUrl, width, height, gameOver }: Props) {
    const [texture, setTexture] = useState(Texture.from("images/stadium-4VozNg.jpg"));
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
            filters={gameOver ? [new BlurFilter({ strength: 5 })] : []}
        />
    );
},
    (prev, next) =>
        prev.assetUrl === next.assetUrl &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.gameOver === next.gameOver
);

export { BackgroundSprite };