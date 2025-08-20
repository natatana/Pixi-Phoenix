import { Howl } from 'howler';

export type SoundKey =
    | 'matchmaking'
    | 'roundResultsBgm'
    | 'countdown'
    | 'vsCountdown'
    | 'opponentFound'
    | 'successWebRemote'
    | 'winCheer'
    | 'roundResultsCorrect'
    | 'shine';

const SOUND_FILES: Record<SoundKey, string> = {
    matchmaking: '/sounds/MatchmakingMusic.mp3',
    roundResultsBgm: '/sounds/RoundResultsBGM.wav',
    countdown: '/sounds/countdown.mp3',
    vsCountdown: '/sounds/VSCountdown.wav',
    opponentFound: '/sounds/OpponentFound.wav',
    successWebRemote: '/sounds/SuccessWebRemote.wav',
    winCheer: '/sounds/CheeringWinTie2.wav',
    roundResultsCorrect: '/sounds/RoundResultsCorrect.wav',
    shine: '/sounds/Shine_01.wav',
};

const soundInstances: Partial<Record<SoundKey, Howl>> = {};

export function preloadAllSounds(): Promise<void> {
    const createHowl = (key: SoundKey): Promise<Howl> => {
        return new Promise((resolve, reject) => {
            // Choose sensible defaults per key
            const loop = key === 'matchmaking' || key === 'roundResultsBgm';
            const volume = key === 'roundResultsBgm' ? 0.7 : key === 'matchmaking' ? 0.6 : 1.0;

            const howl = new Howl({
                src: [SOUND_FILES[key]],
                html5: true,
                preload: true,
                loop,
                volume,
                onload: () => resolve(howl),
                onloaderror: (_id: number, err: unknown) => reject(err),
            });
            soundInstances[key] = howl;
        });
    };

    const promises = (Object.keys(SOUND_FILES) as SoundKey[]).map((k) => createHowl(k));
    return Promise.all(promises).then(() => void 0);
}

function get(key: SoundKey): Howl | undefined {
    return soundInstances[key];
}

export function playSound(key: SoundKey) {
    const snd = get(key);
    if (!snd) return;
    try { snd.play(); } catch { }
}

export function stopSound(key: SoundKey) {
    const snd = get(key);
    if (!snd) return;
    try { snd.stop(); } catch { }
}

export const Sound = {
    // BGM
    playMatchmaking: () => playSound('matchmaking'),
    stopMatchmaking: () => stopSound('matchmaking'),

    playRoundResultsBgm: () => playSound('roundResultsBgm'),
    stopRoundResultsBgm: () => stopSound('roundResultsBgm'),

    // Events / SFX
    playCountdown: () => playSound('countdown'),
    playVsCountdown: () => playSound('vsCountdown'),
    playOpponentFound: () => playSound('opponentFound'),
    playSuccessWebRemote: () => playSound('successWebRemote'),
    playWinCheer: () => playSound('winCheer'),
    playRoundResultsCorrect: () => playSound('roundResultsCorrect'),
    playShine: () => playSound('shine'),
}; 