import * as PIXI from "pixi.js";

export function isTVDevice() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("aft") || // Amazon Fire Tablet/TV (like AFTT, AFTS, AFTMM, etc.)
    ua.includes("amazonwebappplatform") || // Seen in some Fire OS devices
    ua.includes("fire os") || // Some include this string
    (ua.includes("android") && ua.includes("silk")) // Silk browser (Fire TV uses Silk)
  );
}

export function screenPixelToPercent(
  app: PIXI.Application,
  options: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    integer?: boolean;
  }
) {
  const { x = 0, y = 0, width = 0, height = 0, integer = false } = options;
  const { width: screenWidth, height: screenHeight } = app.screen;
  const xPercent = x / screenWidth;
  const yPercent = y / screenHeight;
  const widthPercent = width / screenWidth;
  const heightPercent = height / screenHeight;
  if (integer) {
    return {
      x: Math.round(xPercent * 100),
      y: Math.round(yPercent * 100),
      width: Math.round(widthPercent * 100),
      height: Math.round(heightPercent * 100),
    };
  }
  return {
    x: xPercent,
    y: yPercent,
    width: widthPercent,
    height: heightPercent,
  };
}

export function handleVideo(
  keyContainer: string,
  options: {
    visible?: boolean;
    videoUrl?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    autoPlay?: boolean;
    borderEffect?: boolean;
    borderColor?: string;
  }
) {
  const videoContainer = document.getElementById(
    keyContainer
  ) as HTMLVideoElement;
  if (!videoContainer) return;
  const video = videoContainer.querySelector("video") as HTMLVideoElement;
  if (!video) return;
  if (typeof options.visible === "boolean") videoContainer.style.display = options.visible ? "block" : "none";
  if (options.videoUrl) video.setAttribute("src", options.videoUrl);
  if (typeof options.x === "number")
    videoContainer.style.left = `${options.x}%`;
  if (typeof options.y === "number") videoContainer.style.top = `${options.y}%`;
  if (typeof options.width === "number")
    videoContainer.style.width = `${options.width}%`;
  if (typeof options.height === "number")
    videoContainer.style.height = `${options.height}%`;
  if (options.autoPlay) video.play();
  if (options.borderEffect) {
    videoContainer.classList.add("active");
  } else {
    videoContainer.classList.remove("active");
    void videoContainer.offsetWidth;
  }
  if (options.borderColor) video.style.setProperty("--border-color-avatar", options.borderColor);
}

export function trimText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}