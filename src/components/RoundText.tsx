import { useRef } from "react";

interface RoundTextProps {
  x: number;
  y: number;
  scale: number;
  roundNumber: number;
  totalRounds: number;
}

export function RoundText({
  x,
  y,
  scale,
  roundNumber,
  totalRounds,
}: RoundTextProps) {
  const containerRef = useRef(null);

  return (
    <pixiContainer ref={containerRef} x={x} y={y}>
      {/* Background */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.75);
          g.drawRoundedRect(-10 * scale, -10 * scale, 300 * scale, 50 * scale, 50 * scale);
          g.endFill();
        }}
      />

      {/* Today's Top Hits text */}
      <pixiText
        text="Today's Top Hits"
        anchor={{ x: 0, y: 0.5 }}
        x={10 * scale}
        y={15 * scale}
        style={{
          fontSize: 20 * scale,
          fill: 0xFFFFFF,
          fontWeight: "bold",
        }}
      />

      {/* Round text */}
      <pixiText
        text={`Round ${roundNumber}/${totalRounds}`}
        anchor={{ x: 0, y: 0.5 }}
        x={180 * scale}
        y={15 * scale}
        alpha={0.75}
        style={{
          fontSize: 20 * scale,
          fill: 0xDEDAF7,
          fontWeight: "bold",
        }}
      />
    </pixiContainer>
  );
}
