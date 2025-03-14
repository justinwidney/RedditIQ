import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";
import { PixelText } from "../PixelText.js";
import { ProgressBar } from "../ProgressBar.js";
import Settings from '../../Settings.json';

interface UpvotesPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

interface PostComparison extends JSONObject {
  postA: {
    image: string;
    title: string;
    upvotes: number;
  };
  postB: {
    image: string;
    title: string;
    upvotes: number;
  },
}

export const UpvotesPage = (
  props: UpvotesPageProps,
  context: Context
): JSX.Element => {

  const { onComplete, onCancel, userData } = props;
  
  // Sample post comparisons - in a real app, these would come from an API or database
  const [comparisons] = useState<PostComparison[]>([
    {
      postA: {
        image: "post1A.jpg",
        title: "I built a PC case out of LEGO",
        upvotes: 45327
      },
      postB: {
        image: "post1B.jpg",
        title: "My cat looks like Danny DeVito",
        upvotes: 67812
      }
    },
    {
      postA: {
        image: "post2A.jpg",
        title: "I found a safe in my new house",
        upvotes: 89432
      },
      postB: {
        image: "post2B.jpg",
        title: "I restored this painting I found at a garage sale",
        upvotes: 32156
      }
    },
    {
      postA: {
        image: "post3A.jpg",
        title: "I took a picture of Saturn with my phone",
        upvotes: 23567
      },
      postB: {
        image: "post3B.jpg",
        title: "I made bread for the first time",
        upvotes: 19847
      }
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedPost, setSelectedPost] = useState<'A' | 'B' | null>(null);

  const [nextQuestionTime, setNextQuestionTime] = useState(100000) // Large number ;

  // Timer to automatically move to the next question
  useInterval(() => {

    setNextQuestionTime( (nextQuestionTime) => nextQuestionTime - 500)
    const remainingTime = nextQuestionTime - 500;
    
    if (remainingTime <= 0) {
      handleNextQuestion();
      setNextQuestionTime(100000);
    }
  }, 500).start();
  
  const currentComparison = comparisons[currentIndex];

  const handleSelection = (choice: 'A' | 'B') => {
    setSelectedPost(choice);
    
    // Determine if the user was correct
    const postAUpvotes = currentComparison.postA.upvotes;
    const postBUpvotes = currentComparison.postB.upvotes;
    const correct = 
      (choice === 'A' && postAUpvotes > postBUpvotes) || 
      (choice === 'B' && postBUpvotes > postAUpvotes);
    
    if (correct) {
      setScore(score + 1);
    }

    setNextQuestionTime(1500)
    
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < comparisons.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
      setSelectedPost(null);
    } else {
      // We've reached the end of the questions
      onComplete(score);
    }
  };

  const renderPostCard = (post: PostComparison['postA'], label: string, isSelected: boolean) => {
    return (
      <vstack 
        backgroundColor={isSelected ? "rgba(255, 140, 0, 0.2)" : Settings.theme.secondary}
        borderColor={isSelected ? "orange" : "#000000"}
        border={isSelected ? "thick" : "thin"}
        padding="medium"
        width="48%"
        onPress={() => handleSelection(label as 'A' | 'B')}
      >
        <PixelText scale={1} color="#000000">{post.title}</PixelText>
        <spacer size="small" />
        <zstack border="thin" borderColor="#000000">
        <image
          url={post.image}
          imageHeight={250}
          imageWidth={250}
          height="150px"
          width="100%"
        />
        </zstack>
        
        {showResults && (
          <text color="gray" alignment="center">
            {post.upvotes.toLocaleString()} upvotes
          </text>
        )}
      </vstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor={Settings.theme.background}>
      <hstack width="100%" alignment="middle center">
        <PixelText scale={3}> Upvotes</PixelText>
      </hstack>
      
      <spacer size="large" />
      
      <vstack alignment="center middle" >

        <ProgressBar width={256} onComplete={onCancel} />
      </vstack>
      
      <spacer size="large" />
      
      <text alignment="center">
        Question {currentIndex + 1} of {comparisons.length} | Score: {score}
      </text>
      
      <spacer size="large" />
      
      <hstack width="100%" gap="medium" alignment="middle center">
        {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
        {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
      </hstack>
      
      <spacer size="large" />
      
      {showResults && (
        <vstack gap="medium" alignment="middle center">
          <text size="large" color={
            ((selectedPost === 'A' && currentComparison.postA.upvotes > currentComparison.postB.upvotes) || 
             (selectedPost === 'B' && currentComparison.postB.upvotes > currentComparison.postA.upvotes)) 
              ? "green" : "red"
          }>
            {((selectedPost === 'A' && currentComparison.postA.upvotes > currentComparison.postB.upvotes) || 
              (selectedPost === 'B' && currentComparison.postB.upvotes > currentComparison.postA.upvotes)) 
              ? "Correct!" : "Wrong!"}
          </text>
         
        </vstack>
      )}
    </vstack>
  );
};