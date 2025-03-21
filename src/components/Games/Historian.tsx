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
  const { onComplete, onCancel, userData, setScore, setUserGuess, question } = props;
  const { ui } = context;
  
  

  const [currentIndex, setCurrentIndex] = useState(0);
  //const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [userAnswer, setAnswer] = useState({ month: "", year: "" });



  const handleShowHint = () => {
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    } else {
      setHintIndex(0);
    }
    setShowHint(true);
  };

  const guessForm = useForm(
    () => {
      return {
        fields: [
          {
            type: 'number',
            name: 'month',
            label: 'Month',
          },
          {
            type: 'number',
            name: 'year',
            label: 'Year',
          },
        ],
      };
    },
    (values) => {
      // Handle the guess submission
      const monthGuess = parseInt(values.month);
      const yearGuess = parseInt(values.year);
      
      const correctMonth = question.answer.month;
      const correctYear = question.answer.year;
      
      // Allow for partial matches (e.g., "jan" for "january")
      const monthCorrect = correctMonth === (monthGuess) 
      const yearCorrect = yearGuess === correctYear;
      
      setAnswer({ month: values.month, year: values.year });
      setIsCorrect(monthCorrect && yearCorrect);
      
      if (monthCorrect && yearCorrect) {
        setScore(prevScore => prevScore + 1);
        setUserGuess(prevState => [...prevState, ScoreToLetter(1) as GameScore])
        onComplete();
      }
      else if(monthCorrect || yearCorrect){
        setScore(prevScore => prevScore + 0.5);
        setUserGuess(prevState => [...prevState, ScoreToLetter(0.5) as GameScore])
        onComplete();
      }
      
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
    <vstack width="100%" height="100%" padding="small" backgroundColor="#9b59b6" alignment="center middle">
      <hstack width="100%" alignment="middle center">
        <image
          imageHeight={64}
          imageWidth={128}
          width="256px"
          height="128px"
          url={GAME_SVG.historian}
          description="Reddit Historian logo"
        />
      </hstack>

      <spacer size="small" />
      <hstack alignment="center middle">
          {renderHintHearts()}
      </hstack>
      <spacer size="small" />
      
      <vstack alignment="middle center" width="450px">
        <vstack width="100%" height="100%" border="thick" borderColor="black" cornerRadius="medium" padding="medium" backgroundColor="#ffffff">
          <hstack gap="small" alignment="start">
            <PixelText scale={1} color="black">r/ </PixelText>
            <PixelText scale={1} color="black">{ question.content.content}</PixelText>
            <spacer size="small" />
            <PixelText scale={1} color="black">??? ago</PixelText>
          </hstack>

          <spacer size="small" />

          <hstack gap="small" alignment="start">
            <PixelText scale={1.5} color="black">{question.content.title}</PixelText>
          </hstack>

          <spacer size="small" />

          <image
            imageHeight={180}
            imageWidth={400}
            height="180px"
            width="400px"
            resizeMode="fill"
            url={question.image}
          />
           
          <spacer grow />

          <hstack gap="small" alignment="middle start">
            <hstack width="100px" height="25px" alignment="center middle" gap="small" backgroundColor="gray">
              <hstack width="100%" height="100%" alignment="center middle" backgroundColor="gray" padding="small">
                <PixelSymbol type="arrow-up" color="#000000" scale={2}/>
                <PixelText scale={1.5} color="#000000"> 2242</PixelText> 
              </hstack>
            </hstack>   

            <CustomButton
              width="150px"
              height="25px"
              textSize={1}
              label={"Make a Guess"}
              onClick={() => context.ui.showForm(guessForm)}
            />
          </hstack>
        </vstack>
                
      
      </vstack>
    </vstack>
  );
};