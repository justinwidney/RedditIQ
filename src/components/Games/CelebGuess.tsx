import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";
import Settings from '../../Settings.json';
import { splitArray } from "../../utils/utils.js";

interface CelebPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

interface CelebQuestion extends JSONObject {
  image: string;
  name: string;
  hint: string;
  redditRelevance: string;
}

interface drawData {
    color: number;
    drawn: boolean;
    [key: string]: any;
  }
  


export const CelebPage = (
  props: CelebPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData } = props;
  
  // Sample celebrity questions
  const [questions] = useState<CelebQuestion[]>([
    {
      image: "keanu.jpg",
      name: "Keanu Reeves",
      hint: "Known for 'The Matrix' and 'John Wick'",
      redditRelevance: "Reddit's favorite wholesome celebrity"
    },
    {
      image: "rick-astley.jpg",
      name: "Rick Astley",
      hint: "Never gonna give you up...",
      redditRelevance: "Rickrolled the internet and has a famous Reddit AMA"
    },
    {
      image: "elon-musk.jpg",
      name: "Elon Musk",
      hint: "CEO of Tesla and SpaceX",
      redditRelevance: "Frequently discussed across Reddit, particularly in tech subreddits"
    },
    {
      image: "arnold.jpg",
      name: "Arnold Schwarzenegger",
      hint: "I'll be back",
      redditRelevance: "Active Reddit user who often comments in fitness subreddits"
    },
    {
      image: "bill-gates.jpg",
      name: "Bill Gates",
      hint: "Microsoft founder and philanthropist",
      redditRelevance: "Regular AMAs and his Reddit Secret Santa participation"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const drawingTime = Settings.drawTimeEasy || 60;
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealLevel, setRevealLevel] = useState(1); // 1-5, where 5 is fully revealed
  const [showHint, setShowHint] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [drawingData, setDrawingData] = useState<drawData[]>(Array(Settings.canvasWidth * Settings.canvasHeight).fill({color: 0, drawn: false}));


  const innerSize = 275;
  const size = '275px';

  const pieceSize: Devvit.Blocks.SizeString = `${innerSize / 16}px`;


  const currentQuestion = questions[currentIndex];


  useInterval(() => {
    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    
    const randomIndex = Math.floor(Math.random() * drawingData.length);
    const randomIndex2 = Math.floor(Math.random() * drawingData.length);

    const newDrawingData = [...drawingData];
    newDrawingData[randomIndex].drawn = true;
    newDrawingData[randomIndex2].drawn = true;
    
    setDrawingData(newDrawingData);
     

    if (remainingTime <= 0) props.onComplete(score);
  }, 500).start();



  const handleSubmit = () => {
    // Clean up and normalize the input for comparison
    const cleanedInput = userInput.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.name.toLowerCase();
    
    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer || 
                   cleanedAnswer.includes(cleanedInput) || 
                   cleanedInput.includes(cleanedAnswer);
    
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setShowResult(false);
      setShowHint(false);
      setRevealLevel(1);
    } else {
      // We've reached the end of the questions
      onComplete(score);
    }
  };

  const pixels = drawingData.map((pixel, index) => (

    <>
    <hstack
      height={pieceSize}
      width={pieceSize}
      backgroundColor={
        pixel.drawn === true ? "transparent" : "black" 
      }

    > 
    </hstack>
    </>
  ));

  const grid = (
    <vstack height={size} width={size} padding="none">
      {splitArray(pixels, 16).map((row) => (
        <hstack>{row}</hstack>
      ))}
    </vstack>
  );




  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor="#F8F9FA">
      <hstack width="100%" alignment="middle">
        <text size="xlarge" weight="bold">Reddit Celeb</text>
        <spacer grow />
        <CustomButton
          width="32px"
          height="32px"
          text="close"
          onClick={onCancel}
        />
      </hstack>
      
      <spacer size="large" />
      
      <text alignment="center">
        Question {currentIndex + 1} of {questions.length} | Score: {score}
      </text>
      
      <spacer size="large" />
      
      <vstack alignment="middle center" width="100%">
        <zstack width="250px" height="250px">
            <image
                imageHeight={512}
                imageWidth={512}
                height={size}
                width={size}
                url="grid-template.png"
            />
          {grid}
        </zstack>
        
        <spacer size="large" />
        
        <text>Reveal stage: {revealLevel}/5</text>
        
        {showHint && (
          <vstack padding="medium" gap="small" alignment="middle center">
            <text weight="bold">Hint:</text>
            <text>{currentQuestion.hint}</text>
          </vstack>
        )}
        
        <spacer size="medium" />
        
        {!showResult ? (
          <vstack gap="medium" width="80%" alignment="middle center">
            
            
            <hstack gap="medium">
              <CustomButton
                width="120px"
                height="40px"
                text="redo"
                onClick={() => setShowHint(true)}
              />
              
              <CustomButton
                width="120px"
                height="40px"
                text="Solve"
                onClick={handleSubmit}
              />
            </hstack>
          </vstack>
        ) : (
          <vstack gap="medium" alignment="middle center">
            <text size="large" color={isCorrect ? "green" : "red"}>
              {isCorrect ? "Correct!" : "Wrong!"}
            </text>
            
            <CustomButton
              width="150px"
              height="40px"
              text={currentIndex < questions.length - 1 ? "Solve" : "redo"}
              onClick={handleNextQuestion}
            />
          </vstack>
        )}
      </vstack>
    </vstack>
  );
};