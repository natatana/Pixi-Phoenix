import { useState, useEffect } from "react";
import "./resources/css/App.css";
import { SplashScreen } from "./scenes/SplashScreen";
import { SelectModeScreen } from "./scenes/SelectModeScreen";
import { GameScene } from "./scenes/GameScene";
import { PLAYER_COUNT, REF_WIDTH } from "./utils/config";
import { Assets } from "pixi.js";

const SCENES = {
  SPLASH: "splash",
  SELECT_MODE: "select_mode",
  GAME: "game",
} as const;
type SceneType = typeof SCENES[keyof typeof SCENES];

function App() {

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const scale = windowSize.width / REF_WIDTH;

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
    const commonAssets = [
      "/images/splash.jpg",
      "/images/stadium.jpg",
      "/images/player_base.png",
      "/images/default_avatar_highlight.png",
      "/images/incorrect_highlight.png",
      "/images/incorrect_buzz_ighlight.png",
      "/images/sound_bar.png",
    ];
    const perPlayerAssets: string[] = [];
    for (let i = 1; i <= PLAYER_COUNT; i++) {
      perPlayerAssets.push(
        `/images/avatar_${i}.png`,
        `/images/avatar_${i}_highlight.png`,
        `/images/avatar_${i}_jet2_trail.png`,
        `/images/avatar_${i}_buzz_hightlight.png`,
        `/images/avatar_${i}_sound_bar.png`,
      );
    }

    Assets.load([...commonAssets, ...perPlayerAssets]).then(() => setAssetsReady(true));
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
        <SelectModeScreen onSelectMode={() => setScene(SCENES.GAME)} />
      )}
      {scene === SCENES.GAME && (
        <GameScene
          windowSize={windowSize}
          scale={scale}
        />
      )}
    </div>
  );
}

export default App;