import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { GameLoader } from "../loaders/game-loader";
import { RenderPipeline } from "./render-pipeline";
import { AnimatedCharacter } from "./animated-character";
import { EventListener } from "../listeners/event-listener";
import { MouseListener } from "../listeners/mouse-listener";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { EquipmentManager } from "./equipment-manager";
import { Player } from "./player";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: PointerLockControls;
  private mouseListener = new MouseListener();
  private keyboardListener = new KeyboardListener();
  private paused = false;

  player: Player;
  equipmentManager: EquipmentManager;

  zombies: AnimatedCharacter[] = [];

  constructor(private gameLoader: GameLoader, private events: EventListener) {
    this.camera = this.setupCamera();
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

    this.player = new Player(this.keyboardListener, this.controls);

    this.equipmentManager = new EquipmentManager(
      gameLoader,
      this.mouseListener,
      this.keyboardListener,
      this.events,
      this.scene,
      this.camera
    );

    this.setupLights();
    this.setupHdri();

    // Level
    this.scene.add(this.gameLoader.modelLoader.level);

    // Game setup
    this.camera.position.set(0, 1.5, 2);
    this.equipmentManager.pickupPistolAmmo(12);
    this.equipmentManager.equipPistol();

    // Zombie testing
    const zombie = this.gameLoader.modelLoader.get("zombie-01");
    this.gameLoader.textureLoader.applyModelTexture(zombie, "zombie-atlas");

    const mixer = new THREE.AnimationMixer(zombie);
    const actions = new Map<string, THREE.AnimationAction>();
    const idleClip = this.gameLoader.animLoader.clips.get("zombie-idle");
    if (idleClip) {
      const idleAction = mixer.clipAction(idleClip);
      actions.set("idle", idleAction);
    }
    const walkClip = this.gameLoader.animLoader.clips.get("zombie-walk");
    if (walkClip) {
      const walkAction = mixer.clipAction(walkClip);
      actions.set("walk", walkAction);
    }
    const attackClip = this.gameLoader.animLoader.clips.get("zombie-attack");
    if (attackClip) {
      const attackAction = mixer.clipAction(attackClip);
      actions.set("attack", attackAction);
    }

    const animatedCharacter = new AnimatedCharacter(zombie, mixer, actions);
    animatedCharacter.playAnimation("idle");
    this.zombies.push(animatedCharacter);

    this.scene.add(zombie);

    // Start game
    this.update();
  }

  resumeGame() {
    this.renderPipeline.canvas.requestPointerLock();
    this.mouseListener.enable();
    this.paused = false;
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
    this.events.fire("game-paused", null);
    this.mouseListener.disable();
    this.paused = true;
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

    const boxMat = new THREE.MeshBasicMaterial({ color: "red" });
    const box1 = new THREE.Mesh(new THREE.BoxGeometry(), boxMat);
    box1.position.set(0, 0.5, -5);
    this.scene.add(box1);

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(), boxMat);
    box2.position.set(2, 1, 1);
    this.scene.add(box2);

    const box3 = new THREE.Mesh(new THREE.BoxGeometry(), boxMat);
    box3.position.set(-3, 1, -1);
    this.scene.add(box3);
  }

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    if (!this.paused) {
      TWEEN.update();

      this.player.update(dt);
      this.equipmentManager.update(dt);
      this.zombies.forEach((zombie) => zombie.update(dt));

      this.renderPipeline.render(dt);
    }
  };
}
