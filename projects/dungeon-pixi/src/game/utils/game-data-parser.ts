export interface GameData {
  backgroundVideo: string;
  enableMic: boolean;
  audioAtStart?: string;
  title: TitleData;
  characters: CharacterData[];
  zoneButtons: ZoneButtonData[];
}

export interface TitleData {
  texts: { text: (string | number)[] }[];
}

export interface CharacterData {
  key: string;
  name: string;
  role: string;
  position: {
    x: number;
    y: number;
  };
  origin?: {
    x: number;
    y: number;
  };
  speed?: number;
  scale?: number;
  hudOffset?: {
    x: number;
    y: number;
  };
}

export interface ZoneButtonData {
  key: string;
  blocked?: boolean;
  position: {
    x: number;
    y: number;
  };
}

export function parseGameData(data: any) {
  const parsedData = {
    backgroundVideo: data["background-video"],
    enableMic: data["enable-mic"],
    audioAtStart: data["audio-at-start"],
    title: data.title,
    characters: data.characters.map((character: any) => ({
      key: character.key,
      name: character.name,
      role: character.role,
      position: {
        x: character.position.x,
        y: character.position.y,
      },
      origin: character.origin,
      speed: character.speed,
      scale: character.scale,
      hudOffset: character["hud-offset"],
    })),
    zoneButtons: data["zone-buttons"],
  } as GameData;
  return parsedData;
}
