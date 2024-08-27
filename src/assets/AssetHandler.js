import yaml from 'js-yaml';

export class AssetHandler {
  static async getAsset(path) {
    const fetchRequest = await fetch(this.buildURL(path));
    const fetchData = await fetchRequest.text();
    return fetchData;
  }

  static buildURL(path) {
    return new URL(path, window.location);
  }

  static parseYAML(file) {
    return yaml.load(file);
  }
}