import { Context, Devvit, JSONObject, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";

interface PastaPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

interface PastaQuestion extends JSONObject{
  text: string;
  blanks: string[];
  reference: string;
  options: [string[], number][];
}

export const PastaPage = (
  props: PastaPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData } = props;
  
  // Sample reddit pasta questions with blanks
  const [questions] = useState<PastaQuestion[]>([
    {
      text: "To be fair, you have to have a very _____ IQ to understand _____. The humor is extremely _____, and without a solid grasp of _____ most of the jokes will go over a typical viewer's head.",
      blanks: ["high", "Rick and Morty", "subtle", "theoretical physics"],
      reference: "Famous TV show intellectual fan copypasta",
      options: [
        [["small", "big", "tiny", "huge"], 0],
        [["sat", "jumped", "slept", "played"], 0],
        [["blue", "green", "red", "yellow"], 2]
      ]
    },
    {
      text: "What the _____ did you just _____ say about me, you little _____? I'll have you know I graduated top of my class in the _____, and I've been involved in numerous secret raids on _____.",
      blanks: ["heck", "actually", "person", "Navy Seals", "Al-Quaeda"],
      reference: "Military toughness copypasta",
      options: [
        [["small", "big", "tiny", "huge"], 0],
        [["sat", "jumped", "slept", "played"], 0],
        [["blue", "green", "red", "yellow"], 2]
      ]
    },
    {
      text: "Did you ever hear the tragedy of _____? I thought not. It's not a story the _____ would tell you. It's a _____ legend. _____ was a Dark Lord of the _____, so powerful and so wise...",
      blanks: ["Darth Plagueis the Wise", "Jedi", "Sith", "Darth Plagueis", "Sith"],
      reference: "Star Wars prequel meme",
      options: [
        [["small", "big", "tiny", "huge"], 0],
        [["sat", "jumped", "slept", "played"], 0],
        [["blue", "green", "red", "yellow"], 2]
      ]
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>(Array(questions[0].blanks.length).fill(""));
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const currentQuestion = questions[currentIndex];

  const handleInputChange = (value: string, index: number) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleSubmit = () => {
    // Check how many answers are correct
    let correct = 0;
    currentQuestion.blanks.forEach((answer, index) => {
      if (userInputs[index].toLowerCase().trim() === answer.toLowerCase()) {
        correct++;
      }
    });
    
    setCorrectCount(correct);
    
    // Award points based on percentage correct
    const percentCorrect = correct / currentQuestion.blanks.length;
    if (percentCorrect >= 0.75) {
      setScore(score + 1); // Full point if 75%+ correct
    } else if (percentCorrect >= 0.5) {
      setScore(score + 0.5); // Half point if 50%+ correct
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInputs(Array(questions[currentIndex + 1].blanks.length).fill(""));
      setShowResult(false);
    } else {
      // We've reached the end of the questions
      onComplete(score);
    }
  };

  const handleTextClick = (index:number) => {
    setActiveBlankIndex(index);
  };



  const renderTextWithBlanks = () => {
    const parts = currentQuestion.text.split("_____");
    
    return (
      <hstack  width="100%" alignment="middle start">
        {parts.map((part, index) => (
          <>
            <text>{part}</text>
            
            {index < parts.length - 1 && (
              <vstack 
                width="100px" 
                height="200px" 
                border={showResult ? "thick" : "none"}
                backgroundColor={
                  showResult 
                    ? userInputs[index].toLowerCase().trim() === currentQuestion.blanks[index].toLowerCase()
                      ? "rgba(0, 255, 0, 0.2)"
                      : "rgba(255, 0, 0, 0.2)"
                    : "white"
                }
                padding="xsmall"
                alignment="middle center"
              >
                {showResult ? (
                  <text weight="bold">
                    {currentQuestion.blanks[index]}
                  </text>
                ) : (
                  <vstack onPress={()=> handleTextClick(index)} width="10px" height ="10px" backgroundColor="#000000">
                   
                    </vstack>
                )}

                       {/* Options popup */}
                    {activeBlankIndex !== null && !showResult && (
                      <vstack 
                        width="100%" 
                        backgroundColor="white" 
                        padding="small" 
                        border="thin"
                        height="100px"
                        borderColor="gray-5"
                        gap="small"
                      >
                        <vstack alignment="middle center" >
                          {currentQuestion?.options[activeBlankIndex][0].map((option:string, idx:number) => (
                              <text>{option}</text>
                          ))}
                          </vstack>
                      </vstack>
            )}

              </vstack>
            )}
          </>
        ))}
      </hstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor="#F8F9FA">
      <hstack width="100%" alignment="middle">
        <text size="xlarge" weight="bold">Name That Pasta</text>
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
      
      <vstack 
        padding="large"
        backgroundColor="white" 
        cornerRadius="medium" 
        border="thick"
        width="100%"
        gap="medium"
      >
        <text weight="bold" size="medium">Fill in the blanks:</text>
        
        {renderTextWithBlanks()}
      </vstack>
      
      <spacer size="large" />
      
      {!showResult ? (
        <CustomButton
          width="150px"
          height="40px"
          text="Solve"
          onClick={handleSubmit}
        />
      ) : (
        <vstack gap="medium" alignment="middle center">
          <text size="medium">
            You got {correctCount} out of {currentQuestion.blanks.length} correct!
          </text>
          
          <text size="small" color="gray">
            Reference: {currentQuestion.reference}
          </text>
          
          <CustomButton
            width="150px"
            height="40px"
            text={currentIndex < questions.length - 1 ? "redo" : "Solve"}
            onClick={handleNextQuestion}
          />
        </vstack>
      )}
    </vstack>
  );
};