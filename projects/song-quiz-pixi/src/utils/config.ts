export const REF_WIDTH = 1920;
export const REF_HEIGHT = 1080;
export const PLAYER_COUNT = 4;
export const SCENES = {
    NONE: "",
    SPLASH: "splash",
    SELECT_MODE: "select_mode",
    SELECT_PLAYLIST: "select_playlist",
    GAME: "game",
} as const;
export enum ACTION_TYPE {
    NORMAL = "normal",
    ONLINE = "online",
    SPEAKING = "speaking",
    WINNER = "winner",
    LOSER = "loser",
    GAMEOVER = "gameover",
}
export const SPEAK_COUNTDOWN_SECONDS = 10; // seconds to speak

