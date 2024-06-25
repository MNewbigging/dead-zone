import * as YUKA from "yuka";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { KeyboardListener } from "../listeners/keyboard-listener";
import { StaminaManager } from "./stamina-manager";
import { InputManager } from "./input-manager";

export class Player extends YUKA.MovingEntity {
  private moveSpeed = 5;
  private sprintMultiplier = 2;

  private currentRegion: YUKA.Polygon;
  private currentPosition = new YUKA.Vector3();
  private previousPosition = new YUKA.Vector3();
  private clampedPosition = new YUKA.Vector3();

  constructor(
    private inputManager: InputManager,
    private staminaManager: StaminaManager,
    private keyboardListener: KeyboardListener,
    private controls: PointerLockControls, // should player create this?
    private navmesh: YUKA.NavMesh
  ) {
    super();

    // Get closest region to player
    this.currentRegion = navmesh.getClosestRegion(new YUKA.Vector3()); // put starting position in here
  }

  update(dt: number) {
    super.update(dt);

    this.move(dt);
    this.stayWithinLevel();

    return this;
  }

  private move(dt: number) {
    const moveForward = this.keyboardListener.isKeyPressed("w");
    const moveBackward = this.keyboardListener.isKeyPressed("s");
    const moveLeft = this.keyboardListener.isKeyPressed("a");
    const moveRight = this.keyboardListener.isKeyPressed("d");

    const moveDirection = new THREE.Vector3();
    moveDirection.z = Number(moveForward) - Number(moveBackward);
    moveDirection.x = Number(moveRight) - Number(moveLeft);
    moveDirection.normalize();

    let speedActual = this.moveSpeed;

    if (this.inputManager.sprinting && this.staminaManager.currentStamina > 0) {
      speedActual *= this.sprintMultiplier;
    }

    const velocity = new THREE.Vector3();
    velocity.z = moveDirection.z * dt * speedActual;
    velocity.x = moveDirection.x * dt * speedActual;

    this.controls.moveForward(velocity.z);
    this.controls.moveRight(velocity.x);
  }

  private stayWithinLevel() {
    const playerObject = this.controls.getObject();
    this.currentPosition.set(
      playerObject.position.x,
      playerObject.position.y,
      playerObject.position.z
    );

    this.currentRegion = this.navmesh.clampMovement(
      this.currentRegion,
      this.previousPosition,
      this.currentPosition,
      this.clampedPosition
    );

    this.previousPosition.copy(this.position);

    const distance = this.currentRegion.plane.distanceToPoint(this.position);

    this.position.y -= distance * 0.2;

    return this;
  }
}
