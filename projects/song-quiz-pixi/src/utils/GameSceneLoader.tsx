import { GameScene } from '../scenes/GameScene';
import type { ACTION_TYPE } from './config';

function GameSceneLoader({ type, width, height, scaleX, scaleY }: {
    type: ACTION_TYPE;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number
}) {

    return (
        <GameScene
            windowSize={{ width: width, height: height }}
            scaleX={scaleX}
            scaleY={scaleY}
            type={type}
        />
    );
}

export default GameSceneLoader;