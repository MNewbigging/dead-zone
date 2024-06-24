import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export class ModelLoader {
  doneLoading = false;
  readonly models = new Map<string, THREE.Object3D>();

  pistol = this.createDebugObject();
  rifle = this.createDebugObject();

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
    this.loadPistol(fbxLoader);
    this.loadRifle(fbxLoader);

    this.getZombieMap().forEach((url, name) => {
      fbxLoader.load(url, (group) => {
        group.name = "zombie";
        this.scaleSyntyModel(group);
        this.models.set(name, group);
      });
    });
  };

  private loadPistol(loader: FBXLoader) {
    const pistolUrl = new URL("/models/pistol.fbx", import.meta.url).href;
    loader.load(pistolUrl, (group) => {
      this.scaleSyntyModel(group);
      group.name = "pistol";
      this.pistol = group;
    });
  }

  private loadRifle(loader: FBXLoader) {
    const url = new URL("/models/rifle.fbx", import.meta.url).href;
    loader.load(url, (group) => {
      this.scaleSyntyModel(group);
      group.name = "rifle";
      this.rifle = group;
    });
  }

  private getZombieMap() {
    const map = new Map<string, string>();

    map.set(
      "zombie-01",
      new URL("/models/SK_Zombie_Businessman_Male_01.fbx", import.meta.url).href
    );

    return map;
  }

  private scaleSyntyModel(group: THREE.Group) {
    // Synty models need scale adjusting, unless done in blender beforehand
    group.scale.multiplyScalar(0.01);
    group.updateMatrixWorld();
  }

  private createDebugObject(): THREE.Object3D {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
  }
}
