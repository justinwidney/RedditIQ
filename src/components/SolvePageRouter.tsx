import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js"
import { CompositeScore, GameScore, GameSettings, GradedScore, PostId, PuzzlePostData, UserData } from "../types.js";
import { UpvotesPage } from "./Games/Upvotes.js";
import { SubredditGuessPage } from "./Games/SubredditGuess.js";
import { TriviaPage } from "./Games/Trivia.js";
import { CelebPage } from "./Games/CelebGuess.js";
import { PastaPage } from "./Games/PastaPage.js";
import { HistorianPage } from "./Games/Historian.js";
import { PageCarousel } from "./RandomizePage.js";
import { PixelText } from "./Addons/PixelText.js";
import { formatCompositeScore } from "../utils/utils.js";




export interface PostData {
  postId: PostId
  postType: string;
}

interface SolvePageRouterProps {
    username: string | null;
    gameSettings: GameSettings;
    userData: UserData | null;
    onCancel: (skip:boolean) => void;
    postData: PostData;
    questions: number[];
    questionData: any;
  }


/**
 * Router component that manages game flow between different mini-games
 */
export const SolvePageRouter = (props: SolvePageRouterProps, context: Context): JSX.Element => {


    const [stepList] = useState<number[]>(props.questions)
    const [score, setScore] = useState<number>(0)
    const [userGuess, setUserGuess] = useState<GameScore[]>([]);
    const [targetIndex, setTargetIndex] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<string>('randomize');



    const currentQuestion = props.questionData.questions[targetIndex];

    console.log(props.questionData, "QUESTION DATA")

    const engine = new Engine(context);

    // id Values
    const postId = props.postData.postId;
    const isSolved = !!props.userData?.solved;
    const isLastQuestion = targetIndex >= stepList.length;

    const onCompleteRandomize = (pageName:string) => {
      setCurrentStep(pageName)
      setTargetIndex(targetIndex + 1)
    }


    async function onGuessHandler(guess: GameScore | GameScore[]): Promise<void> {
      if (!props.postData || !props.username) {
          return;
      }
      
      try {
        // Ensure guess is an array before formatting
        const guessArray = Array.isArray(guess) ? guess : [guess];
        const userGuess = formatCompositeScore(guessArray);
        
        const points = await engine.submitGuess({
            postData: props.postData,
            username: props.username,
            guess: userGuess,
        });
     
        props.onCancel(true);
    } catch (error) {
      console.error(error);
    }
  }


    const onCompletePage = async (): Promise<void> => {

      // Game OVER
      if(isLastQuestion) {
          if (props.username) {
              const guessToSubmit = Array.isArray(userGuess) ? userGuess : [userGuess];
              await onGuessHandler(guessToSubmit);
          }
      } else {
          setCurrentStep('randomize');
      }
    }





    const steps: Record<string, JSX.Element> = {
      // GAMES
      celebGuess: <CelebPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion} />,
      trivia: <TriviaPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion} />,
      subredditGuess: <SubredditGuessPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion}  />,
      copyPasta: <PastaPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion} />,
      upvotes: <UpvotesPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion} />,
      historian: <HistorianPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} question={currentQuestion} />,
 
      // RANDOMIZER
      randomize: <PageCarousel {...props} onComplete={onCompleteRandomize} targetPageIndex={stepList[targetIndex]}/>,
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
            
            {steps[currentStep] 
            ||   
            <vstack alignment="center middle">
             <PixelText color="#000000">Invalid game step</PixelText>
            </vstack>}
            
        </vstack>
        </zstack>

    )

   


}