import { Context, Devvit, JSONObject, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";

interface TriviaPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

interface TriviaQuestion extends JSONObject {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const TriviaPage = (
  props: TriviaPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData } = props;
  
  // Sample trivia questions
  const [questions] = useState<TriviaQuestion[]>([
    {
      question: "What was Reddit's original name?",
      options: ["Snoo", "ReadIt", "FrontPage", "Reddigg"],
      correctAnswer: 1
    },
    {
      question: "In what year was Reddit founded?",
      options: ["2003", "2005", "2007", "2009"],
      correctAnswer: 1
    },
    {
      question: "What is the Reddit mascot's name?",
      options: ["Snoo", "Redd", "Karma", "Alien"],
      correctAnswer: 0
    },
    {
      question: "What does 'TIL' commonly stand for on Reddit?",
      options: ["Time I Lost", "Today I Learned", "Truth In Life", "Tell It Live"],
      correctAnswer: 1
    },
    {
      question: "Which of these is NOT one of Reddit's default sort options?",
      options: ["Hot", "New", "Popular", "Rising"],
      correctAnswer: 2
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const [timerActive, setTimerActive] = useState(true);

  const currentQuestion = questions[currentIndex];



  const handleOptionSelect = (index: number) => {
    if (!showResult) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    setTimerActive(false);
    
    // Check if the answer is correct
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setTimeLeft(15);
      setTimerActive(true);
    } else {
      // We've reached the end of the questions
      onComplete(score);
    }
  };

  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor="#F8F9FA">
      <hstack width="100%" alignment="middle">
        <text size="xlarge" weight="bold">Reddit Trivia</text>
        <spacer grow />
        <CustomButton
          width="32px"
          height="32px"
          text="close"
          onClick={onCancel}
        />
      </hstack>
      
      <spacer size="large" />
      
      <hstack width="100%" alignment="middle">
        <text>Question {currentIndex + 1} of {questions.length}</text>
        <spacer grow />
        <text>Score: {score}</text>
        <spacer size="medium" />
        <text color={timeLeft < 5 ? "red" : "black"}>Time: {timeLeft}s</text>
      </hstack>
      
      <spacer size="large" />
      
      <vstack 
        padding="large"
        backgroundColor="white" 
        cornerRadius="medium" 
        border="thick"
        width="100%"
      >
        <text size="large" weight="bold" alignment="center">{currentQuestion.question}</text>
      </vstack>
      
      <spacer size="large" />
      
      <vstack gap="medium" width="100%">
        {currentQuestion.options.map((option, index) => (
          <hstack 
            padding="medium"
            backgroundColor={
              showResult 
                ? index === currentQuestion.correctAnswer 
                  ? "rgba(0, 255, 0, 0.2)" 
                  : selectedOption === index && selectedOption !== currentQuestion.correctAnswer 
                    ? "rgba(255, 0, 0, 0.2)" 
                    : "white"
                : selectedOption === index 
                  ? "rgba(0, 0, 255, 0.1)" 
                  : "white"
            }
            cornerRadius="medium"
            border="thick"
            onPress={() => handleOptionSelect(index)}
          >
            <text size="medium">{option}</text>
          </hstack>
        ))}
      </vstack>
      
      <spacer grow />
      
      <hstack width="100%" alignment="middle center">
        {!showResult ? (
          <CustomButton
            width="150px"
            height="40px"
            text="Solve"
            onClick={handleSubmit}
          
          />
        ) : (
          <vstack gap="medium" alignment="middle center">
            <text size="large" color={selectedOption === currentQuestion.correctAnswer ? "green" : "red"}>
              {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Wrong!"}
            </text>
            
            <CustomButton
              width="150px"
              height="40px"
              text={currentIndex < questions.length - 1 ? "Solve" : "redo"}
              onClick={handleNextQuestion}
            />
          </vstack>
        )}
      </hstack>
    </vstack>
  );
};