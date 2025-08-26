import { GameScene } from '../scenes/GameScene';
import type { ACTION_TYPE } from './config';

function GameSceneLoader({ type, width, height, scaleX, scaleY, selectedPlayer, assetsLoadTime }: {
    type: ACTION_TYPE;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    selectedPlayer: 1 | 2 | 3 | 4;
    assetsLoadTime: number;
}) {

    return (
        <GameScene
            windowSize={{ width: width, height: height }}
            scaleX={scaleX}
            scaleY={scaleY}
            type={type}
            selectedPlayer={selectedPlayer}
            assetsLoadTime={assetsLoadTime}
        />
    );
}

export default GameSceneLoader;