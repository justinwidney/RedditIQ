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

      else if( hintIndex > 2){
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
            scale={0.5} 
          />
        );
      }
    }
    return hearts;
  };


  return (
    <vstack width="100%" height="100%" padding="medium"  alignment="center">

      <spacer size="small" />

      <hstack width="100%" alignment="middle center">
        <image
          imageHeight={96}
          imageWidth={144}
          width="192px"
          height="96px"
          url={GAME_SVG.historian}
          description="Reddit Historian logo"
        />
      </hstack>

      <spacer size="small" />
      
      <vstack alignment="middle center" width={containerWidth}>
        <vstack width="100%" height="100%" border="thick" borderColor="gray" padding={padding} backgroundColor="#ffffff" >
          <hstack gap="small" alignment="start middle" backgroundColor="#2A3439" width="100%" padding="small">
            <PixelText scale={1} color="#FFFFFF">r/ </PixelText>
            <PixelText scale={1} color="white">{ question.content.subreddit}</PixelText>
            <spacer size="small" />
            <PixelText scale={1} color="white">??? ago</PixelText>

            <spacer grow />
            {renderHintHearts()}

          </hstack>

          <spacer size="small" />

          <hstack gap="small" alignment="start">
            <PixelText scale={1} color="black">{question.content.title}</PixelText>
          </hstack>

          <spacer size="small" />

          <image
            imageHeight={150}
            imageWidth={400}
            height="150px"
            width={pictureWidth}
            resizeMode="fill"
            url={question.image}
          />
           

        </vstack>
                
      
      </vstack>

      <spacer size="small" />

      <hstack alignment="middle center">
            <CustomButton
              width="120px"
              height="40px"
              textSize={2}
              label={"Solve"}
              onClick={() => context.ui.showForm(guessForm)}
            />
          </hstack>

    </vstack>
  );
};