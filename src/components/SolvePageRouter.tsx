import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js"
import { GameSettings, UserData } from "../types.js";
import { SolvePageStep } from "./SolvePage.js";
import { UpvotesPage } from "./Games/Upvotes.js";
import { SubredditGuessPage } from "./Games/SubredditGuess.js";
import { TriviaPage } from "./Games/Trivia.js";
import { CelebPage } from "./Games/CelebGuess.js";
import { PastaPage } from "./Games/PastaPage.js";
import { PixelText } from "./PixelText.js";
import { HistorianPage } from "./Games/Historian.js";

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
    const [currentStep, setCurrentStep] = useState<string>('subredditGuess');
    const [drawing, setDrawing] = useState<number[]>([]);


    const steps: Record<string, JSX.Element> = {
        historian: <HistorianPage {...props} onComplete={props.onCancel} />,
        copyPasta: <PastaPage {...props} onComplete={props.onCancel} />,
        celebGuess: <CelebPage {...props} onComplete={props.onCancel} />,
        trivia: <TriviaPage {...props} onComplete={props.onCancel} />,
        subredditGuess: <SubredditGuessPage {...props} onComplete={props.onCancel} />,
        upvotes: <UpvotesPage {...props} onComplete={props.onCancel} />,
        solve: <SolvePageStep
            {...props}
            onNext={() => setCurrentStep('tutorial')}
            picture={pictureOptionsData}
            onCancel={props.onCancel}
        />,
    }

    return(
      <zstack width="100%" height="100%" alignment="top start">
         <image 
          imageHeight={1024}
          imageWidth={2048}
          height="100%"
          width="100%"
          url="classroom.png"
          description="custom background"
          resizeMode="cover"  
          />
        <vstack width="100%" height="100%" >

            <hstack width="100%" height="5%" backgroundColor="#D9D9D9" padding="small">
                <PixelText color="#000000"> RedditIQ </PixelText>
              </hstack>
            
            {steps[currentStep] || <text>Invalid step</text>}
        </vstack>
        </zstack>

    )

   


}