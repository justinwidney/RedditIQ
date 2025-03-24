import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { GameProps, PostComparison, UpvotesQuestion, UserData } from "../../types.js";

import Settings from '../../Settings.json';
import { PixelText } from "../Addons/PixelText.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { GAME_SVG } from "../../data/svgs.js";

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
    return (
      <vstack 
        backgroundColor={
          isSelected && correct ? "rgba(255, 140, 0, 0.2)" : isSelected && !correct? "rgba(255, 50, 50, 0.5)" : "white"
        }
        borderColor={isSelected ? "orange" : "gray"}
        border={isSelected ? "thick" : "thin"}
        padding="medium"
        width="40%"
        onPress={() => handleSelection(label as 'A' | 'B')}
      >
         <hstack gap="small" alignment="start middle" backgroundColor="#2A3439" width="100%" padding="small">
          <PixelText scale={1} color="#FFFFFF">{post.subreddit}</PixelText>
        </hstack>

        <spacer size="small" />

        <hstack gap="small" alignment="start">
            <PixelText scale={1} color="black">{post.title}</PixelText>
          </hstack>

        <spacer size="small" />
        <zstack border="thin" borderColor="#000000">
        <image
          url={post.image}
          imageHeight={250}
          imageWidth={250}
          height="150px"
          width="100%"
          resizeMode="cover"
        />
        </zstack>
        
      </vstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="medium"  >
      <spacer size="medium" />
      <hstack width="100%" alignment="middle center">
      <image
                imageHeight={64}
                imageWidth={128}
                width="128px"
                height="64px"
                resizeMode="fill"
                url={GAME_SVG.upvotes}
               />
      </hstack>
      
      <spacer size="small" />
      
      <vstack alignment="center middle" >

        <ProgressBar width={256} onComplete={onFinish} />
      </vstack>
      
      <spacer size="large" />
      
          
      <hstack width="100%" gap="medium" alignment="middle center" >
        {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
        {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
      </hstack>
      
      <spacer size="large" />
      

    </vstack>
  );
};