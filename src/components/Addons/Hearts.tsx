

import { Devvit } from "@devvit/public-api";
import { PieceSymbol } from "./PieceSymbol.js";

const INITIAL_MAX_HINTS = 3;

export const renderHintHearts = (hintIndex:number) => {
    const hearts = [];
    for (let i = INITIAL_MAX_HINTS - 1; i >= 0; i--) {
      if (hintIndex <= i) {
        hearts.push(
          <PieceSymbol 
            type="heart" 
            color="red" 
            scale={1} 
          />
        );
      }
    }
    return hearts;
  };
