import { Context, Devvit, JSONObject, useState, useForm } from "@devvit/public-api";
import { GameProps, GameScore, HistorianQuestion, UserData } from "../../types.js";
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
  const [userAnswer, setAnswer] = useState({ month: "", year: "" });
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);


  const containerWidth = context.dimensions.width > 600 ? '425px' : '325px';
  const pictureWidth = context.dimensions.width > 600 ? '390px' : '300px';
  const padding = context.dimensions.width > 600 ? 'medium' : 'small';

  const imageWidth:Devvit.Blocks.SizeString = `${context.dimensions.width}px`


  const toastMessage = (yearDifference:number, monthDifference:number) =>{

    const monthDifferenceText = monthDifference > 4 ? "Far" : `Close` ;
    const yearDifferenceText = yearDifference > 3 ? "Far" : `Close` ;

    ui.showToast({ text: `The Month is ${monthDifferenceText} and the Year is ${yearDifferenceText}` });
    
}


  const guessForm = useForm(
    () => {
      return {
        fields: [
          {
            type: 'number',
            name: 'month',
            label: 'Release Month',
            defaultValue: month,
          },
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
      // Handle the guess submission
      const monthGuess = parseInt(values.month);
      const yearGuess = parseInt(values.year);

      setMonth(monthGuess);
      setYear(yearGuess);
      
      const correctMonth = question.answer.month;
      const correctYear = question.answer.year;
      
      // Allow for partial matches (e.g., "jan" for "january")
      const monthCorrect = correctMonth === (monthGuess) 
      const yearCorrect = yearGuess === correctYear;

      const guessMonthsTotal = (yearGuess * 12) + monthGuess;
      const correctMonthsTotal = (correctYear * 12) + correctMonth;
      const timeDelta = Math.abs(guessMonthsTotal - correctMonthsTotal);

      const isWithinSixMonths = timeDelta <= 6;  
      const isWithinOneYear = timeDelta <= 12;

      setAnswer({ month: values.month, year: values.year });
      setIsCorrect(monthCorrect && yearCorrect);
      
      if (isWithinSixMonths) {
        setScore(prevScore => prevScore + 3);
        setUserGuess(prevState => [...prevState, '3'])
        onComplete(userGuess);
        return
      }

      else if( (isWithinOneYear) && hintIndex === 2){
        setScore(prevScore => prevScore + 0.5);
        setUserGuess(prevState => [...prevState, '1'])
        onComplete(userGuess);
        return
      }

      else if( hintIndex >= 2){
        setScore(prevScore => prevScore + 0);
        setUserGuess(prevState => [...prevState, '0'])
        onComplete(userGuess);
        return
      }
      

      const timeDifference = Math.abs(correctYear - yearGuess);
      const monthDifference = Math.abs(correctMonth - monthGuess);
      toastMessage(timeDifference, monthDifference)


      setShowResult(true);
      setHintIndex(prev => prev + 1);
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
            <PixelText scale={2} color="black">{question.content.title}</PixelText>
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
      <PixelText scale={1} color="white">Guess the release date of this game</PixelText>
      </hstack>

      <spacer grow />

      <hstack width="35%" alignment="center middle"  height="40px" >

          <CustomButton
                width="70px"
                height="40px"
                label="skip"
                color={"white"}
                onClick={onComplete}
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