import { observer } from "mobx-react-lite";
import { GameState } from "../game/game-state";
import "./stamina-display.scss";
import React from "react";

interface StaminaDisplayProps {
  gameState: GameState;
}

export const StaminaDisplay: React.FC<StaminaDisplayProps> = observer(
  ({ gameState }) => {
    const staminaRemaining = gameState.player.currentStamina;

    return (
      <div className="stamina-display">
        <div
          className="stamina-bar"
          style={{ width: `${staminaRemaining}%` }}
        ></div>
      </div>
    );
  }
);
