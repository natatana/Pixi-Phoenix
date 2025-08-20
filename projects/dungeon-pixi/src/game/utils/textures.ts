import * as PIXI from "pixi.js";

export function getTextureKey(texture: PIXI.Texture) {
  // @ts-ignore We're making a hacky way to get the texture key.
  const list = Object.entries(Object.fromEntries(PIXI.Assets.cache._cache));
  const listFiltered = list.filter(([_key, tex]) => tex === texture)
  return listFiltered[listFiltered.length - 1][0];
}