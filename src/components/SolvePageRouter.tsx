import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js"
import { GameSettings, PostId, PuzzlePostData, UserData } from "../types.js";
import { SolvePageStep } from "./Pages/SolvePage.js";
import { UpvotesPage } from "./Games/Upvotes.js";
import { SubredditGuessPage } from "./Games/SubredditGuess.js";
import { TriviaPage } from "./Games/Trivia.js";
import { CelebPage } from "./Games/CelebGuess.js";
import { PastaPage } from "./Games/PastaPage.js";
import { HistorianPage } from "./Games/Historian.js";
import { PageCarousel } from "./RandomizePage.js";
import { PixelText } from "./Addons/PixelText.js";
import { StatsPage } from "./Pages/ScorePage.js";


export interface PostData {
  postId: PostId
  postType: string;
}

interface SolvePageRouterProps {
    username: string | null;
    gameSettings: GameSettings;
    userData: UserData | null;
    onCancel: () => void;
    postData: PostData;
  }

export const SolvePageRouter = (props: SolvePageRouterProps, context: Context): JSX.Element => {

    const [stepList] = useState<number[]>([1,1])
    const [score, setScore] = useState<number>(0)

    const postId = props.postData.postId;
    const isSolved = !!props.userData?.solved;

    const engine = new Engine(context);



    const guess = "A,A,A,B,C,D"


    const onCompleteRandomize = (pageName:string) => {
      setCurrentStep(pageName)
      setTargetIndex(targetIndex + 1)



    }


    async function onGuessHandler(guess: string, ): Promise<void> {
      if (!props.postData || !props.username) {
        return;
      }
  
      // Submit guess to the server
      const points = await engine.submitGuess({
        postData: props.postData,
        username: props.username,
        guess,
      });
  
      setCurrentStep('score');
    
    }


    const onCompletePage = async (calcScore:number) =>{

      if(targetIndex >= stepList.length ){

        if (props.username){
            await onGuessHandler(guess)
        }

      }

      else {
      setScore(score + calcScore)
      setCurrentStep('randomize')
      }
    }


    const [targetIndex, setTargetIndex] = useState<number>(0);

    const [currentStep, setCurrentStep] = useState<string>('randomize');


    const steps: Record<string, JSX.Element> = {
        historian: <HistorianPage {...props} onComplete={onCompletePage} setScore={setScore} />,
        copyPasta: <PastaPage {...props} onComplete={onCompletePage} setScore={setScore} />,
        celebGuess: <CelebPage {...props} onComplete={onCompletePage} setScore={setScore} />,
        trivia: <TriviaPage {...props} onComplete={onCompletePage} setScore={setScore}  />,
        subredditGuess: <SubredditGuessPage {...props} onComplete={onCompletePage} setScore={setScore}/>,
        upvotes: <UpvotesPage {...props} onComplete={onCompletePage} setScore={setScore} />,
        randomize: <PageCarousel {...props} onComplete={onCompleteRandomize} targetPageIndex={stepList[targetIndex]}/>,
        score: <StatsPage puzzleName={"Puzzle #1"} playerCount={25} scoreBuckets={[]} onBack={function (): void {
          throw new Error("Function not implemented.");
        } } {...props} />
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
                <spacer size="medium" />
                <PixelText color="#000000">Question</PixelText>
                <spacer size="small" />

                <PixelText color="#000000">{targetIndex.toString()}</PixelText>
                <spacer size="small" />
                <PixelText color="#000000">/</PixelText>
                <spacer size="small" />
                <PixelText color="#000000">{stepList.length.toString()}</PixelText>

                <spacer size="large" />

                <PixelText color="#000000">Score:</PixelText>
                <spacer size="small" />
                <PixelText color="#000000">{score.toString()}</PixelText>

              </hstack>
            
            {steps[currentStep] || <text>Invalid step</text>}
        </vstack>
        </zstack>

    )

   


}