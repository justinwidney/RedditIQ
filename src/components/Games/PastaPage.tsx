import { Context, Devvit, JSONObject, useState , useForm, FormOnSubmitEvent } from "@devvit/public-api";
import { GameProps, GameScore, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { indexToLetter } from "../../utils/utils.js";
import { GAME_SVG } from "../../data/svgs.js";

interface PastaPageProps {
  onComplete: () => void;
  onCancel: () => void;
  userData: UserData | null;
  setScore: ((value: number | ((prevState: number) => number)) => void);
}

interface PastaQuestion extends JSONObject{
  text: string;
  blanks: string[];
  reference: string;
  options: [string[], number][];
}

export const PastaPage = (
  props: GameProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess } = props;
  
  // Sample reddit pasta questions with blanks
  const [questions] = useState<PastaQuestion[]>([
    {
      text: "To be fair, you have to have a very _____ IQ to understand _____. The humor is extremely _____, and without a solid grasp of _____ most of the jokes will go over a typical viewer's head.",
      blanks: ["high", "Rick and Morty", "subtle", "theoretical physics"],
      reference: "Famous TV show intellectual fan copypasta",
      options: [
        [["small", "big", "tiny", "high"], 0],
        [["sat", "Rick and Morty", "slept", "played"], 0],
        [["blue", "green", "subtle", "yellow"], 2],
        [["theoretical physics", "quantum mechanics", "calculus", "algebra"], 3]
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
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const currentQuestion = questions[currentIndex];


  const handleSubmit = () => {
    // Check how many answers are correct
    let correct = 0;

    currentQuestion.blanks.forEach((answer, index) => {
      if (userInputs[index].toLowerCase().trim() === answer.toLowerCase()) {
        correct++;
      }
    });
    
    setCorrectCount(correct);

    let pointsEarned = (3 / currentQuestion.blanks.length) * correct
    setScore(prevScore => prevScore + pointsEarned);
    setUserGuess(prevState => [...prevState, indexToLetter(correct) as GameScore])
    onComplete();

    setShowResult(true);

  };



// Handle selecting an option for a blank
const handleOptionSelect = (option :string[] ) => {
  if (activeBlankIndex !== null) {
    const newUserInputs = [...userInputs];
    newUserInputs[activeBlankIndex] = option[0];
    setUserInputs(newUserInputs);
    setActiveBlankIndex(null);
  }
};

    const myForm = useForm(
      (data: {lableOptions? :string[]}) => {
        return {
          fields: [
            {
              type: 'select',
              name: 'username',
              label: 'Pick an option',
              options : data.lableOptions ? data.lableOptions.map((option) => ({
                value: option,
                label: option,
              })) : undefined,
            },
          ],
     
        } 
      },
      (values) => {
        handleOptionSelect(values.username);
      }
    );


  const handleTextClick = (index: number) => {

      const options = currentQuestion.options[index][0];
      setActiveBlankIndex(index);
      context.ui.showForm(myForm, { lableOptions: options  });

    }

 

  



  const renderTextWithBlanks = () => {

    let globalPlaceholderIndex = 0;

    const chunkSize = 70;
    const text = currentQuestion.text;

    const splitTextBySize = (text: string, chunkSize: number) => {
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
      }
      return chunks;
    };
    

    const parts = splitTextBySize(text, chunkSize);



    const flatIndex = (partIndex: number, subIndex:number) => {
    let count = 0;
    for (let i = 0; i < partIndex; i++) {
      count += (parts[i].split('_____').length - 1);
    }
    return count + subIndex;
  };
    
    return (
      <vstack  width="100%" alignment="middle start" >
        {parts.map((part, index) => (
          <hstack width="100%">
            {part.split("_____").map((sub, subIndex) => ( 
                <>
              <text>{sub}</text>

              {subIndex < part.split("_____").length - 1 && (
                <vstack  
                  width="100px" 
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
                    <text weight="bold" onPress={() => handleTextClick(flatIndex(index, subIndex))}>
                      {userInputs[flatIndex(index, subIndex)] || "_______"}
                    </text>
                  
                </vstack>
              )}
              </>

            ))}
            
          </hstack>
        ))}
      </vstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor="#F8F9FA">
      <vstack width="100%" alignment="middle center">

                <image
                imageHeight={64}
                imageWidth={128}
                width="256px"
                height="128px"
                        url={GAME_SVG.copyPasta}
                description="chess paint logo"
                />

        <ProgressBar width={256} onComplete={handleSubmit} />
        
      </vstack>
      
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
           <vstack gap="medium" alignment="middle center">
          <CustomButton
            width="150px"
            height="40px"
            label="Submit"
            onClick={handleSubmit}
        />
      </vstack>
      ) : (
        <vstack gap="medium" alignment="middle center">
          <text size="medium">
            You got {correctCount} out of {currentQuestion.blanks.length} correct!
          </text>
        
        </vstack>
      )}
    </vstack>
  );
};