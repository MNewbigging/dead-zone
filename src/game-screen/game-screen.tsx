import { observer } from "mobx-react-lite";
import { GameState } from "../game/game-state";
import "./game-screen.scss";
import React from "react";
import { AmmoDisplay } from "../ammo-display/ammo-display";
import { Reticle } from "../reticle/reticle";
import { StaminaDisplay } from "../stamina-display/stamina-display";

interface GameScreenProps {
  gameState: GameState;
}

export const GameScreen: React.FC<GameScreenProps> = observer(
  ({ gameState }) => {
    return (
      <div className="game-screen">
        <AmmoDisplay gameState={gameState} />
        <Reticle />
        <StaminaDisplay gameState={gameState} />
      </div>
    );
  }
);
