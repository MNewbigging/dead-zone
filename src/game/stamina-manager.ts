import { makeAutoObservable, observable } from "mobx";
import { InputManager } from "./input-manager";

/**
 * Manages stamina usage & regeneration.
 */
export class StaminaManager {
  // Stamina
  @observable maxStamina = 100;
  @observable currentStamina = 100;
  private staminaDrainRate = 100;
  private staminaRechargeRate = 50;

  constructor(private inputManager: InputManager) {
    makeAutoObservable(this);
  }

  update(dt: number) {
    // If sprint input command is active
    if (this.inputManager.sprinting) {
      // Reduce stamina
      this.currentStamina -= dt * this.staminaDrainRate;
      this.currentStamina = Math.max(0, this.currentStamina);

      return;
    }

    // No input commands are active that would consume stamina; recharge it
    this.currentStamina += dt * this.staminaRechargeRate;
    this.currentStamina = Math.min(this.maxStamina, this.currentStamina);
  }
}
