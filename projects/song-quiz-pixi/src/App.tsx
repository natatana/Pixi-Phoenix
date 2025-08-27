import { useState, useEffect } from "react";
import "./resources/css/App.css";
import { SplashScreen } from "./scenes/SplashScreen";
import { SelectModeScreen } from "./scenes/SelectModeScreen";
import { ACTION_TYPE, REF_HEIGHT, REF_WIDTH, SCENES } from "./utils/config";
import { loadGameAssets } from "./utils/AssetsLoader";
import GameSceneLoader from "./utils/GameSceneLoader";
import { preloadAllSounds } from "./utils/SoundManager";

type SceneType = typeof SCENES[keyof typeof SCENES];

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


  useEffect(() => {

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  })

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
    preloadAllSounds().then(() => setSoundsReady(true)).catch(() => setSoundsReady(true));
  }, []);

  const [currentActionType, setCurrentActionType] = useState(ACTION_TYPE.NORMAL);


  // This is only for mockup
  const actionTypeToPlayerMap = {
    [ACTION_TYPE.NORMAL]: 1,
    [ACTION_TYPE.ONLINE]: 1,
    [ACTION_TYPE.SPEAKING]: 2,
    [ACTION_TYPE.WINNER]: 2,
    [ACTION_TYPE.LOSER]: 3,
    [ACTION_TYPE.GAMEOVER]: 4
  };
  useEffect(() => {
    if (!assetsReady && scene !== SCENES.GAME && !soundsReady) return;

    const actionTypes = Object.values(ACTION_TYPE);
    let index = 0;

    const interval = setInterval(() => {
      if (index < actionTypes.length) {
        setCurrentActionType(actionTypes[index]);
      } else {
        clearInterval(interval); // Stop after one full cycle
      }

      index += 1;
    }, 3000); // Change type every 3 seconds

    return () => clearInterval(interval);
  }, [assetsReady]);

  if (!assetsReady) {
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
        Loading assets...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {scene === SCENES.SPLASH && (
        <SplashScreen windowSize={windowSize} onContinue={() => setScene(SCENES.SELECT_MODE)} />
      )}
      {scene === SCENES.SELECT_MODE && (
        <SelectModeScreen windowSize={windowSize} scaleX={scaleX} scaleY={scaleY} onSelectMode={() => setScene(SCENES.GAME)} />
      )}
      {scene === SCENES.GAME && (
        <GameSceneLoader
          type={currentActionType}
          width={windowSize.width}
          height={windowSize.height}
          scaleX={scaleX}
          scaleY={scaleY}
          selectedPlayer={actionTypeToPlayerMap[currentActionType] as 1 | 2 | 3 | 4}
          assetsLoadTime={assetsLoadTime}
        />
      )}
    </div>
  );
}

export default App;