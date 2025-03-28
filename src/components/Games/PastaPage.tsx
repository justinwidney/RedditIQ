import { Context, Devvit, JSONObject, useState, useForm, FormOnSubmitEvent } from "@devvit/public-api";
import { GameProps, GameScore, MultipleChoiceScore, PastaQuestion, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { INITIAL_MAX_HINTS, indexToLetter, splitTextByWordBoundaries } from "../../utils/utils.js";
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
  
  const [livesIndex, setLivesIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>(Array(question.blanks.length).fill(""));
  const [showResult, setShowResult] = useState(false);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const currentQuestion = question;

  const dimensions = context.dimensions || { width: 700, height: 500 };

  const chunkSize = dimensions.width > 500 ? 50 : 25
  const spacerSize = dimensions.width > 500 ? "large" : "small"

  const extraPadding = dimensions.width > 450 


  const updateScore = (points:number) : MultipleChoiceScore[]  =>  {

    setScore(prevScore => prevScore + points);
    let guessValue: MultipleChoiceScore;
    if (points === 3) guessValue = "3";
    else if (points === 2) guessValue = "2";
    else if (points === 1) guessValue = "1";
    else if (points === -1) guessValue = "-1"
    else guessValue = "0";

    const newUserGuess = [...userGuess, guessValue]; 
    setUserGuess(newUserGuess);
    return newUserGuess;
};
  
  const handleSubmit = (finished:boolean = false) => {

      let correct = 0;

      if(!finished){
        currentQuestion.blanks.forEach((answer, index) => {
        if (userInputs[index].toLowerCase().trim() === answer.toLowerCase()) {
          correct++;
        }
      });
      }
      
      else{
        correct = currentQuestion.blanks.length;
      }
      
      const points = Math.round(correct / currentQuestion.blanks.length * 3) 
      onComplete(updateScore(points));
  };

  // SKIP BUTTON
  const onFinish = () => {
    onComplete( updateScore(-1));
  };


  const tapLine = () => {
    context.ui.showToast("Tap the line to fill in the blanks!",);
  };

  // Handle selecting an option for a blank
  const handleOptionSelect = (option: string[], blankIndex: number) => {

    const correctAnswer = currentQuestion.blanks[blankIndex].toLowerCase();
    const selectedOption = option[0].toLowerCase();
    
    const newUserInputs = [...userInputs];
    newUserInputs[blankIndex] = option[0];
    setUserInputs(newUserInputs);
    
      // If answer is correct, mark this blank as correct
      if (selectedOption === correctAnswer) {
        // Only add to correctAnswers if it's not already in the array
        if (!correctAnswers.includes(blankIndex)) {
          setCorrectAnswers([...correctAnswers, blankIndex]);

          if (correctAnswers.length + 1 === currentQuestion.blanks.length) {
            handleSubmit(true);
          }

        }
      }

      else {
        const nextLivesIndex = livesIndex + 1;
        setLivesIndex(nextLivesIndex);

        if (nextLivesIndex >= INITIAL_MAX_HINTS ) {
          onComplete(updateScore(0));
        }
      }
    
    setActiveBlankIndex(null);
  };
  
  // Track the current blank index separately from form
  const [currentBlankIndex, setCurrentBlankIndex] = useState<number | null>(null);
  
  const myForm = useForm(
    (data: {lableOptions?: string[]}) => {
      return {
        fields: [
          {
            type: 'select',
            name: 'username',
            label: 'Pick an option',
            required: true,
            disabled: false,
            defaultValue: [''],
            options: data.lableOptions ? data.lableOptions.map((option) => ({
              value: option,
              label: option,
            })) : [],
          },
        ],
        acceptLabel: 'Submit',
        cancelLabel: 'Cancel',
      } 
    },
    (values) => {
      if (currentBlankIndex !== null) {
        handleOptionSelect(values.username, currentBlankIndex);
      }
    }
  );



  
  const handleTextClick = (index: number) => {

    // Don't allow clicking on blanks that have been answered incorrectly
    if (correctAnswers.includes(index)) {
      return;
    }

    const options = currentQuestion.options[index][0];
    setActiveBlankIndex(index);
    setCurrentBlankIndex(index);

    context.ui.showForm(myForm, { 
      lableOptions: options
    });
  }

  const renderTextWithBlanks = () => {
    const text = currentQuestion.text;
    const parts = splitTextByWordBoundaries(text, chunkSize);

    const flatIndex = (partIndex: number, subIndex: number) => {
      let count = 0;
      for (let i = 0; i < partIndex; i++) {
        count += (parts[i].split('_____').length - 1);
      }
      return count + subIndex;
    };
    
    return (
      <vstack width="100%" alignment="middle start">
        {parts.map((part, index) => (
          <hstack width="100%" alignment="start middle" height="25px">
            {part.split("_____").map((sub, subIndex) => { 
              const blankIndex = flatIndex(index, subIndex);
              const isCorrect = userInputs[blankIndex] && 
                userInputs[blankIndex].toLowerCase().trim() === currentQuestion.blanks[blankIndex].toLowerCase();
              
              return (
                <>
                  <PixelText scale={1.3} color="black">{sub}</PixelText>

                  {subIndex < part.split("_____").length - 1 && (
                    <vstack  
                      width="100px" 
                      border={showResult || isCorrect ? "thick" : "none"}
                      backgroundColor={
                        isCorrect
                          ? "rgba(0, 255, 0, 0.2)"
                          : userInputs[blankIndex] 
                            ? "rgba(255, 0, 0, 0.2)"
                            : "white"
                      }
                      padding="xsmall"
                      alignment="middle center"
                      height={"20px"}
                    >   
                      <hstack onPress={() => handleTextClick(blankIndex)}>
                        <text weight="bold" size="small" color="black">
                          {userInputs[blankIndex] || "___________"}
                        </text>
                      </hstack>
                    </vstack>
                  )}
                </>
              );
            })}
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
          {extraPadding ?  <PixelText scale={1} color={"black"}>Tries</PixelText> : null}
          {renderHintHearts(livesIndex)}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839" height={"55%"}>
        <vstack alignment="middle center" width="100%" backgroundColor="white" padding="small"  height={"100%"} >

          <hstack gap="small" alignment="start middle" width="100%" height={"20%"}>
            <PixelText scale={2} color="black">Fill in the blanks:</PixelText>
          </hstack>
          <hstack gap="small" alignment="start middle" width="100%">
            <PixelText scale={1} color="black">Click on a blank to see an option</PixelText>
          </hstack>

          <spacer size="small" />
          <vstack width="100%" alignment="center middle" height={"80%"}>
            {renderTextWithBlanks()}
          </vstack>
        </vstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle">
        <hstack width={extraPadding ? "60%" : "40%"} alignment="center middle" height="40px" padding="small" backgroundColor="#013839">
          <ProgressBar width={extraPadding? 300 : 100} onComplete={handleSubmit} />
        </hstack>
        
        <spacer grow />
        
        <hstack width={extraPadding ? "35%" : "55%"} alignment="center middle" height="40px">
          <CustomButton
             width={extraPadding? "85px" : "70px"}
            height="40px"
            label="skip"
            textSize={extraPadding? 2 : 1}
            color={"white"}
            onClick={onFinish} // Finish the game
          />
          <spacer grow />
          <CustomButton
            width={extraPadding? "85px" : "70px"}
            height="40px"
            textSize={extraPadding? 2 : 1}
            label="ENTER"
            color={"white"}
            onClick={ livesIndex > 0  ? handleSubmit : tapLine}
          />
        </hstack>
      </hstack>
    </vstack>
  );
  }