import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Application, extend } from "@pixi/react";
import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { BackgroundSprite } from "../components/BackgroundSprite";
// import { Sound } from "../utils/SoundManager";

extend({
    Container,
    Graphics,
    Sprite,
    Text,
});

function requestAnimationFrame30(callback: (timestamp: number) => void) {
    const frameDuration = 1000 / 30; // 33.33ms
    let lastTime = 0;
    function loop(ts: number) {
        if (ts - lastTime >= frameDuration) {
            lastTime = ts;
            callback(ts);
        } else {
            requestAnimationFrame(loop);
        }
    }
    requestAnimationFrame(loop);
}

export const SelectRoundScreen = memo(function SelectRoundScreen(
    {
        onSelectRound,
        scaleX,
        scaleY,
        windowSize
    }: {
        onSelectRound: (round: string) => void;
        scaleX: number;
        scaleY: number;
        windowSize: { width: number; height: number }
    }
) {
    const ITEM_WIDTH = 330 * scaleX;
    const ITEM_HEIGHT = 528 * scaleY;
    const ITEM_SPACING = 48 * scaleX;
    const LR_SPACING = (windowSize.width - ITEM_WIDTH * 3 - ITEM_SPACING * 2) / 2
    const scale = Math.min(scaleX, scaleY);

    const [modalTexture, setModalTexture] = useState(Texture.EMPTY);
    const [round1Texture, setRound1Texture] = useState(Texture.EMPTY);
    const [round2Texture, setRound2Texture] = useState(Texture.EMPTY);
    const [round3Texture, setRound3Texture] = useState(Texture.EMPTY);
    const [showCards, setShowCards] = useState([false, false, false]);
    const [cardAlphas, setCardAlphas] = useState([0, 0, 0]);
    const fadeStarted = useRef([false, false, false]);
    const [showGradient, setShowGradient] = useState(false);
    const [gradientAlpha, setGradientAlpha] = useState(0);
    const [containerAlpha, setContainerAlpha] = useState(1);
    const [shouldFadeOut, setShouldFadeOut] = useState(false);

    useEffect(() => {
        async function loadTextures() {
            const modal = Assets.get("images/selectround/modal.png") as Texture | undefined;
            const round1 = Assets.get("images/selectround/round1.png") as Texture | undefined;
            const round2 = Assets.get("images/selectround/round2.png") as Texture | undefined;
            const round3 = Assets.get("images/selectround/round3.png") as Texture | undefined;
            setModalTexture(modal ?? Texture.EMPTY);
            setRound1Texture(round1 ?? Texture.EMPTY);
            setRound2Texture(round2 ?? Texture.EMPTY);
            setRound3Texture(round3 ?? Texture.EMPTY);
        }
        loadTextures();
    }, []);

    useEffect(() => {
        setShowCards([false, false, false]);
        const modalTimer = setTimeout(() => {
            // Show first card after modal
            const card1Timer = setTimeout(() => {
                setShowCards([true, false, false]);
                // Show second card
                const card2Timer = setTimeout(() => {
                    setShowCards([true, true, false]);
                    // Show third card
                    const card3Timer = setTimeout(() => {
                        setShowCards([true, true, true]);
                    }, 1000); // delay between 2nd and 3rd card
                    return () => clearTimeout(card3Timer);
                }, 1000); // delay between 1st and 2nd card
                return () => clearTimeout(card2Timer);
            }, 1000); // delay after modal for 1st card
            return () => clearTimeout(card1Timer);
        }, 1000); // initial delay for modal

        return () => {
            clearTimeout(modalTimer);
        };
    }, [windowSize.width, windowSize.height, scaleX, scaleY]);

    useEffect(() => {
        showCards.forEach((show, i) => {
            if (show && !fadeStarted.current[i]) {
                fadeStarted.current[i] = true;
                let start: number | null = null;
                const duration = 1000;
                function animateAlpha(ts: number) {
                    if (start === null) start = ts;
                    const progress = Math.min((ts - start) / duration, 1);
                    setCardAlphas(prev => {
                        const next = [...prev];
                        next[i] = progress;
                        return next;
                    });
                    if (progress < 1) {
                        requestAnimationFrame30(animateAlpha);
                    } else {
                        if (i == 2) setShowGradient(true)
                    }
                }
                requestAnimationFrame30(animateAlpha);
            }
            if (!show && cardAlphas[i] !== 0) {
                setCardAlphas(prev => {
                    const next = [...prev];
                    next[i] = 0;
                    return next;
                });
                fadeStarted.current[i] = false;
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCards]);

    useEffect(() => {
        if (showGradient) {
            let start: number | null = null;
            const duration = 500;
            function animateGradient(ts: number) {
                if (start === null) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                setGradientAlpha(progress);
                if (progress < 1) {
                    requestAnimationFrame30(animateGradient);
                }
            }
            setGradientAlpha(0); // reset before animating
            requestAnimationFrame30(animateGradient);
            const timer = setTimeout(() => {
                setShouldFadeOut(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setGradientAlpha(0);
        }
    }, [showGradient]);

    useEffect(() => {
        if (shouldFadeOut) {
            let start: number | null = null;
            const duration = 1000;
            function animateFadeOut(ts: number) {
                if (start === null) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                setContainerAlpha(1 - progress);
                if (progress < 1) {
                    requestAnimationFrame30(animateFadeOut);
                } else {
                    onSelectRound("round1");
                }
            }
            requestAnimationFrame30(animateFadeOut);
        } else {
            setContainerAlpha(1);
        }
    }, [shouldFadeOut]);

    // Utility to create a radial gradient texture
    function createRadialGradientTexture(
        width = 0,
        height = 0,
        radius = 24
    ) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, height
        );
        // Ensure color is rgba
        gradient.addColorStop(0, `#11024D`);
        gradient.addColorStop(1, `#9279FF`);
        ctx.save();
        // Draw rounded rect path
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return Texture.from(canvas);
    }

    const gradientTexture = useMemo(
        () => createRadialGradientTexture(ITEM_WIDTH, ITEM_HEIGHT),
        [scaleX]
    );

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <BackgroundSprite assetUrl="images/stadium.jpg" width={windowSize.width} height={windowSize.height} />
            <pixiContainer alpha={containerAlpha}>
                <pixiSprite
                    texture={modalTexture}
                    anchor={0.5}
                    x={windowSize.width / 2}
                    y={windowSize.height / 2}
                    width={1600 * scaleX}
                    height={1080 * scaleY}
                />
                {/* Three Round Cards */}
                {[0, 1, 2].map(i => (
                    <pixiContainer
                        x={LR_SPACING + i * ITEM_WIDTH + i * ITEM_SPACING + ITEM_WIDTH / 2}
                        y={windowSize.height / 2}
                        key={i}
                        anchor={0.5}
                        alpha={cardAlphas[i]}
                        visible={showCards[i] || cardAlphas[i] > 0}
                    >
                        {/* Card */}
                        <pixiGraphics
                            draw={g => {
                                g.clear();
                                g.lineStyle(2, 0x3c2a6e, 1);
                                g.beginFill(0x23124d, 0);
                                g.drawRoundedRect(-165 * scaleX, -264 * scaleY, ITEM_WIDTH, ITEM_HEIGHT, 24);
                                g.endFill();
                            }}
                        />
                        {/* Gradient overlay for first card after all cards are shown */}
                        {i === 0 && showGradient && (
                            <pixiSprite
                                texture={gradientTexture}
                                width={ITEM_WIDTH}
                                height={ITEM_HEIGHT}
                                y={0}
                                anchor={0.5}
                                alpha={gradientAlpha}
                            />
                        )}
                        {/* Title */}
                        <pixiText text={`Round ${i + 1}`} anchor={0.5} y={-200 * scaleY} style={{ fontSize: 42 * scale, fill: "#00FFD1", fontWeight: "bold", fontFamily: ["Gilroy", 'serif'], }} />
                        {/* Points Badge */}
                        <pixiGraphics
                            draw={g => {
                                g.clear();
                                g.beginFill(0x00ffd0, 1);
                                g.drawRoundedRect(-60 * scaleX, -155 * scaleY, 120 * scaleX, 50 * scaleY, 40);
                                g.endFill();
                            }}
                        />
                        <pixiText text={`${[10, 15, 20][i]} pts`} anchor={0.5} y={-130 * scaleY} style={{ fontSize: 32 * scale, fill: "#1a093a", fontWeight: "bold", fontFamily: ["Gilroy", 'serif'], }} />
                        {/* Image */}
                        <pixiSprite texture={i == 0 ? round1Texture : i == 1 ? round2Texture : round3Texture} width={234 * scaleX} height={234 * scaleY} y={40 * scaleY} anchor={0.5} />
                        {/* Subtitle */}
                        <pixiText
                            text={["2020's", "Today's Top Hits", "Kids Movies"][i]}
                            anchor={0.5}
                            y={190 * scaleY}
                            style={{ fontSize: 32 * scale, fill: "#fff", fontFamily: ["Gilroy", 'serif'] }}
                        />
                    </pixiContainer>
                ))}
            </pixiContainer>
        </Application>
    );
});