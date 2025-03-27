import { Context, Devvit, JSONObject, useForm, useInterval, useState } from "@devvit/public-api";
import { CelebrityQuestion, GameProps, GameScore, MultipleChoiceScore, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import Settings from '../../Settings.json';
import { ScoreToLetter, levenshteinDistance, splitArray } from "../../utils/utils.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { PieceSymbol } from "../Addons/PieceSymbol.js";
import { PixelText } from "../Addons/PixelText.js";



interface CelebPageProps extends GameProps {
  question: CelebrityQuestion
}

interface drawData {
    color: number;
    drawn: boolean;
    [key: string]: any;
  }
  

const ANIMATION_INTERVAL = 200;
const INITIAL_MAX_HINTS = 3;
const GRID_SIZE_HEIGHT = '250px';

export const CelebPage = (
  props: CelebPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;
  
 
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);

  const drawingTime = Settings.drawTimeEasy || 60;

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [drawingData, setDrawingData] = useState<drawData[]>(Array(Settings.canvasWidth * Settings.canvasHeight).fill({color: 0, drawn: false}));
  const [hintIndex, setHintIndex] = useState(0);
 
  const dimensions = context.dimensions || { width: 700, height: 500 }; // default dimensions

  const pieceSize: Devvit.Blocks.SizeString = `${dimensions.width / 16}px`;
  const pieceSizeHeight: Devvit.Blocks.SizeString = `${dimensions?.height / 16}px`;
  const pictureWidth:Devvit.Blocks.SizeString = `${dimensions.width}px`

  const extraPadding = dimensions.width > 450 



  useInterval(() => {

    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    const newDrawingData = [...drawingData];

    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * drawingData.length);
      newDrawingData[randomIndex] = { ...newDrawingData[randomIndex], drawn: true };
    }
    
    setDrawingData(newDrawingData);
     
    if (remainingTime <= 0) {
      const updateGuess = [...userGuess, '0'] as MultipleChoiceScore[];
      setUserGuess(updateGuess)
      props.onComplete(updateGuess);
    }

  }, ANIMATION_INTERVAL).start();


  const onSkip = () => {

    const newGuess  = [...userGuess, '-1'] as MultipleChoiceScore[];
    setUserGuess(newGuess)
    props.onComplete(newGuess);

  }

  const onFinish = () => {

    const newGuess  = [...userGuess, '0'] as MultipleChoiceScore[] 
    setUserGuess(newGuess)
    props.onComplete(newGuess);

  }


  const handleSubmit = (name:string):void => {

    const cleanedInput = name.trim().toLowerCase();

    const correct = question.answers.some(answer => 
      answer.trim().toLowerCase() === cleanedInput
    );

    const distance = question.answers.some(answer => {
      const cleanedAnswer = answer.trim().toLowerCase();
      const distance = levenshteinDistance(cleanedInput, cleanedAnswer);
      const maxDistance = Math.min(2, Math.floor(cleanedAnswer.length / 3));
      return distance <= maxDistance;
    });

    const isAnswerCorrect = correct || distance ;
    
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {

        const newScore = elapsedTime < 10000 ? 3 : elapsedTime < 20000 ? 2 : 1;
        const newScoreLetter = newScore === 3 ? '3' : newScore === 2 ? '2' : '1';

        const updateGuess = [...userGuess, newScoreLetter] as MultipleChoiceScore[];

        setUserGuess(prevState => [...prevState, newScoreLetter])
        setScore((prev) => prev + newScore);

        onComplete(updateGuess);
    }
    else {

        const nextHintIndex = hintIndex + 1;
        setHintIndex(nextHintIndex);

      if (nextHintIndex >= INITIAL_MAX_HINTS) {
        const updateGuess = [...userGuess, '0'] as MultipleChoiceScore[];
        setUserGuess(updateGuess)
        onComplete(updateGuess);

      }

    }

    
    
  };

  

 

  // Render the pixel grid
  const renderPixelGrid = () => {
    const pixels = drawingData.map((pixel, index) => (
      <hstack
        key={`pixel-${index}`}
        height={pieceSizeHeight}
        width={pieceSize}
        backgroundColor={pixel.drawn ? "transparent" : "black"}
      />
    ));

    return (
      <vstack height={GRID_SIZE_HEIGHT} width="100%" padding="none">
        {splitArray(pixels, 16).map((row, rowIndex) => (
          <hstack key={`row-${rowIndex}`}>{row}</hstack>
        ))}
      </vstack>
    );
  };


  

