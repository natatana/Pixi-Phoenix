// src/components/SideView.tsx
import styles from "../resources/css/SideView.module.css";

type SideViewProps = {
    roomCode: string;
    joined: boolean[];
    open: boolean;
    scale: number;
};

export default function SideView({ roomCode, joined, open, scale }: SideViewProps) {
    return (
        <div className={`${styles.sideView} ${open ? styles.visible : ""}`} style={{ width: `${448 * scale}px` }}>
            {/* Background decorations */}
            <img src="/images/dialog/top_bg.png" className={styles.topBg} alt="" style={{ width: `${288 * scale}px`, height: `${180 * scale}px` }} />
            <img src="/images/dialog/bottom_bg.png" className={styles.bottomBg} alt="" style={{ width: `${288 * scale}px`, height: `${180 * scale}px` }} />

            <div className={styles.topSection} style={{ gap: `${20 * scale}px` }}>
                <div className={styles.title} style={{ paddingTop: `${20 * scale}px`, fontSize: `${24 * scale}px` }}>
                    <img src="/images/dialog/phone.png" className={styles.phoneIcon} alt="" style={{ width: `${48 * scale}px` }} />
                    Connect Your Phones to Play
                </div>
                <img src="/images/dialog/QRCode.png" alt="QR Code" style={{ width: `${200 * scale}px` }} />
                <div className={styles.qrText} style={{ fontSize: `${24 * scale}px` }}>Scan the QR code with your phone camera.</div>
                <div className={styles.orRow}>
                    <div className={styles.orLineLeft} />
                    <span className={styles.orText} style={{ fontSize: `${24 * scale}px` }}>or</span>
                    <div className={styles.orLineRight} />
                </div>
                <div
                    style={{
                        background: "radial-gradient(85% 85% at 8.75% 2.71%, #FFEC37 0%, #B42EEC 100%)",
                        borderRadius: 16 * scale,
                        padding: 4 * scale, // thickness of the border
                        display: "inline-block",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            color: "#18103A",
                            fontWeight: "bold",
                            fontSize: 32 * scale,
                            borderRadius: 12 * scale,
                            padding: `${8}px ${24}px`,
                            letterSpacing: 4,
                            textAlign: "center",
                        }}
                    >
                        {roomCode}
                    </div>
                </div>
                <div className={styles.instructions} style={{ fontSize: `${24 * scale}px` }}>
                    Go to <a href="https://remote.volley.tv" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 1 }}>remote.volley.tv</a> and enter the room code.
                </div>
            </div>
            <div className={styles.bottomSection} style={{ marginTop: `${20}px`, padding: `${20 * scale}px`, gap: `${20 * scale}px` }}>
                <div className={styles.subtitle} style={{ fontSize: `${24 * scale}px` }}>When your party successfully joins they will appear here.</div>
                <div
                    className={styles.users}
                    style={{
                        padding: `${20 * scale}px ${60 * scale}px`,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: `${32 * scale}px ${48 * scale}px`,
                    }}
                >
                    {joined.map((isJoined, idx) => (
                        <div key={idx} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            minWidth: 96 * scale,
                        }}>
                            <img
                                src={isJoined ? `/images/dialog/avatar_connected_${idx + 1}.png` : "/images/dialog/avatar_blank.png"}
                                alt={isJoined ? "Connected" : "Waiting"}
                                style={{
                                    width: 96 * scale,
                                    height: 96 * scale,
                                    borderRadius: "50%",
                                    background: "#18103A",
                                    marginBottom: 8 * scale,
                                    boxSizing: "border-box",
                                    border: isJoined ? `3px solid #7F83A7` : "none",
                                    boxShadow: isJoined ? "0 4px 16px #0003" : "none",
                                }}
                            />
                            <div
                                style={{
                                    color: "#fff",
                                    fontSize: 20 * scale,
                                    marginTop: 0,
                                    textAlign: "center",
                                    fontWeight: 600,
                                    letterSpacing: 0.1,
                                    textShadow: "0 1px 2px #0006",
                                }}
                            >
                                {isJoined
                                    ? ["Andrew", "Mary", "Jessica", "Devin"][idx] || "Connected"
                                    : "Waiting"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}