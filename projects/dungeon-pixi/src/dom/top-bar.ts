import { handleVideo } from "../game/utils/responsive";

export function setDMVideo(options: Parameters<typeof handleVideo>[1]) {
  handleVideo("dm-video-container", options);
}

export function setPlayerAvatarVideo(
  number: number,
  options: Parameters<typeof handleVideo>[1]
) {
  handleVideo(
    `player-avatar-${number.toString().padStart(2, "0")}-video-container`,
    options
  );
}
