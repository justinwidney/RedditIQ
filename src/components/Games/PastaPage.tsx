import { Context, Devvit, JSONObject, useState , useForm, FormOnSubmitEvent } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";
import { ProgressBar } from "../ProgressBar.js";

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
  const [score, setScore] = useState(0);
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
                        url={`data:image/svg+xml,
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 128 64" shape-rendering="crispEdges">
                        <metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
                        <path stroke="#9c5a3c" d="M32 19h2M28 20h4M34 20h4M39 20h1M27 21h2M39 21h1M25 22h1M27 22h1M34 22h3M39 22h4M24 23h2M33 23h1M36 23h2M40 23h1M42 23h3M23 24h2M33 24h1M38 24h1M44 24h2M22 25h2M34 25h1M36 25h1M39 25h1M45 25h1M21 26h2M35 26h2M39 26h1M45 26h1M23 27h4M37 27h3M45 27h1M20 28h1M22 28h1M27 28h1M45 28h1M20 29h1M24 29h1M20 30h1M25 30h1M38 30h1M40 30h1M46 30h1M20 31h1M22 31h6M41 31h1M45 31h2M20 32h1M36 32h1M42 32h1M45 32h1M20 33h2M36 33h1M38 33h1M40 33h1M42 33h1M45 33h1M21 34h2M36 34h1M41 34h1M44 34h2M22 35h1M38 35h3M43 35h2M22 36h3M43 36h1M24 37h3M41 37h3M26 38h3M36 38h6M28 39h9" />
                        <path stroke="#000000" d="M53 19h1M56 19h1M59 19h2M63 19h1M67 19h1M69 19h4M76 19h5M82 19h1M85 19h1M88 19h2M92 19h5M53 20h2M56 20h1M58 20h1M61 20h1M63 20h2M66 20h2M69 20h1M78 20h1M82 20h1M85 20h1M87 20h1M90 20h1M94 20h1M53 21h1M55 21h2M58 21h4M63 21h1M65 21h1M67 21h1M69 21h3M78 21h1M82 21h4M87 21h4M94 21h1M53 22h1M56 22h1M58 22h1M61 22h1M63 22h1M67 22h1M69 22h1M78 22h1M82 22h1M85 22h1M87 22h1M90 22h1M94 22h1M53 23h1M56 23h1M58 23h1M61 23h1M63 23h1M67 23h1M69 23h4M78 23h1M82 23h1M85 23h1M87 23h1M90 23h1M94 23h1M53 32h6M65 32h4M75 32h6M83 32h10M97 32h4M53 33h6M65 33h4M75 33h6M83 33h10M97 33h4M53 34h2M59 34h2M63 34h2M69 34h2M73 34h2M87 34h2M95 34h2M101 34h2M53 35h2M59 35h2M63 35h2M69 35h2M73 35h2M87 35h2M95 35h2M101 35h2M53 36h6M63 36h8M75 36h4M87 36h2M95 36h8M53 37h6M63 37h8M75 37h4M87 37h2M95 37h8M53 38h2M63 38h2M69 38h2M79 38h2M87 38h2M95 38h2M101 38h2M53 39h2M63 39h2M69 39h2M79 39h2M87 39h2M95 39h2M101 39h2M53 40h2M63 40h2M69 40h2M73 40h6M87 40h2M95 40h2M101 40h2M53 41h2M63 41h2M69 41h2M73 41h6M87 41h2M95 41h2M101 41h2" />
                        <path stroke="#ffc20e" d="M32 20h2M29 21h5M37 21h2M28 22h1M31 22h1M37 22h2M28 23h2M38 23h2M25 24h2M28 24h2M32 24h1M39 24h4M24 25h3M31 25h2M40 25h3M23 26h2M29 26h2M34 26h1M40 26h3M44 26h1M29 27h1M33 27h3M40 27h1M44 27h1M28 28h1M33 28h2M36 28h4M42 28h3M30 29h2M36 29h3M40 29h1M42 29h2M45 29h1M28 30h1M30 30h2M34 30h4M41 30h2M45 30h1M28 31h1M30 31h1M34 31h2M44 31h1M23 32h6M31 32h2M34 32h1M43 32h2M46 32h1M22 33h2M25 33h2M29 33h1M31 33h1M35 33h1M43 33h2M23 34h3M27 34h1M29 34h1M31 34h1M35 34h1M42 34h2M23 35h1M26 35h4M32 35h1M35 35h2M41 35h2M26 36h3M31 36h5M38 36h5M29 37h4M34 37h1M36 37h5M30 38h2M33 38h1" />
                        <path stroke="#8c4600" d="M38 20h1M34 21h1M36 21h1M43 24h1M43 25h2M46 29h1M29 38h1" />
                        <path stroke="#b77a2b" d="M35 21h1M24 22h1M22 23h2M21 24h1M20 25h1M19 26h1M46 26h1M18 28h1M47 28h1M18 29h1M47 29h1M28 43h1M37 43h1" />
                        <path stroke="#e5aa7a" d="M26 22h1M29 22h2M32 22h2M26 23h2M30 23h3M27 24h1M30 24h2M27 25h4M33 25h1M25 26h4M31 26h3M43 26h1M28 27h1M30 27h3M36 27h1M41 27h3M29 28h4M35 28h1M40 28h2M28 29h2M32 29h3M39 29h1M44 29h1M29 30h1M32 30h2M39 30h1M43 30h2M29 31h1M31 31h3M36 31h2M42 31h2M29 32h2M33 32h1M35 32h1M27 33h2M30 33h1M33 33h2M26 34h1M30 34h1M32 34h3M24 35h2M30 35h2M33 35h2M37 35h1M29 36h2M36 36h2M28 37h1M35 37h1M21 38h1M34 38h1M23 39h2M41 39h1M25 40h2M37 40h3M41 40h1M26 41h2M29 41h4M38 41h1M32 42h4" />
                        <path stroke="#990030" d="M34 23h2M34 24h4M35 25h1M37 25h2M37 26h2M23 28h4M22 29h2M25 29h3M22 30h3M26 30h2M38 31h3M37 32h5M37 33h1M39 33h1M41 33h1M37 34h4" />
                        <path stroke="#fdf1b5" d="M41 23h1M21 28h1M21 32h1M35 38h1" />
                        <path stroke="#eee7be" d="M22 24h1M21 25h1M46 28h1M43 39h1M23 40h1M41 41h1M26 42h1M39 42h1M29 43h1M36 43h1" />
                        <path stroke="#ffffff" d="M20 26h1M20 27h1M22 27h1M19 28h1M19 29h1M21 29h1M35 29h1M19 30h1M21 30h1M19 31h1M21 31h1M19 32h1M22 32h1M20 35h1M44 36h1M21 37h1M22 38h1M43 38h2M22 39h1M42 39h1M24 40h1M27 40h1M36 40h1M40 40h1M42 40h1M24 41h2M28 41h1M33 41h5M39 41h2M27 42h5M36 42h3M30 43h6" />
                        <path stroke="#61422b" d="M19 27h1M46 27h1M18 30h1M47 30h1M46 35h1M19 36h1M46 36h1M20 37h1M45 37h1M45 38h1M21 39h1M44 39h1M22 40h1M43 40h1M23 41h1M42 41h1M25 42h1M40 42h1M27 43h1M38 43h1M29 44h8" />
                        <path stroke="#bd6e00" d="M21 27h1" />
                        <path stroke="#2a190e" d="M18 31h1M47 31h1M18 32h1M47 32h1M18 33h1M47 33h1M18 34h1M47 34h1M20 38h1M24 42h1M41 42h1M26 43h1M39 43h1" />
                        <path stroke="#f8f8d8" d="M19 33h1M46 33h1" />
                        <path stroke="#eccca4" d="M19 34h1M46 34h1M45 35h1" />
                        <path stroke="#b4b4b4" d="M20 34h1M21 35h1M21 36h1M22 37h2M44 37h1M23 38h2M42 38h1M25 39h3M37 39h4M28 40h8" />
                        <path stroke="#bc9a81" d="M19 35h1M20 36h1M45 36h1" />
                        <path stroke="rgba(0,0,0,0.3058823529411765)" d="M47 35h1M47 36h2M46 37h3M46 38h3M45 39h4M44 40h5M43 41h5M42 42h6M25 43h1M40 43h7M27 44h2M37 44h9M29 45h15M32 46h9" />
                        <path stroke="rgba(0,0,0,0.16470588235294117)" d="M48 35h1M48 41h1M47 43h1M46 44h1M44 45h1M41 46h1" />
                        <path stroke="#f3d54c" d="M25 36h1M27 37h1" />
                        <path stroke="#e1b57d" d="M25 38h1" />
                        <path stroke="#e9ab3c" d="M32 38h1" />
                        <path stroke="rgba(0,0,0,0.08627450980392157)" d="M23 43h1M19 44h1M23 44h1" />
                        <path stroke="rgba(0,0,0,0.09019607843137255)" d="M26 44h1M27 45h1" />
                        <path stroke="rgba(0,0,0,0.1568627450980392)" d="M28 45h1M31 46h1" />
                        <path stroke="rgba(0,0,0,0.08235294117647059)" d="M30 46h1" />
                        </svg>`}
                description="chess paint logo"
                />


        <ProgressBar width={256} onComplete={onCancel} />
        
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