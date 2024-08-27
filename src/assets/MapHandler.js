import { AssetHandler } from "./AssetHandler";

export class MapHandler {
  static async getMapList() {
    const mapList = await AssetHandler.getAsset("./maps/webmap.yml");
    return AssetHandler.parseYAML(mapList);
  }

  static async getMap(map) {
    const mapMeta = await AssetHandler.getAsset(`./maps/${map}/meta.yml`);
    return AssetHandler.parseYAML(mapMeta);
  }

  static async getMapDiff(map, diffPath) {
    const mapDiff = await AssetHandler.getAsset(`./maps/${map}/${diffPath}`);
    return AssetHandler.parseYAML(mapDiff);
  }
}