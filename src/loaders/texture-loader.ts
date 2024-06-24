import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export class TextureLoader {
  doneLoading = false;

  private textures = new Map<string, THREE.Texture>();
  private loadingManager = new THREE.LoadingManager();

  get(name: string) {
    return this.textures.get(name);
  }

  applyModelTexture(object: THREE.Object3D, textureName: string) {
    const texture = this.get(textureName);
    if (!texture) {
      return;
    }

    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshLambertMaterial;
        mat.map = texture;
        // Synty models have this true by default, making model black
        mat.vertexColors = false;
      }
    });
  }

  load(onLoad: () => void) {
    // Setup loading manager
    this.loadingManager.onError = (url) => console.error("error loading", url);

    this.loadingManager.onLoad = () => {
      this.doneLoading = true;
      onLoad();
    };

    this.loadTextures();
  }

  private loadTextures() {
    const rgbeLoader = new RGBELoader(this.loadingManager);
    const hdriUrl = new URL("/textures/orchard_cartoony.hdr", import.meta.url)
      .href;
    rgbeLoader.load(hdriUrl, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.textures.set("hdri", texture);
    });

    const loader = new THREE.TextureLoader(this.loadingManager);
    this.getNameUrlMap().forEach((url, name) => {
      loader.load(url, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        this.textures.set(name, texture);
      });
    });
  }

  private getNameUrlMap() {
    const map = new Map<string, string>();

    map.set(
      "weapon-skin",
      new URL("/textures/Wep_Skin_26.png", import.meta.url).href
    );

    map.set(
      "bullet-hole",
      new URL("/textures/bullet_hole.png", import.meta.url).href
    );

    return map;
  }
}
