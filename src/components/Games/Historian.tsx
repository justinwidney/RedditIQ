import { Context, Devvit, JSONObject, useState, useForm } from "@devvit/public-api";
import { GameProps, GameScore, HistorianQuestion, MultipleChoiceScore, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { PixelText } from "../Addons/PixelText.js";
import { PixelSymbol } from "../Addons/PixelSymbol.js";
import { ScoreToLetter } from "../../utils/utils.js";
import { GAME_SVG } from "../../data/svgs.js";
import { PieceSymbol } from "../Addons/PieceSymbol.js";





interface HistorianPageProps extends GameProps {
  question: HistorianQuestion;
}

const INITIAL_MAX_HINTS = 3;

export const HistorianPage = (
  props: HistorianPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;
  const { ui } = context;
  
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [userAnswer, setAnswer] = useState({  year: 0});
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);

  const dimensions = context.dimensions || { width: 700, height: 500 }; // default dimensions

  const containerWidth = dimensions.width > 600 ? '425px' : '325px';
  const pictureWidth = dimensions.width > 600 ? '390px' : '300px';
  const padding = dimensions.width > 600 ? 'medium' : 'small';

  const imageWidth:Devvit.Blocks.SizeString = `${dimensions.width}px`


  const toastMessage = (yearDifference:number, ) =>{
    const yearDifferenceText = yearDifference > 3 ? "Far" : `Close` ;
    ui.showToast({ text: `The Year is ${yearDifferenceText}` });
    
}


  const updateScore = (points:number) : MultipleChoiceScore[]  =>  {

      setScore(prevScore => prevScore + points);
      let guessValue: MultipleChoiceScore;
      if (points === 3) guessValue = "3";
      else if (points === 1) guessValue = "1";
      else guessValue = "0";

      const newUserGuess = [...userGuess, guessValue]; 

      setUserGuess(newUserGuess);

      return newUserGuess;
};

  const onFinish = () => {
   
    onComplete( updateScore(0) );
  };



  const handleSubmit = (values: { [x: string]: any; month?: any; year?: any; }) => {


    const yearGuess = parseInt(values.year);
  
    // Update state with user's guess
    setYear(yearGuess);
    setAnswer({ year: yearGuess });
    
    const correctYear = question.answer.year;
  
    const yearCorrect = yearGuess === correctYear;
    setIsCorrect( yearCorrect);
    
    const timeDelta = Math.abs(yearGuess - correctYear);
  
    // Determine score based on accuracy
    if (timeDelta <= 0) {
     ;
      onComplete( updateScore(3));
      return;

    } else if (timeDelta <= 2 && hintIndex === 2) {
      updateScore(1);
      onComplete( updateScore(1));
      return;

    } else if (hintIndex >= 2) {
      onComplete( updateScore(0));
      return;
    }
  
    // If not returning early, show hint and result
    const yearDifference = Math.abs(correctYear - yearGuess);
    toastMessage(yearDifference);
    setShowResult(true);
    setHintIndex(prev => prev + 1);
};

  const guessForm = useForm(
    () => {
      return {
        fields: [
          {
            type: 'number',
            name: 'year',
            label: 'Release Year',
            defaultValue: year,
          },
        ],
      };
    },
    (values) => {
      
      handleSubmit(values);
    }
  );

  const renderHintHearts = () => {
    const hearts = [];
    for (let i = INITIAL_MAX_HINTS - 1; i >= 0; i--) {
      if (hintIndex <= i) {
        hearts.push(
          <PieceSymbol 
            type="heart" 
            color="red" 
            scale={1} 
          />
        );
      }
    }
    return hearts;
  };


  return (
    <vstack width="100%" height="100%" padding="medium"  alignment="center">

  <spacer height="58px" />

      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <hstack width="100%" alignment="center middle" backgroundColor="white" >
        <spacer size="small" />
        <PixelText scale={1} color={"black"}>www.</PixelText>
        <image
                   imageHeight={64}
                   imageWidth={64}
                   width="96px"  // Calculated to maintain aspect ratio: 40 ÷ 48 × 64 = 53.33
                   height="32px" // Your target height
                   url={GAME_SVG.historian}              
              />
        <PixelText  scale={1}  color={"black"}>.com</PixelText>

        <spacer grow />
        <PixelText scale={1} color={"black"}>Tries</PixelText>
        {renderHintHearts()}
        </hstack>
       </hstack>


      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">

      <vstack alignment="middle center" width="100%" backgroundColor="white">
    
          <hstack gap="small" alignment="start middle" backgroundColor="white" width="100%" padding="small">
            <PixelText scale={1} color="black">r/ </PixelText>
            <PixelText scale={1} color="black">{ question.content.subreddit}</PixelText>
            <spacer size="small" />
            <PixelText scale={1} color="black">??? ago</PixelText>

          </hstack>

          <spacer size="small" />

          <hstack gap="small" alignment="start">
            <PixelText scale={1.5} color="black">{question.content.title}</PixelText>
          </hstack>

          <spacer size="small" />

          <image
            imageHeight={200}
            imageWidth={pictureWidth}
            height="100%"
            width="100%"
            resizeMode="fill"
            url={question.image}
          />
           
           </vstack>

        </hstack>
                
      

      <spacer size="small" />
      <hstack width="80%" alignment="center middle" >

      <hstack width="60%" alignment="center middle"  height="40px" padding="small" backgroundColor="#013839">
      <PixelText scale={1} color="white">Guess the Date?</PixelText>
      </hstack>

      <spacer grow />

      <hstack width="35%" alignment="center middle"  height="40px" >

          <CustomButton
                width="70px"
                height="40px"
                label="skip"
                color={"white"}
                onClick={onFinish}
              />
              <spacer grow />

              <CustomButton
                width="100px"
                height="40px"
                label="ENTER"
                color={"white"}
                onClick={()=> { if (hintIndex < INITIAL_MAX_HINTS) return context.ui.showForm(guessForm)}}
              />
          </hstack>
      </hstack>
    </vstack>
  );
};