import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js"
import { GameSettings, UserData } from "../types.js";
import { SolvePageStep } from "./SolvePage.js";

interface SolvePageRouterProps {
    username: string | null;
    gameSettings: GameSettings;
    userData: UserData | null;
    onCancel: () => void;
  }

export const SolvePageRouter = (props: SolvePageRouterProps, context: Context): JSX.Element => {

    
  const pictureOptions = {
    easy : [
      [-2, -2, -2, -2, -2, -2, -2, -2],
      [-2,  0,  0,  0,  0,  0,  0,  0],
      [-2,  0, -2, -2,  0, -2, -2,  0],
      [-2,  0, -2, -2,  0, -2, -2,  0],
      [-2,  0,  0, 0,  -2,  0,  0,  0],
      [-2,  1,  1,  0,  0,  0,  1,  1],
      [-2, -2, -2,  0, -2,  0, -2, -2],
      [-2, -2, -2,  1, -2,  1, -2, -2]
    ]
  }
  

  const pictureOptionsData = { easy: pictureOptions.easy.flat().map((x:number) => ({ color: x, drawn: false }))
  }
  

    const service = new Engine(context);
    const [currentStep, setCurrentStep] = useState<string>('solve');
    const [drawing, setDrawing] = useState<number[]>([]);


    const steps: Record<string, JSX.Element> = {
        solve: <SolvePageStep
            {...props}
            onNext={() => setCurrentStep('tutorial')}
            picture={pictureOptionsData}
        />,
    }

    return(
        <vstack width="100%" height="100%">
            {steps[currentStep] || <text>Invalid step</text>}
        </vstack>
    )


}