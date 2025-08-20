export function setBackgroundVideo(videoUrl: string) {
  const video = document.getElementById("game-video") as HTMLVideoElement | undefined;
  if (!video) return;
  video.setAttribute("src", videoUrl);
}

export function updateBackgroundContainer(canvas: HTMLCanvasElement) {
  const backgroundContainer = document.getElementById(
    "background-container"
  ) as HTMLDivElement | undefined;
  const foregroundContainer = document.getElementById(
    "foreground-container"
  ) as HTMLDivElement | undefined;
  if (!backgroundContainer || !foregroundContainer) return;
  backgroundContainer.style.width = canvas.style.width;
  backgroundContainer.style.height = canvas.style.height;
  backgroundContainer.style.marginLeft = canvas.style.marginLeft;
  backgroundContainer.style.marginTop = canvas.style.marginTop;

  foregroundContainer.style.width = canvas.style.width;
  foregroundContainer.style.height = canvas.style.height;
  foregroundContainer.style.marginLeft = canvas.style.marginLeft;
  foregroundContainer.style.marginTop = canvas.style.marginTop;
}
