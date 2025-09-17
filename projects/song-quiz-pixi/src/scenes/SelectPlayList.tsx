import { useRef, useState, useEffect, useMemo, memo } from "react";
import styles from "../resources/css/SelectPlayList.module.css";
import PartyConnectDialog from "../components/PartyConnectDialog";
import SideView from "../components/SideView";
import { Sound } from "../utils/SoundManager";

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
    onNextScreen?: () => void;
};

const SelectPlayList = ({ scale = 1, onHomeHandle, onNextScreen }: SelectPlayListProps) => {
    // All hooks must be called before any return!
    const allImages = useMemo(
        () => sections.flatMap(section => section.items.map(item => item.image)),
        []
    );
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        let loaded = 0;
        if (allImages.length === 0) {
            setImagesLoaded(true);
            return;
        }
        allImages.forEach(src => {
            const img = new window.Image();
            img.onload = img.onerror = () => {
                loaded += 1;
                if (loaded === allImages.length) setImagesLoaded(true);
            };
            img.src = src;
        });
    }, [allImages]);

    // All other hooks here (no hooks after any return!)
    const ITEM_WIDTH = 234 * scale;
    const ITEM_HEIGHT = 308 * scale;
    const CHECKBOX_SIZE = 64 * scale;
    const LOGO_MARGIN_TOP = 90 * scale;
    const LOGO_HEIGHT = 66 * scale;
    const BUTTON_HEIGHT = 48 * scale;
    const BUTTON_MIN_WIDTH = 90 * scale;
    const BORDER_RADIUS = 16 * scale;

    const [selected, setSelected] = useState<string[]>([]);
    const [focusPos, setFocusPos] = useState<[number, number]>([0, 0]);
    const [visibleSectionIdx, setVisibleSectionIdx] = useState(0);

    const [showPartyDialog, setShowPartyDialog] = useState(true);
    const [partyJoined, setPartyJoined] = useState([false, false, false, false]);
    const [showSideView, setShowSideView] = useState(false);
    const [showMaxDialog, setShowMaxDialog] = useState(false);
    // Track if intro sound has played
    const introPlayedRef = useRef(false);

    const memoizedSideView = useMemo(() => (
        <SideView
            roomCode="X47H"
            joined={partyJoined}
            open={showSideView}
            scale={scale}
        />
    ), [partyJoined, showSideView]);

    const handleReadyToSelect = () => {
        setShowPartyDialog(false);
        setShowSideView(true);
        const [sectionIdx, itemIdx] = focusPos;
        const currentItem = itemRefs.current[sectionIdx]?.[itemIdx];
        if (currentItem) {
            currentItem.focus();
        }
    };

    const simulateJoin = (idx: number) => {
        setPartyJoined(prev => prev.map((j, i) => (i === idx ? true : j)));
    };

    useEffect(() => {
        if (!introPlayedRef.current && partyJoined.some(j => j)) {
            Sound.playIntro();
            introPlayedRef.current = true;
        }
    }, [partyJoined]);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        for (let i = 0; i < 4; i++) {
            timers.push(setTimeout(() => {
                simulateJoin(i);
                if (i === 3) {
                    Sound.playSuccessWebRemoteFinal();
                } else {
                    Sound.playSuccessWebRemote();
                }
            }, 3000 + i * 2000));
        }
        return () => {
            timers.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const allJoined = partyJoined.every(Boolean);
        if (allJoined && selected.length > 0 && typeof onNextScreen === "function") {
            setTimeout(() => {
                onNextScreen();
            }, 1000);
        }
    }, [partyJoined, selected]);

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
        if (!showSideView) return;
        const [sectionIdx, itemIdx] = focusPos;
        const item = itemRefs.current[sectionIdx][itemIdx];
        const container = scrollListRefs.current[sectionIdx];
        if (item && container) {
            const itemRect = item.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scrollLeft = item.offsetLeft - (containerRect.width / 2) + (itemRect.width / 2);
            container.scrollTo({
                left: scrollLeft,
                behavior: "smooth"
            });
            item.focus();
        }
    }, [focusPos, showSideView]);

    // Select/deselect logic
    const handleSelect = (id: string, sectionIdx: number, itemIdx: number) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length < 3) return [...prev, id];
            setShowMaxDialog(true);
            return prev;
        });
        setFocusPos([sectionIdx, itemIdx]);
        Sound.playSelect();
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
                newSection = sectionIdx + 1;
                setVisibleSectionIdx(visibleSectionIdx + 1);
                newItem = 0;
            }
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (sectionIdx > 0) {
                newSection = sectionIdx - 1;
                setVisibleSectionIdx(visibleSectionIdx - 1);
                newItem = 0;
            }
        }

        if (newSection !== sectionIdx || newItem !== itemIdx) {
            Sound.playNavigate();
            setFocusPos([newSection, newItem]);
        }
    };

    // Ensure refs array is always up to date
    itemRefs.current = sections.map((section, sIdx) =>
        section.items.map((_, iIdx) => itemRefs.current[sIdx]?.[iIdx] || null)
    );

    // Now you can safely return early
    if (!imagesLoaded) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `url('images/loading-bg.png') center center / cover no-repeat, #1a0e2d`,
                    color: "#ecdeff",
                    fontFamily: "sans-serif",
                    fontSize: 20,
                    letterSpacing: 1,
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        width: 140,
                        height: 140,
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src="images/loading.png"
                        alt="Loading"
                        style={{
                            width: 140,
                            height: 140,
                            display: "block",
                            animation: "spin 1.2s linear infinite"
                        }}
                    />
                </div>
                <div style={{ fontWeight: 700, fontSize: 42, fontFamily: "Gilroy, serif" }}>
                    Loading...
                </div>
                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}
                </style>
            </div>
        );
    }

    return (
        <div className={styles.container} tabIndex={-1} style={{
            width: window.innerWidth,
            height: window.innerHeight
        }}>
            {showMaxDialog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                >
                    <div
                        style={{
                            background: "rgba(0, 0, 0, 0.8)",
                            borderRadius: 24,
                            padding: "40px 32px",
                            textAlign: "center",
                            color: "#fff",
                            minWidth: 340,
                            border: "3px solid #ECDEFF",
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <svg width="101" height="96" viewBox="0 0 101 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M32.2302 10.8292C35.8064 4.15113 42.772 -0.0122358 50.3473 0.000588433C58.0565 -0.0572252 65.1669 4.14892 68.8287 10.9333L98.1908 65.2844C101.674 71.7376 101.506 79.5474 97.7491 85.8452C93.9918 92.1429 87.1989 96.0001 79.8655 96H20.829C13.4737 96.0017 6.66301 92.1231 2.91177 85.7962C-0.839458 79.4693 -0.974775 71.6328 2.55579 65.1802L32.2302 10.8292ZM61.8005 14.6296C59.5423 10.4088 55.1341 7.78395 50.3472 7.80965C45.6307 7.84236 41.3042 10.4343 39.0501 14.5775L9.42776 68.8245C7.21525 72.8471 7.29541 77.7399 9.6385 81.6878C11.9816 85.6358 16.2381 88.0499 20.829 88.0348H79.8655C84.44 88.0069 88.6669 85.5888 91.0095 81.6595C93.3522 77.7302 93.4695 72.862 91.3188 68.8245L61.8005 14.6296Z" fill="#ECDEFF" />
                                <path d="M50.3473 62.4737C48.1908 62.4737 46.4427 64.2218 46.4427 66.3782C46.4427 68.5346 48.1908 70.2827 50.3473 70.2827C51.3871 70.2969 52.3884 69.8901 53.1238 69.1547C53.8591 68.4194 54.2659 67.418 54.2518 66.3782C54.2519 65.3474 53.8389 64.3595 53.1051 63.6355C52.3713 62.9115 51.378 62.5118 50.3473 62.5257V62.4737Z" fill="#ECDEFF" />
                                <path d="M50.3472 55.3414C48.2026 55.3134 46.4708 53.5816 46.4427 51.4369V35.2981C46.4427 33.1417 48.1908 31.3936 50.3472 31.3936C52.5037 31.3936 54.2518 33.1417 54.2518 35.2981V51.4369C54.2518 53.5933 52.5037 55.3414 50.3472 55.3414Z" fill="#ECDEFF" />
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 42, marginBottom: 8 }}>
                            You can only select up to 3 playlists
                        </div>
                        <div style={{ fontSize: 32, marginBottom: 24 }}>
                            Please remove one to add another.
                        </div>
                        <button
                            style={{
                                background: "linear-gradient(90deg, #fff 0%, #ECDEFF 100%)",
                                color: "#1a0e2d",
                                border: "none",
                                borderRadius: 36,
                                padding: "12px 54px",
                                fontSize: 32,
                                fontWeight: 700,
                                cursor: "pointer"
                            }}
                            onClick={() => {
                                setShowMaxDialog(false);
                                setTimeout(() => {
                                    // Refocus the current item after dialog closes
                                    const [sectionIdx, itemIdx] = focusPos;
                                    const item = itemRefs.current[sectionIdx]?.[itemIdx];
                                    item?.focus();
                                }, 0);
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            <PartyConnectDialog
                roomCode="X47H"
                joined={partyJoined}
                open={showPartyDialog}
                scale={scale}
                onReadyToSelect={handleReadyToSelect}
            />
            {memoizedSideView}
            <div className={styles.stickyHeader} style={{ paddingTop: `${LOGO_MARGIN_TOP}px` }}>
                <div className={styles.header}>
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
                        style={{ minWidth: BUTTON_MIN_WIDTH, height: BUTTON_HEIGHT }}
                    ></div>
                </div>
                <div style={{ textAlign: "center", margin: `${24 * scale}px 0 0 0`, fontSize: `${32 * scale}px` }}>
                    Select <b>1-3 Playlists</b>
                </div>
            </div>
            <div
                className={styles.focusFrame}
                style={{
                    position: "absolute",
                    top: 290 * scale + 10,
                    left: 24 * scale,
                    width: ITEM_WIDTH - 6 * scale,
                    height: ITEM_WIDTH - 6 * scale,
                    border: "8px solid #FFD600",
                    borderRadius: `${BORDER_RADIUS}px`,
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />
            <div
                className={styles.sectionsWrapper}
                style={{
                    transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                    transform: `translateY(-${visibleSectionIdx * (356 * scale + 16)}px)`
                }}
            >
                {sections.map((section, sectionIdx) => {
                    const isFocusedSection = focusPos[0] === sectionIdx;
                    return (
                        <div className={styles.section} key={section.key}>
                            <div className={styles.sectionTitle} style={{ fontSize: `${32 * scale}px` }}>{section.title}</div>
                            <div
                                className={styles.scrollList}
                                ref={el => { scrollListRefs.current[sectionIdx] = el; }}
                                style={{
                                    // overflow: "hidden",
                                    width: "100%",
                                    position: "relative",
                                    paddingLeft: `${32 * scale}px`,
                                }}
                            >
                                <div
                                    className={styles.scrollListInner}
                                    style={{
                                        display: "flex",
                                        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                                        transform: isFocusedSection
                                            ? `translateX(-${focusPos[1] * (ITEM_WIDTH + 32 * scale)}px)`
                                            : "translateX(0)",
                                        gap: `${32 * scale}px`
                                    }}
                                >
                                    {section.items.map((item, itemIdx) => (
                                        <div
                                            key={item.id}
                                            className={styles.playlistItem}
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
                                            autoFocus={isFocusedSection && itemIdx === focusPos[1]}
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
                                                    top: 0,
                                                    left: 0
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
                                                        <svg width="36" height="33" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12.9085 21.7037L8.21094 14.1844C7.52309 13.1955 6.48291 12.5135 5.29175 12.2918C4.11736 12.0872 2.89264 12.343 1.91957 13.042C0.946504 13.7411 0.275425 14.7982 0.0741007 15.9918C-0.144 17.1853 0.124432 18.4129 0.812288 19.4189L8.79814 31.0303C9.23434 31.6782 9.82153 32.1897 10.5094 32.5307C11.1972 32.8717 11.969 33.0422 12.724 32.9911C13.4957 32.957 14.2339 32.7183 14.8882 32.3091C15.5425 31.8998 16.0794 31.3201 16.4484 30.6381V30.604C16.5491 30.4165 16.633 30.2118 16.7169 30.0072C18.1094 26.9723 24.5853 13.4683 33.9133 3.7666C37.1345 0.424717 36.6312 -1.00752 32.3698 0.765726C26.8837 3.06754 19.4683 9.61491 12.9085 21.7037Z" fill="#080427" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={styles.checkMark}
                                                        style={{
                                                            fontSize: `${2 * scale}rem`,
                                                            width: CHECKBOX_SIZE,
                                                            height: CHECKBOX_SIZE
                                                        }}
                                                    >
                                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M0 12C0 5.37258 5.37258 0 12 0H64V52C64 58.6274 58.6274 64 52 64H0V12Z" fill="url(#paint0_linear_7926_82215)" />
                                                            <rect x="8" y="8" width="48" height="48" rx="8" fill="#080427" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_7926_82215" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
                                                                    <stop stopColor="#FFE789" />
                                                                    <stop offset="1" stopColor="#F6D301" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
                )}
            </div>
        </div>
    );
};

export default memo(SelectPlayList, (prevProps, nextProps) => {
    return (
        prevProps.scale === nextProps.scale &&
        prevProps.onHomeHandle === nextProps.onHomeHandle &&
        prevProps.onNextScreen === nextProps.onNextScreen
    );
});