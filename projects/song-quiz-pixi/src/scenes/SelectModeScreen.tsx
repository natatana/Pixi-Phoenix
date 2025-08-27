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
        scaleX,
        scaleY,
        windowSize }:
        {
            onSelectMode: (mode: string) => void;
            scaleX: number;
            scaleY: number;
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
            const sTexture = Assets.get("images/selectmode/single.png") as Texture | undefined;
            const sHighlightTexture = Assets.get("images/selectmode/single_highlight.png") as Texture | undefined;
            const mTexture = Assets.get("images/selectmode/multi.png") as Texture | undefined;
            const mHighlightTexture = Assets.get("images/selectmode/multi_highlight.png") as Texture | undefined;
            const emailus = Assets.get("images/selectmode/emailus.png") as Texture | undefined;
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
                <BackgroundSprite assetUrl="images/selectmode.jpg" width={windowSize.width} height={windowSize.height} />
                <pixiSprite
                    texture={hovered === "single" ? singleHighlightTexture : singleTexture}
                    anchor={{ x: 0, y: 0.5 }}
                    x={566 * scaleX}
                    y={810 * scaleY}
                    scale={scaleX}
                    interactive={true}
                    onPointerTap={() => onSelectMode("single")}
                    onPointerOver={() => setHovered("single")}
                />
                <pixiSprite
                    texture={hovered === "multi" ? multiHighlightTexture : multiTexture}
                    anchor={{ x: 0, y: 0.5 }}
                    x={992 * scaleX}
                    y={810 * scaleY}
                    scale={scaleX}
                    interactive={true}
                    onPointerTap={() => onSelectMode("multi")}
                    onPointerOver={() => setHovered("multi")}
                />
                <pixiSprite
                    texture={emailusTexture}
                    anchor={{ x: 1, y: 1 }}
                    x={1880 * scaleX}
                    y={1040 * scaleY}
                    scale={scaleX}
                />
            </pixiContainer>
        </Application>
    );
}