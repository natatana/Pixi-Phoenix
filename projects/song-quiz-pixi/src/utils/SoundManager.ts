import { Howl } from 'howler';

export type SoundKey =
    | 'intro'
    | 'select'
    | 'navigate'
    | 'startcheer'
    | 'matchmaking'
    | 'finalResult'
    | 'buzzer'
    | 'thinking'
    | 'countdown'
    | 'vsCountdown'
    | 'opponentFound'
    | 'successWebRemote'
    | 'successWebRemoteFinal'
    | 'wincheer'
    | 'drum'
    | 'roundResultsCorrect'
    | 'shine';

const SOUND_FILES: Record<SoundKey, string> = {
    intro: '/sounds/selectmode.ogg',
    select: '/sounds/select.ogg',
    navigate: '/sounds/navigate.ogg',
    startcheer: '/sounds/startcheer.ogg',
    matchmaking: '/sounds/MatchmakingMusic.mp3',
    finalResult: '/sounds/finalResult.ogg',
    buzzer: '/sounds/buzzer.ogg',
    thinking: '/sounds/thinking.ogg',
    countdown: '/sounds/countdown.mp3',
    vsCountdown: '/sounds/VSCountdown.mp3',
    opponentFound: '/sounds/OpponentFound.mp3',
    successWebRemote: '/sounds/playerconnect.ogg',
    successWebRemoteFinal: '/sounds/playerconnect_final.ogg',
    drum: '/sounds/drum.ogg',
    wincheer: '/sounds/wincheer.ogg',
    roundResultsCorrect: '/sounds/RoundResultsCorrect.mp3',
    shine: '/sounds/Shine_01.mp3',
};

const soundInstances: Partial<Record<SoundKey, Howl>> = {};

export function preloadAllSounds(): Promise<void> {
    const createHowl = (key: SoundKey): Promise<Howl> => {
        return new Promise((resolve, reject) => {
            // Choose sensible defaults per key
            const loop = key === 'matchmaking' || key === 'intro' || key === 'thinking';
            const volume = key === 'finalResult' || key === 'matchmaking' || key === 'intro' ? 0.6 : 1.0;

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
    // Select Mode background sound
    playIntro: () => playSound('intro'),
    stopIntro: () => stopSound('intro'),

    // Select
    playSelect: () => playSound('select'),
    stopSelect: () => stopSound('select'),

    // Navigate
    playNavigate: () => playSound('navigate'),
    stopNavigate: () => stopSound('navigate'),

    // Start Cheer
    playStartCheer: () => playSound('startcheer'),
    stopStartCheer: () => stopSound('startcheer'),
    // BGM
    playMatchmaking: () => playSound('matchmaking'),
    stopMatchmaking: () => stopSound('matchmaking'),

    playFinalResult: () => playSound('finalResult'),
    stopFinalResult: () => stopSound('finalResult'),

    // Buzzer
    playBuzzer: () => playSound('buzzer'),
    stopBuzzer: () => stopSound('buzzer'),

    // Thinking
    playThinking: () => playSound('thinking'),
    stopThinking: () => stopSound('thinking'),

    // Events / SFX
    playCountdown: () => playSound('countdown'),
    playVsCountdown: () => playSound('vsCountdown'),
    playOpponentFound: () => playSound('opponentFound'),
    playSuccessWebRemote: () => playSound('successWebRemote'),
    playSuccessWebRemoteFinal: () => playSound('successWebRemoteFinal'),
    playDrum: () => playSound('drum'),
    playWinCheer: () => playSound('wincheer'),
    playRoundResultsCorrect: () => playSound('roundResultsCorrect'),
    playShine: () => playSound('shine'),
}; 