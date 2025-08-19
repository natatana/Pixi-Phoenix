import { useState, useEffect } from "react";
import "./resources/css/App.css";
import { SplashScreen } from "./scenes/SplashScreen";
import { SelectModeScreen } from "./scenes/SelectModeScreen";
import { GameScene } from "./scenes/GameScene";
import { REF_HEIGHT, REF_WIDTH, SCENES } from "./utils/config";
import { loadGameAssets } from "./utils/AssetsLoader";

type SceneType = typeof SCENES[keyof typeof SCENES];

function App() {

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const scaleX = windowSize.width / REF_WIDTH;
  const scaleY = windowSize.height / REF_HEIGHT;

  const [scene, setScene] = useState<SceneType>(SCENES.SPLASH);
  const [assetsReady, setAssetsReady] = useState(false);

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
    loadGameAssets().then(() => setAssetsReady(true));
  }, []);

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
        <GameScene
          windowSize={windowSize}
          scaleX={scaleX}
          scaleY={scaleY}
        />
      )}
    </div>
  );
}

export default App;