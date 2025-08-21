import { GameScene } from '../scenes/GameScene';
import type { ACTION_TYPE } from './config';

function GameSceneLoader({ type, windowSize, scaleX, scaleY }: {
    type: ACTION_TYPE;
    windowSize: { width: number; height: number };
    scaleX: number;
    scaleY: number
}) {

    return (
        <GameScene
            windowSize={windowSize}
            scaleX={scaleX}
            scaleY={scaleY}
            type={type}
        />
    );
}

export default GameSceneLoader;