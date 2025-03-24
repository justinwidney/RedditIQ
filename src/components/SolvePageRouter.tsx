import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js"
import { CelebrityQuestion, CompositeScore, GameScore, GameSettings, GradedScore, HistorianQuestion, MultipleChoiceScore, PastaQuestion, PostId, PuzzlePostData, Question, SubredditQuestion, TriviaQuestion, UpvotesQuestion, UserData } from "../types.js";
import { UpvotesPage } from "./Games/Upvotes.js";
import { SubredditGuessPage } from "./Games/SubredditGuess.js";
import { TriviaPage } from "./Games/Trivia.js";
import { CelebPage } from "./Games/CelebGuess.js";
import { PastaPage } from "./Games/PastaPage.js";
import { HistorianPage } from "./Games/Historian.js";
import { PageCarousel } from "./RandomizePage.js";
import { PixelText } from "./Addons/PixelText.js";
import { formatCompositeScore } from "../utils/utils.js";


const IMG_URLS ={
  "historian": "Windows_Screen.png",
  "default": "classroom.png",
  "celebrity": "classroom.png",
  "pasta": "lunch.png",
  "subreddit": "classroom.png",
  "trivia": "classroom.png",
  "upvotes": "Windows_Screen.png",
}

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
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<string>('randomize');


    const currentQuestion = props.questionData[questionIndex] as Question;
    const currentQuestionType = currentQuestion.type ? currentQuestion.type : 'default';

    const engine = new Engine(context);

    // id Values
    const postId = props.postData.postId;
    const isSolved = !!props.userData?.solved;
    const isLastQuestion = targetIndex >= stepList.length;

    const onCompleteRandomize = (pageName:string) => {
      setCurrentStep(pageName)
      setTargetIndex(targetIndex + 1)
    }


    async function onGuessHandler(guess: GameScore[]): Promise<void> {
      if (!props.postData || !props.username) {
          return;
      }
      
      try {
        // Ensure guess is an array before formatting
        const points = await engine.submitGuess({
            postData: props.postData,
            username: props.username,
            guess: guess,
        });
     
        props.onCancel(true);
    } catch (error) {
      console.error(error);
    }
  }


    const onCompletePage = async (latestGuesses: MultipleChoiceScore[]): Promise<void> => {

      setQuestionIndex( prev => prev + 1)

      // Game OVER
      if(isLastQuestion) {
          if (props.username) {
            
              await onGuessHandler(latestGuesses);
          }
      } else {
          setCurrentStep('randomize');
      }
    }





    const steps: Record<string, JSX.Element> = {
      
      // GAMES
      celebGuess: currentQuestion.type === 'celebrity' ? (
        <CelebPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as CelebrityQuestion} />
      ) : null,
      
      trivia: currentQuestion.type === 'trivia' ? (
        <TriviaPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as TriviaQuestion} />
      ) : null,
      
      subredditGuess: currentQuestion.type === 'subreddit' ? (
        <SubredditGuessPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as SubredditQuestion} />
      ) : null,
      
      copyPasta: currentQuestion.type === 'pasta' ? (
        <PastaPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as PastaQuestion} />
      ) : null,
      
      upvotes: currentQuestion.type === 'upvotes' ? (
        <UpvotesPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as UpvotesQuestion} />
      ) : null,
      
      historian: currentQuestion.type === 'historian' ? (
        <HistorianPage {...props} onComplete={onCompletePage} setScore={setScore} setUserGuess={setUserGuess} userGuess={userGuess} question={currentQuestion as HistorianQuestion} />
      ) : null,
    
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
          url={IMG_URLS[currentQuestionType]}
          description="custom background"
          resizeMode="cover"  
          />
        <vstack width="100%" height="100%" >

            <hstack width="100%" height="5%" backgroundColor="#D9D9D9" padding="small">
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