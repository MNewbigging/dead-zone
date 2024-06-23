import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { GameLoader } from "../loaders/game-loader";
import { RenderPipeline } from "./render-pipeline";
import { AnimatedCharacter } from "./animated-character";
import { EventListener } from "../listeners/event-listener";
import { MouseListener } from "../listeners/mouse-listener";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: PointerLockControls;

  private mouseListener = new MouseListener();

  // private animatedCharacter: AnimatedCharacter;

  constructor(private gameLoader: GameLoader, private events: EventListener) {
    this.camera = this.setupCamera();
    this.camera.position.set(0, 1.8, 0);
    this.scene.add(this.camera);
    this.renderPipeline = new RenderPipeline(this.scene, this.camera);

    // Handle pointer lock events
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    document.addEventListener("pointerlockerror", this.onPointerLockError);

    this.controls = new PointerLockControls(
      this.camera,
      this.renderPipeline.canvas
    );
    this.renderPipeline.canvas.requestPointerLock();

    this.setupLights();
    this.setupHdri();
    this.setupObjects();

    // this.animatedCharacter = this.setupAnimatedCharacter();
    // this.scene.add(this.animatedCharacter.object);
    // this.animatedCharacter.playAnimation("idle");

    // Start game
    this.update();
  }

  resumeGame() {
    this.renderPipeline.canvas.requestPointerLock();
    this.mouseListener.enable();
  }

  private onPointerLockChange = () => {
    // If exiting
    if (document.pointerLockElement !== this.renderPipeline.canvas) {
      this.pauseGame();
    }
  };

  private onPointerLockError = () => {
    this.pauseGame();
  };

  private pauseGame() {
    // Fire pause event...
    this.mouseListener.disable();
  }

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera();
    camera.fov = 75;
    camera.far = 500;
    camera.near = 0.01;

    return camera;
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private setupHdri() {
    const hdri = this.gameLoader.textureLoader.get("hdri");
    if (hdri) {
      this.scene.environment = hdri;
      this.scene.background = hdri;
    }
  }

  private setupObjects() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ color: "grey" })
    );
    floor.rotateX(-Math.PI / 2);
    this.scene.add(floor);
  }

  // private setupAnimatedCharacter(): AnimatedCharacter {
  //   const object = this.gameLoader.modelLoader.get("bandit");
  //   object.position.z = -0.5;
  //   this.gameLoader.textureLoader.applyModelTexture(object, "bandit");

  //   const mixer = new THREE.AnimationMixer(object);
  //   const actions = new Map<string, THREE.AnimationAction>();
  //   const idleClip = this.gameLoader.animLoader.clips.get("idle");
  //   if (idleClip) {
  //     const idleAction = mixer.clipAction(idleClip);
  //     actions.set("idle", idleAction);
  //   }

  //   return new AnimatedCharacter(object, mixer, actions);
  // }

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.renderPipeline.render(dt);
  };
}
