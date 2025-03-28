

import { Devvit } from "@devvit/public-api";
import { PieceSymbol } from "./PieceSymbol.js";

const INITIAL_MAX_HINTS = 3;

export const renderHintHearts2 = (hintIndex:number) => {
    const hearts = [];
    for (let i = INITIAL_MAX_HINTS - 1; i >= 0; i--) {
      if (hintIndex <= i) {
        hearts.push(
          <image
          imageHeight={64}
          imageWidth={64}
          width={"28px"}   
          height={"28px"}   
                  url={`hearts.gif`}
          description="Title Field"
          />
        );
      }
    }
    return hearts;
  };


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