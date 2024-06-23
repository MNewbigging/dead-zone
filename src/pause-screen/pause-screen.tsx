import { observer } from "mobx-react-lite";
import "./pause-screen.scss";
import React from "react";
import { AppState } from "../app/app-state";

interface PauseScreenProps {
  appState: AppState;
}

export const PauseScreen: React.FC<PauseScreenProps> = observer(
  ({ appState }) => {
    return (
      <div className="pause-screen">
        <div className="menu-button" onClick={appState.resumeGame}>
          Resume
        </div>
      </div>
    );
  }
);
