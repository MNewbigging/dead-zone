import * as THREE from "three";
import { GameLoader } from "../loaders/game-loader";
import { Gun, GunProps } from "./guns/gun";
import { MouseListener } from "../listeners/mouse-listener";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { EventListener } from "../listeners/event-listener";
import { TweenFactory, tilAnimEnd } from "./tween-factory";
import { makeAutoObservable, observable } from "mobx";

export class EquipmentManager {
  private bulletDecalMaterial: THREE.MeshPhongMaterial;
  private pistol: Gun;

  private heldGuns: Gun[] = [];
  @observable equippedGun?: Gun;
  private equipping = false;

  constructor(
    private gameLoader: GameLoader,
    private mouseListener: MouseListener,
    private keyboardListener: KeyboardListener,
    private events: EventListener,
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera
  ) {
    makeAutoObservable(this);

    this.bulletDecalMaterial = this.setupBulletDecalMaterial();
    this.pistol = this.setupPistol();
  }

  equipPistol() {
    // Add to held guns
    this.heldGuns.push(this.pistol);

    // Assign hotkey
    const index = this.heldGuns.length - 1;
    const key = `${this.heldGuns.length}`;
    this.keyboardListener.on(key, () => this.onGunHotkey(index));

    // Reset any rotation so it faces the right way
    this.pistol.object.rotation.set(0, Math.PI, 0);

    // Hide it until ready to show
    this.pistol.object.visible = false;

    // Equip straight away
    this.equipGun(this.pistol);
  }

  update(dt: number) {
    this.equippedGun?.update(dt);
  }

  private setupBulletDecalMaterial() {
    const decal = this.gameLoader.textureLoader.get("bullet-hole");

    const material = new THREE.MeshPhongMaterial({
      map: decal,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });

    return material;
  }

  private setupPistol() {
    // Apply texture to model
    const pistol = this.gameLoader.modelLoader.pistol;
    this.gameLoader.textureLoader.applyModelTexture(pistol, "weapon-skin");

    // Create the gun class
    const pistolProps: GunProps = {
      object: pistol,
      firingModeName: "semi-auto",
      rpm: 180,
      magSize: 12,
      bulletDecalMaterial: this.bulletDecalMaterial,
      holdPosition: new THREE.Vector3(0.15, -0.2, -0.5),
      lowerPosMod: new THREE.Vector3(0, -0.2, 0),
      lowerRotMod: new THREE.Vector3(-Math.PI / 4, 0, 0),
      recoilPosMod: new THREE.Vector3(0, 0.02, 0.1),
      recoildRotMode: new THREE.Vector3(0.1, 0, 0),
    };

    const pistolGun = new Gun(
      pistolProps,
      this.mouseListener,
      this.keyboardListener,
      this.events,
      this.scene,
      this.camera
    );

    return pistolGun;
  }

  private async equipGun(gun: Gun) {
    if (this.equipping) {
      return;
    }

    this.equipping = true;

    // Unequip then hide the current gun
    if (this.equippedGun) {
      await this.unequipGun(this.equippedGun);
    }

    // Add new gun to the camera straight away
    this.camera.add(gun.object);

    // Position it ready for the show animation
    gun.object.position.set(gun.holdPosition.x, -1, gun.holdPosition.z);
    gun.object.rotation.x = -Math.PI;

    // Ensure the gun is visible
    gun.object.visible = true;

    // Start the show animation
    await tilAnimEnd(TweenFactory.showGun(gun));

    // This gun is now equipped
    gun.enable();
    this.equippedGun = gun;
    this.equipping = false;

    // In case we're now looking at an interactive item and camera stops...
    // const lookingAt = this.getLookedAtTableGun();
    // if (lookingAt) {
    //   this.lowerEquippedGun();
    // }
  }

  private async unequipGun(gun: Gun) {
    gun.disable();
    await tilAnimEnd(TweenFactory.hideGun(gun));
    this.camera.remove(gun.object);
  }

  private onGunHotkey(index: number) {
    // Is there a gun for that index?
    if (this.heldGuns.length <= index) {
      console.log("not holding gun there");
      return;
    }

    const gun = this.heldGuns[index];

    // Are we already holding it?
    if (this.equippedGun?.id === gun.id) {
      console.log("already holding it");
      return;
    }

    // Swap to that gun so long as we're not currently swapping...
    this.equipGun(gun);
  }
}
