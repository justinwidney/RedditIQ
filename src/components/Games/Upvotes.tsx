import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { GameProps, PostComparison, UpvotesQuestion, UserData } from "../../types.js";

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

  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;
  
 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedPost, setSelectedPost] = useState<'A' | 'B' | null>(null);
  const [correct, setCorrect] = useState<boolean>(false);

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
      setScore(prevScore => prevScore + 1);
      setUserGuess(prevState => [...prevState, '1'])
      setCorrect(true);
    }
    else {
      setUserGuess(prevState => [...prevState, '0'])
    }

    setLocked(true);
    setNextQuestionTime(1500)
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < question.comparisons.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
      setSelectedPost(null);
      setCorrect(false);
    } else {
      // We've reached the end of the questions
      onComplete(userGuess);
    }
  };

  const onFinish = () => {

    for(let i = 0; i < (currentIndex-question.comparisons.length); i++){
      setUserGuess(prevState => [...prevState, "0"])
    }
    
    onComplete();
}


  const renderPostCard = (post: PostComparison['postA'], label: string, isSelected: boolean) => {


    const parts = splitTextByWordBoundaries(post.title, 35);


    return (


      <vstack 
        backgroundColor={
          isSelected && correct ? "rgba(255, 140, 0, 0.2)" : isSelected && !correct? "rgba(255, 50, 50, 0.5)" : "#013839"
        }
        padding="small"
        width="40%"
        height="100%"
        onPress={() => handleSelection(label as 'A' | 'B')}
      >
        <vstack alignment="middle center" width="100%" backgroundColor="white" height="100%" >

         <hstack gap="small" alignment="start middle" backgroundColor="#2A3439" width="100%" padding="small">
          <PixelText scale={1} color="#FFFFFF">{post.subreddit}</PixelText>
          <PixelText scale={1} color="#FFFFFF"> upvotes ?</PixelText>
        </hstack>

        <spacer size="small" />

        <vstack gap="small" alignment="start">
          {parts.map((part, index) => {
              return (
                <hstack padding="small">
                  <PixelText scale={1} color={"black"}>{part}</PixelText>
                </hstack>
              );
            })}
          </vstack>

        <spacer size="small" />
        <zstack border="thin" borderColor="#000000">
        <image
          url={post.image}
          imageHeight={225}
          imageWidth={250}
          height="100%"
          width="100%"
          resizeMode="fill"
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
          />
          <PixelText scale={1} color={"black"}>.com</PixelText>
          <spacer grow />
          <PixelText scale={1} color={"black"}>Tries</PixelText>
          {renderHintHearts ? renderHintHearts(0) : null}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      
          <hstack width="100%" gap="medium" alignment="middle center" height={"325px"}>
            {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
            {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
          </hstack>

      
      <spacer size="small" />
      
 
    </vstack>
  );
};