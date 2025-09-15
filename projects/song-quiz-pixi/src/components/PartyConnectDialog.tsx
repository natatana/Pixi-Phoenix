// src/components/PartyConnectDialog.tsx
import React, { useEffect, useRef, useState } from "react";
import '../resources/css/PartyConnectDialog.css';

type PartyConnectDialogProps = {
    roomCode: string;
    joined: boolean[];
    open: boolean;
    scale: number;
    onReadyToSelect: () => void;
};

const PartyConnectDialog = React.memo(function PartyConnectDialog({
    roomCode,
    joined,
    open,
    scale,
    onReadyToSelect,
}: PartyConnectDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        // Preload background image
        const img = new window.Image();
        img.src = "/images/dialog/background.png";
        img.onload = () => setBgLoaded(true);
    }, []);

    useEffect(() => {
        if (open) {
            setIsClosing(false);
            dialogRef.current?.showModal();
        } else if (dialogRef.current?.open) {
            setIsClosing(true);
            const timeout = setTimeout(() => {
                dialogRef.current?.close();
                setIsClosing(false);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    useEffect(() => {
        if (joined.some(j => j)) {
            setTimeout(() => {
                onReadyToSelect();
            }, 1000);
        }
    }, [joined]);

    return (
        <dialog
            ref={dialogRef}
            className={`p-0 border-none bg-none w-screen h-screen max-w-none max-h-none overflow-visible z-[1000] dialog-fade${isClosing ? " out" : ""}`}
        >
            {/* Overlay */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(24, 16, 58, 0.4)", // semi-transparent dark overlay
                    zIndex: 1001,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Modal Card */}
                <div
                    className="overflow-hidden text-center p-0"
                    style={{
                        width: "66%",
                        height: "80%",
                        backgroundImage: "url('/images/dialog/background.png')",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 100%",
                    }}
                >
                    {bgLoaded && (
                        <>
                            <div
                                style={{
                                    height: 100 * scale,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderBottom: "4px solid transparent",
                                    borderImage: "linear-gradient(to right, #492F69, #6B408B) 1",
                                    position: "relative",
                                    flexDirection: "row",
                                    gap: 16 * scale,
                                }}
                            >
                                <img
                                    src="/images/dialog/phone.png"
                                    alt="Phone"
                                    style={{
                                        width: 48 * scale,
                                        height: 64 * scale,
                                        display: "inline-block",
                                        verticalAlign: "middle",
                                    }}
                                />
                                <span
                                    style={{
                                        color: "#fff",
                                        fontWeight: 700,
                                        fontSize: 32 * scale,
                                        letterSpacing: 0.5,
                                        display: "inline-block",
                                        verticalAlign: "middle",
                                    }}
                                >
                                    Connect Your Phones to Play
                                </span>
                            </div>
                            {/* Main Content */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    padding: `${50 * scale}px ${128 * scale}px `,
                                    gap: 32,
                                }}
                            >
                                {/* QR Code */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        textAlign: "center"
                                    }}
                                >
                                    <div style={{ fontWeight: 500, color: "#fff", fontSize: 36 * scale }}>
                                        QR Code
                                    </div>
                                    <img
                                        src="/images/dialog/QRCode.png"
                                        alt="QR Code"
                                        style={{
                                            width: 264 * scale,
                                            height: 264 * scale,
                                            margin: `${8 * scale}px 0`
                                        }}
                                    />
                                    <div
                                        style={{
                                            maxWidth: '70%',
                                            color: "#fff",
                                            fontSize: 32 * scale,
                                            opacity: 0.5,
                                            textAlign: "center",
                                        }}
                                    >
                                        Scan the QR code with your phone camera.
                                    </div>
                                </div>
                                {/* Divider */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        width: 32, // enough for the text and lines
                                        minWidth: 32,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 4,
                                            height: 134 * scale,
                                            background: "linear-gradient(180deg, #fff0 0%, #fff6 100%)",
                                            marginBottom: 8,
                                        }}
                                    />
                                    <span
                                        style={{
                                            color: "#fff8",
                                            fontSize: 40 * scale,
                                            fontWeight: 500,
                                        }}
                                    >
                                        or
                                    </span>
                                    <div
                                        style={{
                                            width: 4,
                                            height: 134 * scale,
                                            background: "linear-gradient(180deg, #fff6 0%, #fff0 100%)",
                                            marginTop: 8,
                                        }}
                                    />
                                </div>
                                {/* Room Code */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        textAlign: "center"
                                    }}
                                >
                                    <div style={{ fontWeight: 500, color: "#fff", fontSize: 36 * scale, marginBottom: 8 }}>
                                        Room Code
                                    </div>
                                    <div
                                        style={{
                                            background: "radial-gradient(85% 85% at 8.75% 2.71%, #FFEC37 0%, #B42EEC 100%)",
                                            borderRadius: 24 * scale,
                                            padding: 4 * scale, // thickness of the border
                                            display: "inline-block",
                                            marginBottom: 8 * scale,
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#fff",
                                                color: "#18103A",
                                                fontWeight: "bold",
                                                fontSize: 36 * scale,
                                                borderRadius: 20 * scale,
                                                padding: "12px 32px",
                                                letterSpacing: 4,
                                                minWidth: 120 * scale,
                                                textAlign: "center",
                                            }}
                                        >
                                            {roomCode}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            maxWidth: '80%',
                                            color: "#fff",
                                            marginTop: 12,
                                            fontSize: 32 * scale,
                                            textAlign: "center"
                                        }}
                                    >
                                        <span style={{ opacity: 0.5 }}>Go to </span><span style={{ opacity: 1 }}><u>remote.volley.tv</u></span><span style={{ opacity: 0.5 }}> and enter the room code.</span>
                                    </div>
                                </div>
                            </div>
                            {/* Party Avatars */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderTop: "4px solid transparent",
                                    borderImage: "linear-gradient(to right, #6B408B, #492F69) 1",
                                    width: "100%",
                                    background: "none"
                                }}
                            >
                                {/* Left: Party label and description */}
                                <div style={{
                                    paddingLeft: `${48 * scale}px`,
                                }}>
                                    <div style={{
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: 36 * scale,
                                        marginBottom: 8 * scale,
                                        textAlign: "left",
                                        letterSpacing: 0.1,
                                    }}>
                                        Party
                                    </div>
                                    <div style={{
                                        color: "#fff",
                                        fontSize: 24 * scale,
                                        opacity: 0.7,
                                        marginBottom: 0,
                                        textAlign: "left",
                                        lineHeight: 1.4,
                                        fontWeight: 400,
                                    }}>
                                        When your party successfully<br />joins they will appear here.
                                    </div>
                                </div>
                                {/* Right: Avatars */}
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: `${24 * scale}px`,
                                    flex: 1,
                                    justifyContent: "flex-end",
                                    alignItems: "flex-start",
                                    padding: `${12 * scale}px ${48 * scale}px`,
                                }}>
                                    {joined.map((isJoined, idx) => (
                                        <div key={idx} style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            minWidth: 140 * scale,
                                        }}>
                                            <img
                                                src={isJoined ? "/images/dialog/avatar_connected_1.png" : "/images/dialog/avatar_blank.png"}
                                                alt={isJoined ? "Connected" : "Waiting"}
                                                style={{
                                                    width: 104 * scale,
                                                    height: 104 * scale,
                                                    borderRadius: "50%",
                                                    background: "#18103A",
                                                    marginBottom: 8 * scale,
                                                }}
                                            />
                                            <div style={{
                                                color: "#fff",
                                                fontSize: 20 * scale,
                                                marginTop: 0,
                                                opacity: 0.7,
                                                textAlign: "center",
                                                fontWeight: 400,
                                                letterSpacing: 0.1,
                                            }}>
                                                {isJoined ? "Connected" : "Waiting to Join"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </dialog >
    );
});

export default PartyConnectDialog;