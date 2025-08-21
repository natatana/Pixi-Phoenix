import { useEffect, useState } from "react";
import { Assets, Texture } from "pixi.js";

interface Props {
    assetUrl: string;
    width: number;
    height: number;
}

export function BackgroundSprite({ assetUrl, width, height }: Props) {
    const [texture, setTexture] = useState(Texture.EMPTY);

    useEffect(() => {
        const tex = Assets.get(assetUrl) as Texture | undefined;
        setTexture(tex ?? Texture.EMPTY);
    }, [assetUrl]);

    return (
        <pixiSprite
            texture={texture}
            width={width}
            height={height}
            anchor={{ x: 0, y: 0 }}
            x={0}
            y={0}
        />
    );
}
