export function SelectModeScreen({ onSelectMode }: { onSelectMode: (mode: string) => void }) {
    return (
        <div style={{
            position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#333", color: "#fff", zIndex: 10, flexDirection: "column"
        }}>
            <h2>Select Mode</h2>
            <button style={{ fontSize: 20, margin: 10 }} onClick={() => onSelectMode("solo")}>Solo</button>
            <button style={{ fontSize: 20, margin: 10 }} onClick={() => onSelectMode("multiplayer")}>Multiplayer</button>
        </div>
    );
}