const myForm = useForm(
  () => {
    return {
      fields: [
        {
          type: 'string',
          name: 'answer',
          label: 'Name a Celebrity',
        },
      ],
 
    } 
  },
  async (values) => {

    handleSubmit(values.answer);
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
    <vstack width="100%" height="100%" padding="small" alignment="center">

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
                          url={`data:image/svg+xml,
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 96 32" shape-rendering="crispEdges">                          <path stroke="#42252f" d="M16 1h3M16 2h3M15 3h1M19 3h1M15 4h1M19 4h1M13 5h2M20 5h1M13 6h2M20 6h1M13 7h2M20 7h1M12 8h1M21 8h1M4 9h9M21 9h9M4 10h2M29 10h1M4 11h2M29 11h1M4 12h2M29 12h1M4 13h2M29 13h1M4 14h2M29 14h1M4 15h2M29 15h1M6 16h1M28 16h1M7 17h1M26 17h2M8 18h1M25 18h1M9 19h2M24 19h1M9 20h2M24 20h1M8 21h1M25 21h1M8 22h1M25 22h1M7 23h1M26 23h2M7 24h1M26 24h2M7 25h1M16 25h3M26 25h2M7 26h1M13 26h3M19 26h2M26 26h2M7 27h1M11 27h2M21 27h3M26 27h2M7 28h1M11 28h2M21 28h3M26 28h2M7 29h4M24 29h4" />
                          <path stroke="#f0dd11" d="M16 3h3M16 4h3M15 5h5M15 6h5M15 7h5M13 8h8M13 9h8M6 10h23M6 11h23M7 12h21M8 13h18M9 14h16M9 15h16M11 16h13M11 17h13M11 18h13M11 19h13M11 20h13M9 21h7M19 21h6M9 22h4M21 22h4M8 23h3M24 23h2M8 24h3M24 24h2" />
                          <path stroke="#000000" d="M33 6h1M36 6h1M39 6h2M43 6h1M47 6h1M49 6h4M56 6h5M62 6h1M65 6h1M68 6h2M72 6h5M33 7h2M36 7h1M38 7h1M41 7h1M43 7h2M46 7h2M49 7h1M58 7h1M62 7h1M65 7h1M67 7h1M70 7h1M74 7h1M33 8h1M35 8h2M38 8h4M43 8h1M45 8h1M47 8h1M49 8h3M58 8h1M62 8h4M67 8h4M74 8h1M33 9h1M36 9h1M38 9h1M41 9h1M43 9h1M47 9h1M49 9h1M58 9h1M62 9h1M65 9h1M67 9h1M70 9h1M74 9h1M33 10h1M36 10h1M38 10h1M41 10h1M43 10h1M47 10h1M49 10h4M58 10h1M62 10h1M65 10h1M67 10h1M70 10h1M74 10h1M34 12h9M46 12h15M67 12h6M79 12h9M34 13h9M46 13h15M67 13h6M79 13h9M34 14h9M46 14h15M67 14h6M79 14h9M31 15h3M52 15h3M64 15h3M73 15h3M79 15h3M88 15h3M31 16h3M52 16h3M64 16h3M73 16h3M79 16h3M88 16h3M31 17h3M52 17h3M64 17h3M73 17h3M79 17h3M88 17h3M34 18h6M52 18h3M64 18h12M79 18h9M34 19h6M52 19h3M64 19h12M79 19h9M34 20h6M52 20h3M64 20h12M79 20h9M40 21h3M52 21h3M64 21h3M73 21h3M79 21h3M85 21h3M40 22h3M52 22h3M64 22h3M73 22h3M79 22h3M85 22h3M40 23h3M52 23h3M64 23h3M73 23h3M79 23h3M85 23h3M31 24h9M52 24h3M64 24h3M73 24h3M79 24h3M88 24h3M31 25h9M52 25h3M64 25h3M73 25h3M79 25h3M88 25h3M31 26h9M52 26h3M64 26h3M73 26h3M79 26h3M88 26h3" />
                          <path stroke="#ffffff" d="M6 12h1M28 12h1M7 13h1M26 13h2M8 14h1M25 14h1M8 15h1M25 15h1M9 16h2M24 16h1M16 21h3M13 22h3M19 22h2M11 23h2M21 23h3M11 24h2M21 24h3M8 25h3M24 25h2" />
                          <path stroke="#c76904" d="M6 13h1M28 13h1M6 14h2M26 14h3M6 15h2M26 15h3M7 16h2M25 16h3M8 17h3M24 17h2M9 18h2M24 18h1M16 22h3M13 23h8M13 24h8M11 25h5M19 25h5M8 26h5M21 26h5M8 27h3M24 27h2M8 28h3M24 28h2" />
                          </svg>                    
                          `}
              />
        <PixelText  scale={1}  color={"black"}>.com</PixelText>

        <spacer grow /> 
        {extraPadding ?  <PixelText scale={1} color={"black"}>Tries</PixelText> : null}
        {renderHintHearts()}
        </hstack>
       </hstack>
      
      
    
      
     
      <spacer size="small" />

      
      <vstack alignment="middle center" width="100%">
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <zstack width="100%" backgroundColor="white" alignment="center middle">
            <image
                imageHeight={GRID_SIZE_HEIGHT}
                imageWidth={pictureWidth}
                height={"100%"}                
                width={"100%"}
                url={question.image ? question.image : "pxArt(9)"}
                resizeMode="cover"
            />
          {renderPixelGrid()}
        </zstack>
        </hstack>
      </vstack>

      <spacer size="small" />

      <hstack width="80%" alignment="center middle" >
            
      <hstack width={extraPadding ? "60%" : "40%"} alignment="center middle"  height="40px" padding="small" backgroundColor="#013839">
              <ProgressBar width={extraPadding? 300 : 100} onComplete={onFinish} />
            </hstack>

      <spacer grow />
        <hstack width={extraPadding ? "35%" : "55%"} alignment="center middle"  height="40px" >

          <CustomButton
                width="70px"
                height="40px"
                label="skip"
                textSize={extraPadding? 2 : 1}
                color={"white"}
                onClick={onSkip}
              />
              <spacer grow />

              <CustomButton
                width={extraPadding? "100px" : "70px"}
                height="40px"
                label="ENTER"
                textSize={extraPadding? 2 : 1}
                color={"white"}
                onClick={()=> { if (hintIndex < INITIAL_MAX_HINTS) return context.ui.showForm(myForm)}}
              />
        </hstack>

          </hstack>
  
    </vstack>
  );
};