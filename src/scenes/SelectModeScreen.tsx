import { useEffect, useState } from "react";
import { Application, extend } from "@pixi/react";
import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { BackgroundSprite } from "../components/BackgroundSprite";

extend({
    Container,
    Graphics,
    Sprite,
    Text,
});
export function SelectModeScreen(
    {
        onSelectMode,
        scale,
        windowSize }:
        {
            onSelectMode: (mode: string) => void;
            scale: number;
            windowSize: { width: number; height: number }
        }
) {
    const [singleTexture, setSingleTexture] = useState(Texture.EMPTY);
    const [singleHighlightTexture, setSingleHighlightTexture] = useState(Texture.EMPTY);
    const [multiTexture, setMultiTexture] = useState(Texture.EMPTY);
    const [multiHighlightTexture, setMultiHighlightTexture] = useState(Texture.EMPTY);
    const [emailusTexture, setEmailusTexture] = useState(Texture.EMPTY);

    const [hovered, setHovered] = useState<"single" | "multi">("single");

    useEffect(() => {
        async function loadTextures() {
            const [sTexture, sHighlightTexture, mTexture, mHighlightTexture, emailus] = await Promise.all([
                Assets.load("/images/selectmode/single.png"),
                Assets.load("/images/selectmode/single_highlight.png"),
                Assets.load("/images/selectmode/multi.png"),
                Assets.load("/images/selectmode/multi_highlight.png"),
                Assets.load("/images/selectmode/emailus.png"),
            ]);
            setSingleTexture(sTexture ?? Texture.EMPTY);
            setSingleHighlightTexture(sHighlightTexture ?? Texture.EMPTY);
            setMultiTexture(mTexture ?? Texture.EMPTY);
            setMultiHighlightTexture(mHighlightTexture ?? Texture.EMPTY);
            setEmailusTexture(emailus ?? Texture.EMPTY);
        }
        loadTextures();
    });

    const texturesLoaded =
        singleTexture !== Texture.EMPTY &&
        singleHighlightTexture !== Texture.EMPTY &&
        multiTexture !== Texture.EMPTY &&
        multiHighlightTexture !== Texture.EMPTY &&
        emailusTexture !== Texture.EMPTY;

    if (!texturesLoaded) {
        return <div>Loading...</div>;
    }
    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer>
                <BackgroundSprite assetUrl="/images/selectmode.jpg" />
                <pixiSprite
                    texture={hovered === "single" ? singleHighlightTexture : singleTexture}
                    anchor={{ x: 0, y: 1 }}
                    x={566 * scale}
                    y={windowSize.height - 141}
                    scale={scale}
                    interactive={true}
                    onPointerTap={() => onSelectMode("single")}
                    onPointerOver={() => setHovered("single")}
                />
                <pixiSprite
                    texture={hovered === "multi" ? multiHighlightTexture : multiTexture}
                    anchor={{ x: 0, y: 1 }}
                    x={992 * scale}
                    y={windowSize.height - 141}
                    scale={scale}
                    interactive={true}
                    onPointerTap={() => onSelectMode("multi")}
                    onPointerOver={() => setHovered("multi")}
                />
                <pixiSprite
                    texture={emailusTexture}
                    anchor={{ x: 1, y: 1 }}
                    x={windowSize.width - 40 * scale}
                    y={windowSize.height - 40 * scale}
                    scale={scale}
                />
            </pixiContainer>
        </Application>
    );
}