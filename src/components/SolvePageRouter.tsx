import { Context, Devvit, useInterval, useState } from "@devvit/public-api";
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
import { IQScoreOverlay } from "./Overlay.js";

const IMG_URLS ={
  "historian": "Windows_Screen.png",
  "default": "background.png",
  "celebrity": "Windows_Screen.png",
  "pasta": "Windows_Screen.png",
  "subreddit": "Windows_Screen.png",
  "trivia": "Windows_Screen.png",
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
    
    // IQ overlay state
    const [currentIQ, setCurrentIQ] = useState<number>(100); // Start with 100 IQ
    const [showIQOverlay, setShowIQOverlay] = useState<boolean>(false);
    const [newIQ, setNewIQ] = useState<number >(100);

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

    // Handle IQ animation completion
    const handleIQAnimationComplete = () => {
      // The animation is complete, but we'll wait for user tap to dismiss
      if (newIQ !== 0) {
        setCurrentIQ(newIQ);
      }
    };
    
    // Handle tap on overlay to dismiss
    const handleOverlayTap = () => {
      
      if (newIQ !== undefined) {
        setCurrentIQ(newIQ);
      }

      if (showIQOverlay) {
        setShowIQOverlay(false);
        setNewIQ(0);
        
        // Check if it's the last question
        if(isLastQuestion) {
          onGuessHandler(userGuess);
        } else {
          setCurrentStep('randomize');
        }
      }
    };

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
            IQ: currentIQ,
        });
     
        props.onCancel(true);
      } catch (error) {
        console.error(error);
      }
    }

    const onCompletePage = async (latestGuesses: MultipleChoiceScore[]): Promise<void> => {

      const lastGuess = latestGuesses[latestGuesses.length - 1];
      const scoreValue = parseInt(lastGuess);

      let iqChange = 0;
  
      if (scoreValue === 3) {
        iqChange = Math.floor(Math.random() * 6) + 10; // 10-15 points
      } else if (scoreValue === 2) {
        iqChange = Math.floor(Math.random() * 6) + 5; // 5-10 points
      } else if (scoreValue === 1) {
        iqChange = Math.floor(Math.random() * 5) + 1; // 1-5 points
      } else {
        iqChange = -(Math.floor(Math.random() * 11) + 5); // -5 to -15 points
      }
      
      const updatedIQ = Math.max(50, Math.min(200, currentIQ + iqChange)); // Cap IQ between 50 and 200
      
      setNewIQ(updatedIQ);
      setShowIQOverlay(true);
      
      setQuestionIndex(prev => prev + 1);
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
          url={ currentStep==='randomize' ? 'background.png' : IMG_URLS[currentQuestionType]}
          description="custom background"
          resizeMode="cover"  
          />
        <vstack width="100%" height="100%" >

          {currentStep==='randomize' &&
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

                <spacer size="large" />

                <PixelText color="#000000">IQ:</PixelText>
                <spacer size="small" />
                <PixelText color="#000000">{currentIQ.toString()}</PixelText>
              </hstack>
          }
            
            {steps[currentStep] 
            ||   
            <vstack alignment="center middle">
             <PixelText color="#000000">Invalid game step</PixelText>
            </vstack>}
            
        </vstack>
        
        {/* IQ Score Overlay */}
        {showIQOverlay && (
          <hstack width="100%" height="100%" onPress={handleOverlayTap}>
            <IQScoreOverlay
              initialIQ={currentIQ}
              newIQ={newIQ}
              isVisible={showIQOverlay}
              onAnimationComplete={handleIQAnimationComplete}
            />
          </hstack>
        )}
      </zstack>
    )
}