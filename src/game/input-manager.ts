import { KeyboardListener } from "../listeners/keyboard-listener";

/**
 * Stores global state of input actions. Middleman between listeners and game classes.
 * Just because forward = true here, doesn't mean it's actually moving the player forward...
 */
export class InputManager {
  forward = false;
  backward = false;
  left = false;
  right = false;
  sprinting = false;

  private enabled = false;

  constructor(private readonly keyboardListener: KeyboardListener) {}

  enable() {
    if (this.enabled) {
      return;
    }

    this.keyboardListener.on("w", this.onPressForward);
    this.keyboardListener.onRelease("w", this.onReleaseForward);
    this.keyboardListener.on("s", this.onPressBackward);
    this.keyboardListener.onRelease("s", this.onReleaseBackward);
    this.keyboardListener.on("a", this.onPressLeft);
    this.keyboardListener.onRelease("a", this.onReleaseLeft);
    this.keyboardListener.on("d", this.onPressRight);
    this.keyboardListener.onRelease("d", this.onReleaseRight);
    this.keyboardListener.on("shift", this.onPressSprint);
    this.keyboardListener.onRelease("shift", this.onReleaseSprint);

    this.enabled = true;
  }

  disable() {
    if (!this.enabled) {
      return;
    }

    this.keyboardListener.off("w", this.onPressForward);
    this.keyboardListener.offRelease("w", this.onReleaseForward);
    this.keyboardListener.off("s", this.onPressBackward);
    this.keyboardListener.offRelease("s", this.onReleaseBackward);
    this.keyboardListener.off("a", this.onPressLeft);
    this.keyboardListener.offRelease("a", this.onReleaseLeft);
    this.keyboardListener.off("d", this.onPressRight);
    this.keyboardListener.offRelease("d", this.onReleaseRight);
    this.keyboardListener.off("shift", this.onPressSprint);
    this.keyboardListener.offRelease("shift", this.onReleaseSprint);

    this.enabled = false;
  }

  onPressForward = () => {
    this.forward = true;
  };

  onReleaseForward = () => {
    this.forward = false;
  };

  onPressBackward = () => {
    this.backward = true;
  };

  onReleaseBackward = () => {
    this.backward = false;
  };

  onPressLeft = () => {
    this.left = true;
  };

  onReleaseLeft = () => {
    this.left = false;
  };

  onPressRight = () => {
    this.right = true;
  };

  onReleaseRight = () => {
    this.right = false;
  };

  onPressSprint = () => {
    this.sprinting = true;
  };

  onReleaseSprint = () => {
    this.sprinting = false;
  };
}
