// src/scenes/SelectPlayList.tsx
import { useRef, useState, useEffect } from "react";
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

type SelectPlayListProps = {
    scale?: number;
    onHomeHandle?: () => void;
};

export default function SelectPlayList({ scale = 1, onHomeHandle }: SelectPlayListProps) {

    const ITEM_WIDTH = 234 * scale;
    const ITEM_HEIGHT = 308 * scale;
    const CHECKBOX_SIZE = 64 * scale;
    const LOGO_MARGIN_TOP = 90 * scale;
    const LOGO_HEIGHT = 66 * scale;
    const BUTTON_HEIGHT = 48 * scale;
    const BUTTON_MIN_WIDTH = 90 * scale;
    const BORDER_RADIUS = 12 * scale;

    const [selected, setSelected] = useState<string[]>([]);
    // Track focused item: [sectionIndex, itemIndex]
    const [focusPos, setFocusPos] = useState<[number, number]>([0, 0]);

    // Create refs for all items
    const itemRefs = useRef<Array<Array<HTMLDivElement | null>>>(
        sections.map(section => section.items.map(() => null))
    );

    const scrollListRefs = useRef<Array<HTMLDivElement | null>>(
        sections.map(() => null)
    );

    useEffect(() => {
        itemRefs.current[0][0]?.focus();
    }, []);

    useEffect(() => {
        const [sectionIdx, itemIdx] = focusPos;
        const item = itemRefs.current[sectionIdx][itemIdx];
        const container = scrollListRefs.current[sectionIdx];
        if (item && container) {
            if (itemIdx === 0) {
                // Always scroll to the very left for the first item
                container.scrollLeft = 0;
            } else {
                const itemRect = item.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                if (itemRect.left < containerRect.left) {
                    container.scrollLeft -= (containerRect.left - itemRect.left);
                } else if (itemRect.right > containerRect.right) {
                    container.scrollLeft += (itemRect.right - containerRect.right);
                }
            }
        }
    }, [focusPos]);

    // Select/deselect logic
    const handleSelect = (id: string, sectionIdx: number, itemIdx: number) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length < 3) return [...prev, id];
            return prev;
        });
        setFocusPos([sectionIdx, itemIdx]);
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

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(id, sectionIdx, itemIdx);
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
        <div className={styles.container} tabIndex={-1} style={{ overflowY: "auto", height: "100vh", scrollbarWidth: "none" }}>
            <div className={styles.header} style={{ marginTop: `${LOGO_MARGIN_TOP}px` }}>
                <div
                    className={styles.homeButton}
                    onClick={onHomeHandle}
                    style={{
                        minWidth: BUTTON_MIN_WIDTH,
                        height: BUTTON_HEIGHT,
                        fontSize: `${24 * scale}px`,
                        padding: `0 ${16 * scale}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: `${8 * scale}px`
                    }}
                >
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M25.8129 5.10592C26.3323 5.62616 26.6241 6.33165 26.6241 7.06724C26.6241 7.80283 26.3322 8.50829 25.8127 9.02849L16.688 18.1632L25.812 27.2987C26.3167 27.8219 26.5959 28.5227 26.5896 29.25C26.5833 29.9774 26.2918 30.6731 25.7781 31.1875C25.2643 31.7018 24.5693 31.9935 23.8428 31.9998C23.1163 32.0061 22.4164 31.7264 21.8939 31.2211L10.811 20.1242C10.2916 19.604 9.99984 18.8985 9.99987 18.1629C9.9999 17.4273 10.2917 16.7219 10.8112 16.2017L21.895 5.10576C22.4146 4.58572 23.1193 4.29359 23.854 4.29362C24.5887 4.29365 25.2933 4.58584 25.8129 5.10592Z" fill="white" opacity="0.5" />
                    </svg>
                    <span style={{ display: "flex", alignItems: "center" }}>Home</span>
                </div>
                <div className={styles.logo}>
                    <img
                        src="/images/logo.png"
                        alt="Song Quiz Logo"
                        style={{ height: LOGO_HEIGHT }}
                    />
                </div>
                <div
                    className={styles.headerSpacer}
                    style={{ minWidth: BUTTON_MIN_WIDTH, height: BUTTON_HEIGHT }}
                ></div>
            </div>
            <div style={{ textAlign: "center", margin: `${24 * scale}px 0 0 0`, fontSize: `${32 * scale}px` }}>
                Select <b>1-3 Playlists</b>
            </div>
            {sections.map((section, sectionIdx) => (
                <div className={styles.section} key={section.key}>
                    <div className={styles.sectionTitle} style={{ fontSize: `${32 * scale}px` }}>{section.title}</div>
                    <div
                        className={styles.scrollList}
                        ref={el => { scrollListRefs.current[sectionIdx] = el; }}
                    >
                        {section.items.map((item, itemIdx) => (
                            <div
                                key={item.id}
                                className={`${styles.playlistItem} ${(selected.includes(item.id) || (focusPos[0] === sectionIdx && focusPos[1] === itemIdx)) ? styles.selected : ""}`}
                                onClick={() => handleSelect(item.id, sectionIdx, itemIdx)}
                                tabIndex={0}
                                ref={el => {
                                    itemRefs.current[sectionIdx][itemIdx] = el;
                                }}
                                onKeyDown={e => handleKeyDown(e, sectionIdx, itemIdx, item.id)}
                                role="button"
                                aria-pressed={selected.includes(item.id)}
                                style={{
                                    width: ITEM_WIDTH,
                                    height: ITEM_HEIGHT,
                                    flex: `0 0 ${ITEM_WIDTH}px`,
                                    outline: "none",
                                    position: "relative"
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
                                        borderRadius: `${BORDER_RADIUS}px`
                                    }}
                                />
                                <div className={styles.playlistTitle} style={{ fontSize: `${24 * scale}px` }}>{item.title}</div>
                                <div
                                    className={styles.checkMarkBox}
                                    style={{
                                        width: CHECKBOX_SIZE,
                                        height: CHECKBOX_SIZE,
                                        top: 10 * scale,
                                        left: 10 * scale
                                    }}
                                >
                                    {selected.includes(item.id) ? (
                                        <span
                                            className={styles.checkMark}
                                            style={{
                                                fontSize: `${2 * scale}rem`,
                                                width: CHECKBOX_SIZE,
                                                height: CHECKBOX_SIZE
                                            }}
                                        >
                                            ✓
                                        </span>
                                    ) : (
                                        <svg
                                            width={CHECKBOX_SIZE}
                                            height={CHECKBOX_SIZE}
                                            viewBox={`0 0 ${CHECKBOX_SIZE} ${CHECKBOX_SIZE}`}
                                            style={{ display: "block" }}
                                        >
                                            <rect
                                                x={2 * scale}
                                                y={2 * scale}
                                                width={56 * scale}
                                                height={56 * scale}
                                                rx={6 * scale}
                                                fill="#18103A"
                                                stroke="#FFD600"
                                                strokeWidth={4 * scale}
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}