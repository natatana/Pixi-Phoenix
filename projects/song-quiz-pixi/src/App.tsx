import { useState, useEffect, useRef } from "react";
import "./resources/css/App.css";
import { SplashScreen } from "./scenes/SplashScreen";
import { SelectModeScreen } from "./scenes/SelectModeScreen";
import { ACTION_TYPE, REF_HEIGHT, REF_WIDTH, SCENES } from "./utils/config";
import { loadGameAssets } from "./utils/AssetsLoader";
import GameSceneLoader from "./utils/GameSceneLoader";
import { preloadAllSounds } from "./utils/SoundManager";
import { isTVDevice } from "./utils/common";
import SelectPlayList from "./scenes/SelectPlayList";

type SceneType = (typeof SCENES)[keyof typeof SCENES];

function App() {

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const scaleX = windowSize.width / REF_WIDTH;
  const scaleY = windowSize.height / REF_HEIGHT;

  const [scene, setScene] = useState<SceneType>(SCENES.NONE);
  const [assetsReady, setAssetsReady] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);
  const [assetsLoadTime, setAssetsLoadTime] = useState(0);

  // const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsBufferRef = useRef<number[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = (currentTime: number) => {
      frameCountRef.current++;
      const timeElapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (timeElapsed >= 1000) {
        const result = Math.round((frameCountRef.current * 1000) / timeElapsed);

        // setFps(result < 28 ? result * 2 : result);

        // --- FPS Buffer logic ---
        const fpsValue = result < 28 ? result * 2 : result;
        fpsBufferRef.current.push(fpsValue);
        if (fpsBufferRef.current.length > 100) {
          fpsBufferRef.current.shift();
        }
        const sum = fpsBufferRef.current.reduce((a, b) => a + b, 0);
        setAvgFps(sum / fpsBufferRef.current.length);
        // --- End FPS Buffer logic ---

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, [])

  // Preload all textures
  useEffect(() => {
    loadGameAssets().then((time) => {
      console.log("Time ==> ", time)
      if (time > 100) {
        console.log("Assets load time =>", time)
        setAssetsLoadTime(time);
        setAssetsReady(true)
        setScene(SCENES.SPLASH);
      } else {
        setAssetsReady(false);
      }
    });
  }, []);

  // Preload all sounds
  useEffect(() => {
    preloadAllSounds().then(() => setSoundsReady(true)).catch(() => setSoundsReady(false));
  }, []);

  const [currentActionType, setCurrentActionType] = useState(ACTION_TYPE.NORMAL);


  // This is only for mockup
  const actionTypeToPlayerMap = {
    [ACTION_TYPE.NORMAL]: 1,
    [ACTION_TYPE.ONLINE]: 1,
    [ACTION_TYPE.SPEAKING]: 2,
    [ACTION_TYPE.WINNER]: 3,
    // [ACTION_TYPE.LOSER]: 3,
    [ACTION_TYPE.GAMEOVER]: 4
  };
  useEffect(() => {
    if (scene !== SCENES.GAME || !assetsReady || !soundsReady) return;

    const actionTypes = Object.values(ACTION_TYPE);
    let index = 0;

    const interval = setInterval(() => {
      if (index < actionTypes.length) {
        setCurrentActionType(actionTypes[index]);
        index += 1;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [scene, assetsReady, soundsReady]);


  const debugInfo = [
    `[DEBUG MENU] - Press [D] to toggle`,
    `Resolution: ${windowSize.width}x${windowSize.height}`,
    `PIXI Screen Resolution: ${REF_WIDTH}x${REF_HEIGHT}`,
    `Asset Load Time: ${assetsLoadTime.toFixed(1)} ms`,
    `Is TV: ${isTVDevice()}`,
    `Avg FPS (100): ${avgFps.toFixed(1)}` // Display FPS
  ].join("\n");


  const [debugTextVisible, setDebugTextVisible] = useState(true);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'd' || event.key === 'D') {
        setDebugTextVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!assetsReady && !soundsReady) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b18",
        color: "#ecdeff",
        fontFamily: "sans-serif",
        fontSize: 20,
        letterSpacing: 1,
      }}>
        Loading assets & sounds...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {debugTextVisible && <div style={{ position: "absolute", top: 10, left: 10, zIndex: 999999 }}>
        <div style={{
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "monospace",
          marginTop: 60,
          maxWidth: 400,
          whiteSpace: "pre-wrap",
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {/* <div>
            <FPSStats top={20} left={10} graphWidth={200} />
          </div> */}
          <pre style={{ margin: 0, background: "none", color: "#fff", fontFamily: "inherit", fontSize: "inherit", padding: 0 }}>
            {debugInfo}
          </pre>
        </div>
      </div>}

      {scene === SCENES.SPLASH && (
        <SplashScreen windowSize={windowSize} onContinue={() => setScene(SCENES.SELECT_MODE)} />
      )}
      {scene === SCENES.SELECT_MODE && (
        <SelectModeScreen windowSize={windowSize} scaleX={scaleX} scaleY={scaleY} onSelectMode={(mode) => {
          if (mode === "multi") {
            setScene(SCENES.GAME)
          } else {
            alert("Not added yet");
          }
        }} />
      )}
      {scene === SCENES.SELECT_PLAYLIST && (
        <SelectPlayList scale={Math.min(scaleX, scaleY)} onHomeHandle={() => setScene(SCENES.SELECT_MODE)} />
      )}
      {scene === SCENES.GAME && (
        <GameSceneLoader
          type={currentActionType}
          width={windowSize.width}
          height={windowSize.height}
          scaleX={scaleX}
          scaleY={scaleY}
          selectedPlayer={actionTypeToPlayerMap[currentActionType] as 1 | 2 | 3 | 4}
        />
      )}
    </div>
  );
}

export default App;