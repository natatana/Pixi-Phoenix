// WinnerPointsOverlay.tsx
import { useEffect, useState } from "react";
import { Sound } from "../utils/SoundManager";

interface WinnerPointsOverlayProps {
    songTitle: string;
    singer: string;
    bonus: number;
    points: {
        song: number;
        singer: number;
    };
    scale?: number;
}

export function WinnerPointsOverlay({
    songTitle,
    singer,
    // bonus,
    points,
    scale = 1,
}: WinnerPointsOverlayProps) {
    // Animation state
    const [songAlpha, setSongAlpha] = useState(0);
    const [singerAlpha, setSingerAlpha] = useState(0);

    useEffect(() => {
        setSongAlpha(0);
        setSingerAlpha(0);
        // Results just became visible: play correct SFX once
        try { Sound.playRoundResultsCorrect(); } catch { }
        // Animate song row after 500ms with shine
        const t1 = setTimeout(() => {
            try {
                Sound.playShine();
            }
            catch { }
            setSongAlpha(1);
        }, 500);
        // Animate singer row after 1000ms with shine
        const t2 = setTimeout(() => {
            try {
                Sound.playShine();
            }
            catch { }
            setSingerAlpha(1);
        }, 1000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [songTitle, singer, points.song, points.singer]);

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
                        fontWeight: "500",
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
                        fontFamily: ["Gilroy", 'serif'],
                        fontWeight: "bold",
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
                        fontWeight: "500",
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
                        fontFamily: ["Gilroy", 'serif'],
                        fontWeight: "bold",
                    }}
                />
            </pixiContainer>
        </pixiContainer>
    );
}