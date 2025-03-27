import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { GameProps, GameScore, MultipleChoiceScore, TriviaQuestion, UserData } from "../../types.js";
import { OptionItem } from "./TriviaOption.js";

import Settings from '../../Settings.json';
import { ProgressBar } from "../Addons/ProgressBar.js";
import { PixelText } from "../Addons/PixelText.js";
import { INITIAL_MAX_HINTS, indexToLetter, splitTextByWordBoundaries } from "../../utils/utils.js";
import { renderHintHearts } from "../Addons/Hearts.js";
import { CustomButton } from "../Addons/CustomButton.js";

interface TriviaPageProps extends GameProps {
  question: TriviaQuestion;
}


export const TriviaPage = (
  props: TriviaPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess  } = props;
  
  const dimensions = context.dimensions || { width: 700, height: 500 }; // default dimensions

  const textSize = dimensions.width > 600 ? 1.5 : 1;
  const extraPadding = dimensions.width > 450 


  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const [timerActive, setTimerActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [livesIndex, setLivesIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);

  const currentQuestion = question.questions[currentIndex];
  const [nextQuestionTime, setNextQuestionTime] = useState(10000);


  useInterval(() => {

    setNextQuestionTime( (nextQuestionTime) => nextQuestionTime - 500)
    const remainingTime = nextQuestionTime - 500;
    
    if (remainingTime <= 0) {
      handleNextQuestion();
      setNextQuestionTime(100000);
    }
  }, 500).start();


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
  

  const handleOptionSelect = (index: number) => {

    if (!submitted){  
      setSelectedOption(index);
      handleSubmit(index);
      setNextQuestionTime(1500)
    }

    setSubmitted(true);
  };

  const handleSubmit = (index:number) => {

    setTimerActive(false);

    // Check if the answer is correct
    if (index === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
      //setUserGuess(prevState => [...prevState, '1'])
    }
    else {
      //setUserGuess(prevState => [...prevState, '0'])
      setLivesIndex(prev => prev +1 );
    }
    
    setShowResult(true);
  };


  const onFinish = () => {

      const ratio = correctAnswers / question.questions.length;
      let gameScore 

      if (ratio >= 0.8) gameScore = 3;
      else if (ratio >= 0.6) gameScore = 2;
      else if (ratio >= 0.4) gameScore = 1;
      else gameScore = -1;
      
      onComplete(updateScore(gameScore));
  }


  const handleNextQuestion = () => {

    if (currentIndex < question.questions.length - 1 && livesIndex < INITIAL_MAX_HINTS) {
      setCurrentIndex( (currentIndex) => currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setTimeLeft(15);
      setTimerActive(true);
      setSubmitted(false);
    } else {
      // We've reached the end of the questions
      onFinish();
    }
  };



  const chunkSize = extraPadding ? 50 : 40;

  const parts = splitTextByWordBoundaries(currentQuestion.question, chunkSize);


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
            url={`data:image/svg+xml,
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 128 64" shape-rendering="crispEdges">
                      <path stroke="#4a2b0a" d="M35 7h4M35 8h4M31 9h5M38 9h3M31 10h4M39 10h2M27 11h5M40 11h3M27 12h4M40 12h3M23 13h5M42 13h3M23 14h4M43 14h2M19 15h5M44 15h3M19 16h4M45 16h2M15 17h5M46 17h3M15 18h4M47 18h2M11 19h5M48 19h3M11 20h4M49 20h2M7 21h5M49 21h4M7 22h4M49 22h4M5 23h3M51 23h4M5 24h2M51 24h4M5 25h2M53 25h2M5 26h2M53 26h2M5 27h2M5 28h2M5 29h2M5 30h2M5 31h2M5 32h2M5 33h2M5 34h2M5 35h2M53 35h2M5 36h2M53 36h2M5 37h2M49 37h4M5 38h2M49 38h4M5 39h2M45 39h4M5 40h2M45 40h4M5 41h2M41 41h4M5 42h3M41 42h4M7 43h2M37 43h4M8 44h1M37 44h4M9 45h2M33 45h4M9 46h2M33 46h4M11 47h2M29 47h4M11 48h2M29 48h4M13 49h2M25 49h4M13 50h2M25 50h4M15 51h10M15 52h10" />
                      <path stroke="#5e350b" d="M36 9h2M35 10h4M32 11h8M31 12h9M28 13h14M27 14h16M24 15h20M23 16h22M20 17h26M19 18h28M16 19h32M15 20h34M12 21h37M11 22h38M8 23h43M7 24h44M7 25h46M7 26h46M9 27h42M9 28h42M9 29h38M9 30h38M11 31h32M11 32h32M13 33h26M13 34h26M15 35h20M15 36h20M15 37h16M15 38h16M17 39h10M17 40h10M19 41h4M19 42h4" />
                      <path stroke="#000000" d="M59 16h6M69 16h8M79 16h6M89 16h6M99 16h6M107 16h10M59 17h6M69 17h8M79 17h6M89 17h6M99 17h6M107 17h10M59 18h2M65 18h2M69 18h2M79 18h2M85 18h2M89 18h2M95 18h2M101 18h2M111 18h2M59 19h2M65 19h2M69 19h2M79 19h2M85 19h2M89 19h2M95 19h2M101 19h2M111 19h2M59 20h6M69 20h6M79 20h2M85 20h2M89 20h2M95 20h2M101 20h2M111 20h2M59 21h6M69 21h6M79 21h2M85 21h2M89 21h2M95 21h2M101 21h2M111 21h2M59 22h2M63 22h2M69 22h2M79 22h2M85 22h2M89 22h2M95 22h2M101 22h2M111 22h2M59 23h2M63 23h2M69 23h2M79 23h2M85 23h2M89 23h2M95 23h2M101 23h2M111 23h2M59 24h2M65 24h2M69 24h8M79 24h6M89 24h6M99 24h6M111 24h2M59 25h2M65 25h2M69 25h8M79 25h6M89 25h6M99 25h6M111 25h2M59 28h6M69 28h8M81 28h4M91 28h4M99 28h2M109 28h2M59 29h6M69 29h8M81 29h4M91 29h4M99 29h2M109 29h2M59 30h2M65 30h2M69 30h2M79 30h2M85 30h2M89 30h2M95 30h2M99 30h2M109 30h2M59 31h2M65 31h2M69 31h2M79 31h2M85 31h2M89 31h2M95 31h2M99 31h2M109 31h2M59 32h6M69 32h6M79 32h2M89 32h8M99 32h2M109 32h2M59 33h6M69 33h6M79 33h2M89 33h8M99 33h2M109 33h2M59 34h2M63 34h2M69 34h2M79 34h2M85 34h2M89 34h2M95 34h2M99 34h2M109 34h2M59 35h2M63 35h2M69 35h2M79 35h2M85 35h2M89 35h2M95 35h2M99 35h2M109 35h2M59 36h2M65 36h2M69 36h8M81 36h4M89 36h2M95 36h2M99 36h8M109 36h8M59 37h2M65 37h2M69 37h8M81 37h4M89 37h2M95 37h2M99 37h8M109 37h8M88 43h3M87 44h1M91 44h1M86 45h2M91 45h1M77 46h2M85 46h1M88 46h3M96 46h2M76 47h1M79 47h1M85 47h1M95 47h1M98 47h1" />
                      <path stroke="#a3a3a3" d="M7 27h2M51 27h4M7 28h2M51 28h4M7 29h2M47 29h3M53 29h2M7 30h2M47 30h3M53 30h2M7 31h4M43 31h4M53 31h2M7 32h4M43 32h4M53 32h2M7 33h6M39 33h4M53 33h2M7 34h6M39 34h4M53 34h2M7 35h2M11 35h4M35 35h4M49 35h4M7 36h1M11 36h4M35 36h3M49 36h3M7 37h1M13 37h2M31 37h4M45 37h4M7 38h1M13 38h2M31 38h1M45 38h3M7 39h2M15 39h2M27 39h4M41 39h4M7 40h2M15 40h2M27 40h4M41 40h3M7 41h2M17 41h2M23 41h4M37 41h4M8 42h1M17 42h2M23 42h2M37 42h3M19 43h6M33 43h4M10 44h1M19 44h6M33 44h3M11 45h1M21 45h4M29 45h4M21 46h4M29 46h3M21 47h8M14 48h1M21 48h7M15 49h10M16 50h9" />
                      <path stroke="#ffffff" d="M50 29h3M50 30h3M47 31h6M47 32h6M43 33h10M43 34h10M9 35h2M39 35h10M8 36h3M38 36h11M8 37h5M35 37h10M8 38h5M32 38h12M9 39h6M32 39h9M9 40h6M31 40h10M10 41h7M27 41h10M9 42h8M25 42h12M9 43h10M25 43h8M11 44h8M25 44h7M88 44h3M12 45h9M25 45h4M88 45h3M12 46h9M25 46h4M13 47h8M77 47h2M96 47h2M16 48h5" />
                      <path stroke="#b8b8b8" d="M52 36h1M48 38h1M44 40h1M40 42h1M36 44h1M32 46h1M28 48h1" />
                      <path stroke="#e6e3e6" d="M44 38h1M31 39h1M9 41h1M32 44h1M15 48h1" />
                      <path stroke="#00b7ef" d="M71 40h31M62 41h9M102 41h9M57 42h5M111 42h5M55 43h2M116 43h2M54 44h1M118 44h1M55 45h2M116 45h2M57 46h5M111 46h5M62 47h9M102 47h9M71 48h31" />
                      <path stroke="#ff7e00" d="M71 41h31M62 42h49M57 43h31M91 43h25M55 44h32M92 44h26M57 45h29M92 45h24M62 46h15M79 46h6M86 46h2M91 46h5M98 46h13M71 47h5M80 47h5M86 47h9M99 47h3" />
                      <path stroke="#b4b4b4" d="M9 44h1M11 46h1M13 48h1M15 50h1" />
                  </svg>`}
          />
          <PixelText scale={1} color={"black"}>.com</PixelText>
          <spacer grow />
          {extraPadding ?  <PixelText scale={1} color={"black"}>Tries</PixelText> : null}
          {renderHintHearts ? renderHintHearts(livesIndex) : null}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <vstack alignment="middle center" width="100%" backgroundColor="white" padding="small" height={"100%"}>
            {parts.map((part, index) => {
              return (
                <hstack gap="small" padding="small">
                  <PixelText scale={ extraPadding? 1.5 : 0.9} color={"black"}>{part}</PixelText>
                </hstack>
              );
            })}
          </vstack>
        </hstack>

          <spacer size="medium" />
          
          <vstack gap="medium" width="80%">
            {/* First row - options 0 and 1 */}
            <hstack width="100%" gap="medium">
              <OptionItem 
                index={0}
                option={currentQuestion.options[0]}
                showResult={showResult}
                onSelect={handleOptionSelect}
                correctAnswer={currentQuestion.correctAnswer}
                selectedOption={selectedOption}
                textScale={extraPadding? 1.5 : 1}
              />
              
              <OptionItem 
                index={1}
                option={currentQuestion.options[1]}
                showResult={showResult}
                onSelect={handleOptionSelect}
                correctAnswer={currentQuestion.correctAnswer}
                selectedOption={selectedOption}
                textScale={extraPadding? 1.5 : 1}
              />
            </hstack>
            
            {/* Second row - options 2 and 3 */}
            <hstack width="100%" gap="medium">
              <OptionItem 
                index={2}
                option={currentQuestion.options[2]}
                showResult={showResult}
                onSelect={handleOptionSelect}
                correctAnswer={currentQuestion.correctAnswer}
                selectedOption={selectedOption}
                textScale={extraPadding? 1.5 : 1}
              />
              
              <OptionItem 
                index={3}
                option={currentQuestion.options[3]}
                showResult={showResult}
                onSelect={handleOptionSelect}
                correctAnswer={currentQuestion.correctAnswer}
                selectedOption={selectedOption}
                textScale={extraPadding? 1.5 : 1}
              />
            </hstack>

          </vstack>
    
      <spacer grow />
      
      <hstack width="80%" alignment="center middle" >
            
            <hstack width={extraPadding ? "80%" : "70%"} alignment="center middle"  height="40px" padding="small" backgroundColor="#013839">
                    <ProgressBar width={extraPadding? 375 : 240} onComplete={onFinish} />
                  </hstack>
      
              <spacer grow />
              <hstack width={extraPadding ? "15%" : "25%"} alignment="center middle"  height="40px" >
      
                  <CustomButton
                      width="70px"
                      height="40px"
                      label="skip"
                      textSize={extraPadding? 2 : 1}
                      color={"white"}
                      onClick={ ()=> setNextQuestionTime(100)}
                    />
                    <spacer grow />
 
              </hstack>
      
                </hstack>

      <spacer height="56px" />


    </vstack>
  );
};