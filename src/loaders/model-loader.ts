import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export class ModelLoader {
  doneLoading = false;
  readonly models = new Map<string, THREE.Object3D>();

  private loadingManager = new THREE.LoadingManager();

  // Returns a clone of the model or a red sphere if not found
  get(modelName: string): THREE.Object3D {
    // Return the model if found
    const model = this.models.get(modelName);
    if (model) {
      return SkeletonUtils.clone(model);
    }

    // Otherwise create debug object and error message
    console.error(
      `Could not find ${modelName}, returning debug object instead`
    );
    return new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
  }

  load(onLoad: () => void) {
    // Setup loading manager
    this.loadingManager.onError = (url) => console.error("error loading", url);
    this.loadingManager.onLoad = () => {
      this.doneLoading = true;
      onLoad();
    };

    this.loadModels();
  }

  private loadModels = () => {
    const fbxLoader = new FBXLoader(this.loadingManager);
    this.getNameUrlMap().forEach((url, name) => {
      fbxLoader.load(url, (group) => {
        this.models.set(name, group);
      });
    });
  };

  private getNameUrlMap() {
    const map = new Map<string, string>();

    map.set("pistol", new URL("/models/pistol.fbx", import.meta.url).href);
    map.set("rifle", new URL("/models/rifle.fbx", import.meta.url).href);

    return map;
  }
}
