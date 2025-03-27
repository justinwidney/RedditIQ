import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { GameProps, MultipleChoiceScore, PostComparison, UpvotesQuestion, UserData } from "../../types.js";

import Settings from '../../Settings.json';
import { PixelText } from "../Addons/PixelText.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { GAME_SVG } from "../../data/svgs.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { renderHintHearts } from "../Addons/Hearts.js";
import { splitTextByWordBoundaries } from "../../utils/utils.js";

interface UpvotesPageProps extends GameProps {
question: UpvotesQuestion;
}



export const UpvotesPage = (
  props: UpvotesPageProps,
  context: Context
): JSX.Element => {


  const MAX_LIVES = 2

  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;
  
  const dimensions = context.dimensions || { width: 700, height: 500 }; // default dimensions

  const extraPadding = dimensions.width > 450 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedPost, setSelectedPost] = useState<'A' | 'B' | null>(null);
  const [correct, setCorrect] = useState<boolean>(false);
  const [livesIndex, setLivesIndex] = useState(0);
  const [correctAmount, setCorrectAmount] = useState(0);

  const [nextQuestionTime, setNextQuestionTime] = useState(100000) // Large number ;
  const [locked, setLocked] = useState(false);

  // Timer to automatically move to the next question
  useInterval(() => {

    setNextQuestionTime( (nextQuestionTime) => nextQuestionTime - 500)
    const remainingTime = nextQuestionTime - 500;
    
    if (remainingTime <= 0) {
      handleNextQuestion();
      setNextQuestionTime(100000);
      setLocked(false);
    }
  }, 500).start();
  
  const currentComparison = question.comparisons[currentIndex];

  const handleSelection = (choice: 'A' | 'B') => {

    if (locked) {
      return;
    }

    setSelectedPost(choice);
    
    const postAUpvotes = currentComparison.postA.upvotes;
    const postBUpvotes = currentComparison.postB.upvotes;
    const correct = 
      (choice === 'A' && postAUpvotes > postBUpvotes) || 
      (choice === 'B' && postBUpvotes > postAUpvotes);
    
    if (correct) {
      //setScore(prevScore => prevScore + 1);
      //setUserGuess(prevState => [...prevState, '1'])
      setCorrectAmount(correctAmount + 1);
      setCorrect(true);
    }
    else {
      setLivesIndex(prev => prev + 1);
      //setUserGuess(prevState => [...prevState, '0'])
    }

    setLocked(true);
    setNextQuestionTime(1500)
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < question.comparisons.length - 1 || livesIndex > MAX_LIVES) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
      setSelectedPost(null);
      setCorrect(false);
    } else {
      // We've reached the end of the questions
      onFinish();
    }
  };


  const updateScore = (points:number) : MultipleChoiceScore[]  =>  {

    setScore(prevScore => prevScore + points);
    let guessValue: MultipleChoiceScore;
    if (points === 3) guessValue = "3";
    else if (points === 2) guessValue = "2";
    else if (points === 1) guessValue = "1";
    else if (points === -1) guessValue = "-1"
    else guessValue = "0";

    const newUserGuess = [...userGuess, guessValue]; 
    setUserGuess(newUserGuess);
    return newUserGuess;
};
  

  const onFinish = () => {
    const score = correctAmount;
    onComplete(updateScore(score));
}


  const renderPostCard = (post: PostComparison['postA'], label: string, isSelected: boolean) => {


    const chunkSize = extraPadding ? 35 : 50;
    const parts = splitTextByWordBoundaries(post.title, chunkSize);


    return (


      <vstack 
        backgroundColor={
          isSelected && correct ? "rgba(255, 140, 0, 0.2)" : isSelected && !correct? "rgba(255, 50, 50, 0.5)" : "#013839"
        }
        padding="small"
        width={ extraPadding ? "40%" : "80%"}
        height={extraPadding ? "100%" : "20%"}

        onPress={() => handleSelection(label as 'A' | 'B')}
      >
        <vstack alignment="middle center" width="100%" backgroundColor="white" height="100%" >

         <hstack gap="small" alignment="start middle" backgroundColor="#2A3439" width="100%" padding="small">
          <PixelText scale={1} color="#FFFFFF">{post.subreddit}</PixelText>
          <PixelText scale={1} color="#FFFFFF"> upvotes ?</PixelText>
        </hstack>

        {extraPadding ? null : <spacer size="small" /> }
        

        <vstack gap="small" alignment="start" padding="small">
          {parts.map((part, index) => {
              return (
                <hstack >
                  <PixelText scale={1} color={"black"}>{part}</PixelText>
                </hstack>
              );
            })}
          </vstack>

          {extraPadding ? null : <spacer size="small" /> }

        <zstack  padding="small">
        <image
          url={post.image}
          imageHeight={ extraPadding ? 200 : 100}
          imageWidth={ extraPadding ? 225 : 300 }
          height="100%"
          width="100%"
          resizeMode={extraPadding ? "cover" : "fill"}
        />
        </zstack>

        </vstack>
      </vstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="small" alignment="center">
      <spacer height="58px" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <hstack width="100%" alignment="center middle" backgroundColor="white">
          <spacer size="small" />
          <PixelText scale={1} color={"black"}>www.</PixelText>
          <image
            imageHeight={64}
            imageWidth={64}
            width="96px"
            height="32px"
            url={GAME_SVG.upvotes}
            resizeMode="fill"
          />
          <PixelText scale={1} color={"black"}>.com</PixelText>
          <spacer grow />
          <PixelText scale={1} color={"black"}>Tries</PixelText>
          {renderHintHearts ? renderHintHearts(livesIndex) : null}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      

          {extraPadding ?

          <hstack width="100%" gap="medium" alignment="middle center" height={"325px"}>
            {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
            {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
          </hstack>

          :

          <vstack width="100%" gap="medium" alignment="middle center" >
            {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
            {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
          </vstack>
          }
      
      <spacer size="small" />
      
 
    </vstack>
  );
};