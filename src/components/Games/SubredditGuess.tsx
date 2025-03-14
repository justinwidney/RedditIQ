import { Context, Devvit, JSONObject, useState, TextAreaWidget, useForm } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";

interface SubredditPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

interface SubredditQuestion extends JSONObject {
  image: string;
  answer: string;
  hints: string[];
}


const myForm = Devvit.createForm(
    {
      fields: [
        {
          type: 'paragraph', // This creates a multi-line text input
          name: 'userText',
          label: 'Enter your text:',
        },
      ],
    },
    (event, context) => {
      context.ui.showToast({ text: `Submitted: ${event.values.userText}` });
    }
  );
  


export const SubredditGuessPage = (
  props: SubredditPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData } = props;

  const {ui, reddit} = context;
  
  // Sample subreddit questions
  const [questions] = useState<SubredditQuestion[]>([
    {
      image: "r-aww.jpg",
      answer: "aww",
      hints: ["Cute animals", "Wholesome content", "Makes you say the subreddit name"]
    },
    {
      image: "r-dataisbeautiful.jpg",
      answer: "dataisbeautiful",
      hints: ["Visualizations", "Graphs and charts", "Information presentation"]
    },
    {
      image: "r-oddlysatisfying.jpg",
      answer: "oddlysatisfying",
      hints: ["Things that feel good to watch", "Perfect fits", "Pleasing patterns"]
    },
    {
      image: "r-askreddit.jpg",
      answer: "askreddit",
      hints: ["Questions for the community", "Discussion-based", "Very popular"]
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setShowHint(false);
      setHintIndex(0);
    } else {
      // We've reached the end of the questions
      onComplete(score);
    }
  };


// Handle selecting an option for a blank
const handleOptionSelect = (option : string ) => {

    // Clean up and normalize the input for comparison
    const cleanedInput = option.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.answer.toLowerCase();
    
    console.log(cleanedInput, cleanedAnswer);

    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer || 
                  `r/${cleanedInput}` === cleanedAnswer || 
                  cleanedInput === `r/${cleanedAnswer}`;
    
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    
    setShowResult(true);
};

  const myForm = useForm(
    () => {
      return {
        fields: [
          {
            type: 'string',
            name: 'answer',
            label: 'Pick an option',
          },
        ],
   
      } 
    },
    (values) => {
      handleOptionSelect(values.answer);
    }
  );



  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor="#F8F9FA">
      <hstack width="100%" alignment="middle">
        <text size="xlarge" weight="bold">Who's That Subreddit?</text>
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
        <image
          url={currentQuestion.image}
          imageHeight={300}
          imageWidth={300}
          height="200px"
          width="200px"
        />
        
        
      
        <spacer size="medium" />
        
        {!showResult ? (
          <vstack gap="medium" width="80%" alignment="middle center">
            <hstack width="100%" gap="small">
              <text>r/</text>

            
         
            </hstack>
            
            <hstack gap="medium">
            
              
              <CustomButton
                width="120px"
                height="40px"
                text="redo"
                onClick={ ()=>    context.ui.showForm(myForm)}
              />
            </hstack>
          </vstack>
        ) : (
          <vstack gap="medium" alignment="middle center">
            <text size="large" color={isCorrect ? "green" : "red"}>
              {isCorrect ? "Correct!" : "Wrong!"}
            </text>
            
            {!isCorrect && (
              <text>The answer was: r/{currentQuestion.answer}</text>
            )}
            
            <CustomButton
              width="150px"
              height="40px"
              text={currentIndex < questions.length - 1 ? "close" : "redo"}
              onClick={handleNextQuestion}
            />
          </vstack>
        )}
      </vstack>
    </vstack>
  );
};