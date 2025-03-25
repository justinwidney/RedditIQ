import { Context, Devvit, JSONObject, useState , useForm, FormOnSubmitEvent } from "@devvit/public-api";
import { GameProps, GameScore, PastaQuestion, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { indexToLetter } from "../../utils/utils.js";
import { GAME_SVG } from "../../data/svgs.js";
import Settings from "../../Settings.json";
import { PixelText } from "../Addons/PixelText.js";
import { renderHintHearts } from "../Addons/Hearts.js";


interface PastaPageProps extends GameProps {
  question: PastaQuestion;
}



export const PastaPage = (
  props: PastaPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>(Array(question.blanks.length).fill(""));
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const currentQuestion = question;

  const dimensions = context.dimensions;

  const chunkSize = dimensions.width > 500 ? 50 : 25
  const spacerSize = dimensions.width > 500 ? "large" : "small"


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

    const points = Math.round(correct / currentQuestion.blanks.length * 3) 
    const stringPoints = points === 3 ? "3" : points === 2 ? "2" : points === 1 ? "1" : "0";

    setScore(prevScore => prevScore + pointsEarned);
    setUserGuess(prevState => [...prevState, stringPoints ])
    onComplete(userGuess);

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

    
    const text = currentQuestion.text;

    const splitTextByWordBoundaries = (text: string, chunkSize: number) => {
      const chunks: string[] = [];
      let currentChunk = "";
      
      // Split the text into words
      const words = text.split(/\s+/);
      
      for (const word of words) {
        const potentialChunk = currentChunk ? `${currentChunk} ${word}` : word;
        
        if (potentialChunk.length <= chunkSize) {
          currentChunk = potentialChunk;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
          }
          
          if (word.length > chunkSize) {
            for (let i = 0; i < word.length; i += chunkSize) {
              chunks.push(word.substring(i, i + chunkSize));
            }
            currentChunk = "";
    
          } else {
            currentChunk = word;
          }
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    };

    const parts = splitTextByWordBoundaries(text, chunkSize);


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
          <hstack width="100%" alignment="start middle" height="25px">
            {part.split("_____").map((sub, subIndex) => ( 
                <>
              <PixelText scale={1.1} color="black">{sub}</PixelText>

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
                  height={"20px"}
                >   
                    <hstack onPress={() => handleTextClick(flatIndex(index, subIndex))}>
                      <text weight="bold" size="small" color="black" >
                        {userInputs[flatIndex(index, subIndex)] || "___________"}
                      </text>
                    </hstack>
                  
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
            url={GAME_SVG.copyPasta}
          />
          <PixelText scale={1} color={"black"}>.com</PixelText>
          <spacer grow />
          <PixelText scale={1} color={"black"}>Tries</PixelText>
          {renderHintHearts(0)}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <vstack alignment="middle center" width="100%" backgroundColor="white" padding="small">
          <hstack gap="small" alignment="start" width="100%">
            <PixelText scale={2} color="black">Fill in the blanks:</PixelText>
          </hstack>
          <spacer size="small" />
          <vstack width="100%" alignment="center middle" height={"230px"}>
            {renderTextWithBlanks()}
          </vstack>
        </vstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle">
        <hstack width="60%" alignment="center middle" height="40px" padding="small" backgroundColor="#013839">
          <ProgressBar width={300} onComplete={handleSubmit} />
        </hstack>
        
        <spacer grow />
        
        <hstack width="35%" alignment="center middle" height="40px">
          <CustomButton
            width="70px"
            height="40px"
            label="skip"
            color={"white"}
            onClick={onComplete || handleSubmit}
          />
          <spacer grow />
          <CustomButton
            width="100px"
            height="40px"
            label="ENTER"
            color={"white"}
            onClick={() => handleSubmit}
          />
        </hstack>
      </hstack>
    </vstack>
  );
};