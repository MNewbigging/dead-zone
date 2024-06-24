import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { KeyboardListener } from "../listeners/keyboard-listener";
import { makeAutoObservable, observable } from "mobx";

export class Player {
  @observable staminaTotal = 100;
  @observable currentStamina = 100;
  private staminaDrainRate = 100;
  private staminaRechargeRate = 50;

  private moveSpeed = 5;
  private sprintMultiplier = 2;

  constructor(
    private keyboardListener: KeyboardListener,
    private controls: PointerLockControls
  ) {
    makeAutoObservable(this);
  }

  update(dt: number) {
    this.move(dt);
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

    if (this.keyboardListener.isKeyPressed("shift")) {
      this.currentStamina -= dt * this.staminaDrainRate;
      this.currentStamina = Math.max(0, this.currentStamina);
      if (this.currentStamina > 0) {
        speedActual *= this.sprintMultiplier;
      }
    } else {
      this.currentStamina += dt * this.staminaRechargeRate;
      this.currentStamina = Math.min(this.staminaTotal, this.currentStamina);
    }

    const velocity = new THREE.Vector3();
    velocity.z = moveDirection.z * dt * speedActual;
    velocity.x = moveDirection.x * dt * speedActual;

    this.controls.moveForward(velocity.z);
    this.controls.moveRight(velocity.x);
  }

  private trackStamina(dt: number) {
    if (this.keyboardListener.isKeyPressed("shift")) {
      this.currentStamina -= dt * this.staminaDrainRate;
      this.currentStamina = Math.max(0, this.currentStamina);
    } else {
      this.currentStamina += dt * this.staminaRechargeRate;
      this.currentStamina = Math.min(this.staminaTotal, this.currentStamina);
    }
  }
}
