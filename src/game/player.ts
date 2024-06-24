import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { KeyboardListener } from "../listeners/keyboard-listener";

export class Player {
  constructor(
    private keyboardListener: KeyboardListener,
    private controls: PointerLockControls
  ) {}

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

    const velocity = new THREE.Vector3();
    velocity.z = moveDirection.z * dt * 5;
    velocity.x = moveDirection.x * dt * 5;

    this.controls.moveForward(velocity.z);
    this.controls.moveRight(velocity.x);
  }
}
