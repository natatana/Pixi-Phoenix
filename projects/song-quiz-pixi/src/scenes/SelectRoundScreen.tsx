import { memo, useEffect, useRef, useState } from "react";
import { Sound } from "../utils/SoundManager";

const CARD_DATA = [
    {
        title: "Round 1",
        points: 10,
        image: "images/selectround/round1.png",
        subtitle: "2020's",
    },
    {
        title: "Round 2",
        points: 15,
        image: "images/selectround/round2.png",
        subtitle: "Today's Top Hits",
    },
    {
        title: "Round 3",
        points: 20,
        image: "images/selectround/round3.png",
        subtitle: "Kids Movies",
    },
];

export const SelectRoundScreen = memo(function SelectRoundScreen({
    onSelectRound,
    scaleX,
    scaleY,
    windowSize,
}: {
    onSelectRound: (round: string) => void;
    scaleX: number;
    scaleY: number;
    windowSize: { width: number; height: number };
}) {
    const [showCards, setShowCards] = useState([false, false, false]);
    const [cardAlphas, setCardAlphas] = useState([0, 0, 0]);
    const fadeStarted = useRef([false, false, false]);
    const [showGradient, setShowGradient] = useState(false);
    const [gradientAlpha, setGradientAlpha] = useState(0);
    const [containerAlpha, setContainerAlpha] = useState(1);
    const [shouldFadeOut, setShouldFadeOut] = useState(false);

    // Card reveal sequence
    useEffect(() => {
        setShowCards([false, false, false]);
        const modalTimer = setTimeout(() => {
            const card1Timer = setTimeout(() => {
                setShowCards([true, false, false]);
                const card2Timer = setTimeout(() => {
                    setShowCards([true, true, false]);
                    const card3Timer = setTimeout(() => {
                        setShowCards([true, true, true]);
                    }, 1000);
                    return () => clearTimeout(card3Timer);
                }, 1000);
                return () => clearTimeout(card2Timer);
            }, 1000);
            return () => clearTimeout(card1Timer);
        }, 1000);

        return () => {
            clearTimeout(modalTimer);
        };
    }, [windowSize.width, windowSize.height, scaleX, scaleY]);

    // Fade in cards
    useEffect(() => {
        showCards.forEach((show, i) => {
            if (show && !fadeStarted.current[i]) {
                fadeStarted.current[i] = true;
                let start: number | null = null;
                const duration = 1000;
                function animateAlpha(ts: number) {
                    if (start === null) start = ts;
                    const progress = Math.min((ts - start) / duration, 1);
                    setCardAlphas((prev) => {
                        const next = [...prev];
                        next[i] = progress;
                        return next;
                    });
                    if (progress < 1) {
                        requestAnimationFrame(animateAlpha);
                    } else {
                        if (i === 2) setShowGradient(true);
                    }
                }
                requestAnimationFrame(animateAlpha);
            }
            if (!show && cardAlphas[i] !== 0) {
                setCardAlphas((prev) => {
                    const next = [...prev];
                    next[i] = 0;
                    return next;
                });
                fadeStarted.current[i] = false;
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCards]);

    // Fade in gradient overlay after all cards
    useEffect(() => {
        if (showGradient) {
            let start: number | null = null;
            const duration = 500;
            function animateGradient(ts: number) {
                if (start === null) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                setGradientAlpha(progress);
                if (progress < 1) {
                    requestAnimationFrame(animateGradient);
                }
            }
            setGradientAlpha(0);
            requestAnimationFrame(animateGradient);
            const timer = setTimeout(() => {
                setShouldFadeOut(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setGradientAlpha(0);
        }
    }, [showGradient]);

    // Fade out everything, then call onSelectRound
    useEffect(() => {
        if (shouldFadeOut) {
            Sound.stopIntro();
            Sound.playStartCheer();
            let start: number | null = null;
            const duration = 1000;
            function animateFadeOut(ts: number) {
                if (start === null) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                setContainerAlpha(1 - progress);
                if (progress < 1) {
                    requestAnimationFrame(animateFadeOut);
                } else {
                    onSelectRound("round1");
                }
            }
            requestAnimationFrame(animateFadeOut);
        }
    }, [shouldFadeOut, onSelectRound]);

    // Layout
    const ITEM_WIDTH = 330 * scaleX;
    const ITEM_HEIGHT = 528 * scaleY;
    const ITEM_SPACING = 48 * scaleX;
    const LR_SPACING = (windowSize.width - ITEM_WIDTH * 3 - ITEM_SPACING * 2) / 2;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div
            className="select-round-bg"
            style={{
                width: windowSize.width,
                height: windowSize.height,
                transition: "opacity 0.3s",
                position: "relative",
                overflow: "hidden",
                background: `url(images/stadium-4VozNg.jpg) center/cover no-repeat`,
            }}
        >
            {/* Modal background */}
            <img
                src="images/selectround/modal.png"
                alt="modal"
                className="select-round-modal"
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    opacity: containerAlpha,
                    width: 1600 * scaleX,
                    height: 1080 * scaleY,
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />
            {/* Cards */}
            <div
                className="select-round-cards"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    position: "absolute",
                    left: LR_SPACING,
                    top: "50%",
                    transform: `translateY(-50%)`,
                    zIndex: 2,
                    opacity: containerAlpha,
                }}
            >
                {CARD_DATA.map((card, i) => (
                    <div
                        key={i}
                        className="select-round-card"
                        style={{
                            width: ITEM_WIDTH,
                            height: ITEM_HEIGHT,
                            marginRight: i < 2 ? ITEM_SPACING : 0,
                            opacity: cardAlphas[i],
                            transition: "opacity 0.5s",
                            position: "relative",
                            borderRadius: 24,
                            background: "#23124d",
                            border: "2px solid #3c2a6e",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            overflow: "hidden",
                            display: showCards[i] || cardAlphas[i] > 0 ? "block" : "none",
                        }}
                    >
                        {/* Gradient overlay for first card */}
                        {i === 0 && showGradient && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 24,
                                    background: "radial-gradient(circle at 50% 50%, #11024D 0%, #9279FF 100%)",
                                    opacity: gradientAlpha,
                                    pointerEvents: "none",
                                    zIndex: 2,
                                }}
                            />
                        )}
                        {/* Title */}
                        <div
                            style={{
                                position: "absolute",
                                top: 32 * scaleY,
                                left: 0,
                                width: "100%",
                                textAlign: "center",
                                fontSize: 42 * scale,
                                color: "#00FFD1",
                                fontWeight: "bold",
                                fontFamily: "Gilroy, serif",
                                zIndex: 3,
                                textShadow: "0 2px 8px #000",
                            }}
                        >
                            {card.title}
                        </div>
                        {/* Points Badge */}
                        <div
                            style={{
                                position: "absolute",
                                top: 100 * scaleY,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 120 * scaleX,
                                height: 50 * scaleY,
                                background: "#00ffd0",
                                borderRadius: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 32 * scale,
                                color: "#1a093a",
                                fontWeight: "bold",
                                fontFamily: "Gilroy, serif",
                                zIndex: 3,
                                boxShadow: "0 2px 8px #0002",
                            }}
                        >
                            {card.points} pts
                        </div>
                        {/* Image */}
                        <img
                            src={card.image}
                            alt={card.title}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: 180 * scaleY,
                                width: 234 * scaleX,
                                height: 234 * scaleY,
                                transform: "translateX(-50%)",
                                borderRadius: 24 * scale,
                                zIndex: 3,
                                background: "#fff",
                                objectFit: "cover",
                                boxShadow: "0 2px 16px #0004",
                            }}
                        />
                        {/* Subtitle */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                bottom: 32 * scaleY,
                                width: "100%",
                                textAlign: "center",
                                fontSize: 32 * scale,
                                color: "#fff",
                                fontFamily: "Gilroy, serif",
                                zIndex: 3,
                                textShadow: "0 2px 8px #000",
                            }}
                        >
                            {card.subtitle}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});