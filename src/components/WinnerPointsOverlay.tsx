// WinnerPointsOverlay.tsx
import { useEffect, useState } from "react";
import { Sound } from "../sound/SoundManager";

interface WinnerPointsOverlayProps {
    songTitle: string;
    singer: string;
    bonus: number;
    points: {
        song: number;
        singer: number;
    };
    visible: boolean;
    scale?: number;
}

function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

export function WinnerPointsOverlay({
    songTitle,
    singer,
    // bonus,
    points,
    visible,
    scale = 1,
}: WinnerPointsOverlayProps) {
    // Animation state
    const [songAlpha, setSongAlpha] = useState(0);
    const [singerAlpha, setSingerAlpha] = useState(0);

    // Animate alpha with ease-out
    function animateAlpha(setter: (a: number) => void, duration: number, onStart?: () => void) {
        let start: number | null = null;
        if (onStart) onStart();
        function step(ts: number) {
            if (start === null) start = ts;
            const elapsed = ts - start;
            const t = Math.min(elapsed / duration, 1);
            setter(easeOutCubic(t));
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    useEffect(() => {
        if (visible) {
            setSongAlpha(0);
            setSingerAlpha(0);
            // Results just became visible: play correct SFX once
            try { Sound.playRoundResultsCorrect(); } catch { }
            // Animate song row after 500ms with shine
            const t1 = setTimeout(() => animateAlpha(setSongAlpha, 1000, () => { try { Sound.playShine(); } catch { } }), 500);
            // Animate singer row after 1000ms with shine
            const t2 = setTimeout(() => animateAlpha(setSingerAlpha, 1000, () => { try { Sound.playShine(); } catch { } }), 1000);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        } else {
            setSongAlpha(0);
            setSingerAlpha(0);
        }
    }, [visible, songTitle, singer, points.song, points.singer]);

    if (!visible) return null;
    // Layout constants
    const width = 320 * scale;
    const padding = 16 * scale;
    const rowHeight = 48 * scale; // increased height for each row
    const rowGap = 16 * scale;    // gap between rows
    const fontSize = 22 * scale;

    return (
        <pixiContainer
            x={0}
            y={-280 * scale}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={100}
        >
            {/* Song Title Row */}
            <pixiContainer
                alpha={songAlpha}
                interactive={false}
            >
                <pixiGraphics
                    draw={g => {
                        g.clear();
                        g.lineStyle(2 * scale, 0xECDEFF, 1);
                        g.beginFill(0x181828, 0.5);
                        g.drawRoundedRect(
                            -width / 2 + padding / 2,
                            padding + rowHeight - 6 * scale,
                            width - padding,
                            rowHeight,
                            10 * scale
                        );
                        g.endFill();
                    }}
                />
                <pixiText
                    text={songTitle}
                    anchor={{ x: 0, y: 0.5 }}
                    x={-width / 2 + padding + 8}
                    y={padding + rowHeight + rowHeight / 2 - 6 * scale}
                    style={{
                        fontSize,
                        fill: 0xffffff,
                        fontWeight: "600",
                        fontFamily: ["Gilroy", 'serif'],
                    }}
                />
                <pixiText
                    text={`+${points.song}`}
                    anchor={{ x: 1, y: 0.5 }}
                    x={width / 2 - padding - 8}
                    y={padding + rowHeight + rowHeight / 2 - 6 * scale}
                    style={{
                        fontSize: fontSize + 5,
                        fill: 0x00ffd1,
                        fontWeight: "800",
                    }}
                />
            </pixiContainer>

            {/* Singer Row */}
            <pixiContainer
                alpha={singerAlpha}
                interactive={false}
            >
                <pixiGraphics
                    draw={g => {
                        g.clear();
                        g.lineStyle(2 * scale, 0xECDEFF, 1);
                        g.beginFill(0x181828, 0.5);
                        g.drawRoundedRect(
                            -width / 2 + padding / 2,
                            padding + rowHeight * 2 + rowGap - 6 * scale,
                            width - padding,
                            rowHeight,
                            10 * scale
                        );
                        g.endFill();
                    }}
                />
                <pixiText
                    text={singer}
                    anchor={{ x: 0, y: 0.5 }}
                    x={-width / 2 + padding + 8}
                    y={padding + rowHeight * 2 + rowGap + rowHeight / 2 - 6 * scale}
                    style={{
                        fontSize,
                        fill: 0xffffff,
                        fontWeight: "600",
                        fontFamily: ["Gilroy", 'serif'],
                    }}
                />
                <pixiText
                    text={`+${points.singer}`}
                    anchor={{ x: 1, y: 0.5 }}
                    x={width / 2 - padding - 8}
                    y={padding + rowHeight * 2 + rowGap + rowHeight / 2 - 6 * scale}
                    style={{
                        fontSize: fontSize + 5,
                        fill: 0x00ffd1,
                        fontWeight: "800",
                    }}
                />
            </pixiContainer>
        </pixiContainer>
    );
}