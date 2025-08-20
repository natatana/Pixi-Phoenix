import { Assets, Texture } from "pixi.js";
import { useEffect, useState } from "react";

export function BackgroundSprite({ assetUrl }: { assetUrl: string }) {
    const [texture, setTexture] = useState(Texture.EMPTY);

    useEffect(() => {
        if (texture === Texture.EMPTY) {
            const tex = (Assets.get(assetUrl) as Texture) ?? Texture.EMPTY;
            setTexture(tex);
        }
    }, [texture, assetUrl]);

    return (
        <pixiSprite
            texture={texture}
            width={window.innerWidth}
            height={window.innerHeight}
            anchor={{ x: 0, y: 0 }}
            x={0}
            y={0}
        />
    );
}