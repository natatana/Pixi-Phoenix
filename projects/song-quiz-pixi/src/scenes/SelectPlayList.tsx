// src/scenes/SelectPlayList.tsx
import { useRef, useState } from "react";
import styles from "../resources/css/SelectPlayList.module.css";

// Dummy Data
const sections = [
    {
        key: "recent",
        title: "Recently Played",
        items: [
            { id: "recent-1", title: "Recent 1", image: '/images/playlist/recent-1.png' },
            { id: "recent-2", title: "Recent 2", image: '/images/playlist/recent-2.png' },
            { id: "recent-3", title: "Recent 3", image: '/images/playlist/recent-3.png' },
            { id: "recent-4", title: "Recent 4", image: '/images/playlist/recent-4.png' },
            { id: "recent-5", title: "Recent 5", image: '/images/playlist/recent-5.png' },
        ],
    },
    {
        key: "popular",
        title: "Popular",
        items: [
            { id: "popular-1", title: "Popular 1", image: '/images/playlist/popular-1.png' },
            { id: "popular-2", title: "Popular 2", image: '/images/playlist/popular-2.png' },
            { id: "popular-3", title: "Popular 3", image: '/images/playlist/popular-3.png' },
            { id: "popular-4", title: "Popular 4", image: '/images/playlist/popular-4.png' },
            { id: "popular-5", title: "Popular 5", image: '/images/playlist/popular-5.png' },
            { id: "popular-6", title: "Popular 6", image: '/images/playlist/popular-6.png' },
            { id: "popular-7", title: "Popular 7", image: '/images/playlist/popular-7.png' },
            { id: "popular-8", title: "Popular 8", image: '/images/playlist/popular-8.png' },
        ],
    },
    {
        key: "decade",
        title: "Decades",
        items: [
            { id: "decade-1", title: "Decade 2020", image: '/images/playlist/decade-2020.png' },
            { id: "decade-2", title: "Decade 2010", image: '/images/playlist/decade-2010.png' },
            { id: "decade-3", title: "Decade 2000", image: '/images/playlist/decade-2000.png' },
            { id: "decade-4", title: "Decade 1990", image: '/images/playlist/decade-1990.png' },
            { id: "decade-5", title: "Decade 1980", image: '/images/playlist/decade-1980.png' },
            { id: "decade-6", title: "Decade 1970", image: '/images/playlist/decade-1970.png' },
            { id: "decade-7", title: "Decade 1960", image: '/images/playlist/decade-1960.png' },
            { id: "decade-8", title: "Decade 1950", image: '/images/playlist/decade-1950.png' },
        ],
    },
    // ...other sections
];

export default function SelectPlayList() {
    const [selected, setSelected] = useState<string[]>([]);
    // Track focused item: [sectionIndex, itemIndex]
    const [focusPos, setFocusPos] = useState<[number, number]>([0, 0]);

    // Create refs for all items
    const itemRefs = useRef<Array<Array<HTMLDivElement | null>>>(
        sections.map(section => section.items.map(() => null))
    );

    // Select/deselect logic
    const handleSelect = (id: string) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length < 3) return [...prev, id];
            return prev;
        });
    };

    // Keyboard navigation logic
    const handleKeyDown = (
        e: React.KeyboardEvent,
        sectionIdx: number,
        itemIdx: number,
        id: string
    ) => {
        let newSection = sectionIdx;
        let newItem = itemIdx;

        console.log(e.key);

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(id);
            return;
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (itemIdx < sections[sectionIdx].items.length - 1) {
                newItem = itemIdx + 1;
            }
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (itemIdx > 0) {
                newItem = itemIdx - 1;
            }
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (sectionIdx < sections.length - 1) {
                // Clamp to available items in next section
                newSection = sectionIdx + 1;
                newItem = Math.min(itemIdx, sections[newSection].items.length - 1);
            }
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (sectionIdx > 0) {
                newSection = sectionIdx - 1;
                newItem = Math.min(itemIdx, sections[newSection].items.length - 1);
            }
        }

        if (newSection !== sectionIdx || newItem !== itemIdx) {
            setFocusPos([newSection, newItem]);
            // Focus the new item after render
            setTimeout(() => {
                itemRefs.current[newSection][newItem]?.focus();
            }, 0);
        }
    };

    // Ensure refs array is always up to date
    itemRefs.current = sections.map((section, sIdx) =>
        section.items.map((_, iIdx) => itemRefs.current[sIdx]?.[iIdx] || null)
    );

    return (
        <div className={styles.container} tabIndex={-1} style={{ overflowY: "auto", height: "100vh" }}>
            <div className={styles.header}>
                <button className={styles.homeButton}>{"< Home"}</button>
                <div className={styles.logo}>
                    <img src="/images/logo.png" alt="Song Quiz Logo" style={{ height: 48 }} />
                </div>
            </div>
            <div style={{ textAlign: "center", margin: "16px 0 0 0", fontSize: "1.1rem" }}>
                Select <b>1-3 Playlists</b>
            </div>
            {sections.map((section, sectionIdx) => (
                <div className={styles.section} key={section.key}>
                    <div className={styles.sectionTitle}>{section.title}</div>
                    <div className={styles.scrollList}>
                        {section.items.map((item, itemIdx) => (
                            <div
                                key={item.id}
                                className={`${styles.playlistItem} ${selected.includes(item.id) ? styles.selected : ""}`}
                                onClick={() => handleSelect(item.id)}
                                tabIndex={0}
                                ref={el => {
                                    itemRefs.current[sectionIdx][itemIdx] = el;
                                }}
                                onKeyDown={e => handleKeyDown(e, sectionIdx, itemIdx, item.id)}
                                role="button"
                                aria-pressed={selected.includes(item.id)}
                                style={{
                                    width: 234,
                                    height: 308,
                                    flex: "0 0 234px",
                                    outline: "none",
                                }}
                                // Auto-focus the current item
                                autoFocus={focusPos[0] === sectionIdx && focusPos[1] === itemIdx}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: "12px 12px 0 0"
                                    }}
                                />
                                <div className={styles.playlistTitle}>{item.title}</div>
                                {selected.includes(item.id) && <div className={styles.checkMark}>✓</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}