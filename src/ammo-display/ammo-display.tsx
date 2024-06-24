import { observer } from "mobx-react-lite";
import { GameState } from "../game/game-state";
import "./ammo-display.scss";
import React from "react";

interface AmmoDisplayProps {
  gameState: GameState;
}

export const AmmoDisplay: React.FC<AmmoDisplayProps> = observer(
  ({ gameState }) => {
    const equippedGun = gameState.equipmentManager.equippedGun;
    if (!equippedGun) {
      return null;
    }

    const ammo = equippedGun.magAmmo;
    const reserve = equippedGun.reserveAmmo;

    return (
      <div className="ammo-display">
        <span className="ammo">{ammo} | </span>
        <span className="reserve">{reserve}</span>
      </div>
    );
  }
);
