// src/scenes/SplashScreen.tsx
import { useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { BackgroundSprite } from "../components/BackgroundSprite";

extend({
    Container,
    Graphics,
    Sprite,
    Text,
});

export function SplashScreen({ onContinue, windowSize }: { onContinue: () => void; windowSize: { width: number; height: number } }) {
    useEffect(() => {
        const timeout = setTimeout(onContinue, 2500);
        return () => clearTimeout(timeout);
    }, [onContinue]);

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer>
                <BackgroundSprite assetUrl="/images/splash.jpg" />
            </pixiContainer>
        </Application>
    );
}