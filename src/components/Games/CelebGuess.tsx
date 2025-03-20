import { Context, Devvit, JSONObject, useForm, useInterval, useState } from "@devvit/public-api";
import { GameProps, GameScore, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import Settings from '../../Settings.json';
import { ScoreToLetter, splitArray } from "../../utils/utils.js";
import { ProgressBar } from "../Addons/ProgressBar.js";
import { PieceSymbol } from "../Addons/PieceSymbol.js";



interface CelebQuestion extends JSONObject {
  image: string;
  name: string;
  hint: string;
  redditRelevance: string;
}

interface drawData {
    color: number;
    drawn: boolean;
    [key: string]: any;
  }
  

const ANIMATION_INTERVAL = 250;
const INITIAL_MAX_HINTS = 3;
const INNER_SIZE = 275;
const GRID_SIZE = '275px';

export const CelebPage = (
  props: GameProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess } = props;
  
  // Sample celebrity questions
  const [questions] = useState<CelebQuestion[]>([
    {
      image: "keanu.jpg",
      name: "Keanu Reeves",
      hint: "Known for 'The Matrix' and 'John Wick'",
      redditRelevance: "Reddit's favorite wholesome celebrity"
    },
    {
      image: "rick-astley.jpg",
      name: "Rick Astley",
      hint: "Never gonna give you up...",
      redditRelevance: "Rickrolled the internet and has a famous Reddit AMA"
    },
    {
      image: "elon-musk.jpg",
      name: "Elon Musk",
      hint: "CEO of Tesla and SpaceX",
      redditRelevance: "Frequently discussed across Reddit, particularly in tech subreddits"
    },
    {
      image: "arnold.jpg",
      name: "Arnold Schwarzenegger",
      hint: "I'll be back",
      redditRelevance: "Active Reddit user who often comments in fitness subreddits"
    },
    {
      image: "bill-gates.jpg",
      name: "Bill Gates",
      hint: "Microsoft founder and philanthropist",
      redditRelevance: "Regular AMAs and his Reddit Secret Santa participation"
    }
  ]);


  const [startTime] = useState(Date.now());
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [drawingData, setDrawingData] = useState<drawData[]>(Array(Settings.canvasWidth * Settings.canvasHeight).fill({color: 0, drawn: false}));
  const [hintIndex, setHintIndex] = useState(0);


 
  const size = '275px';
  const pieceSize: Devvit.Blocks.SizeString = `${INNER_SIZE / 16}px`;
  const drawingTime = Settings.drawTimeEasy || 60;
  const currentQuestion = questions[0];


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
      setUserGuess(prevState => [...prevState, 'N'])
      props.onComplete();
    }

  }, ANIMATION_INTERVAL).start();



  const handleSubmit = (name:string):void => {

    if (hintIndex > INITIAL_MAX_HINTS) {
      return;
    }

    console.log("Checking answer...")

    const cleanedInput = name.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.name.toLowerCase();
    
    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer 
    
    setIsCorrect(correct);
    
    if (correct) {
      const newScore = elapsedTime < 10000 ? 3 : elapsedTime < 20000 ? 2 : 1;
      setUserGuess(prevState => [...prevState, 'Y'])
      setScore((prev) => prev + newScore);
      onComplete();
    }
    else {
      setHintIndex((prev) => prev + 1);
    }
    
    setShowResult(true);
  };

  

 

  // Render the pixel grid
  const renderPixelGrid = () => {
    const pixels = drawingData.map((pixel, index) => (
      <hstack
        key={`pixel-${index}`}
        height={pieceSize}
        width={pieceSize}
        backgroundColor={pixel.drawn ? "transparent" : "black"}
      />
    ));

    return (
      <vstack height={GRID_SIZE} width={GRID_SIZE} padding="none">
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
            scale={0.5} 
          />
        );
      }
    }
    return hearts;
  };



  return (
    <vstack width="100%" height="100%" backgroundColor={Settings.theme.background}>
      <hstack width="100%" alignment="middle center">
       <image
                imageHeight={56}
                imageWidth={256}
                width="256px"
                height="128px"
                        url={`data:image/svg+xml,
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 128 64" shape-rendering="crispEdges">
                        <metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
                        <path stroke="#42252f" d="M31 16h3M31 17h3M30 18h1M34 18h1M30 19h1M34 19h1M28 20h2M35 20h1M28 21h2M35 21h1M28 22h2M35 22h1M27 23h1M36 23h1M19 24h9M36 24h9M19 25h2M44 25h1M19 26h2M44 26h1M19 27h2M44 27h1M19 28h2M44 28h1M19 29h2M44 29h1M19 30h2M44 30h1M21 31h1M43 31h1M22 32h1M41 32h2M23 33h1M40 33h1M24 34h2M39 34h1M24 35h2M39 35h1M23 36h1M40 36h1M23 37h1M40 37h1M22 38h1M41 38h2M22 39h1M41 39h2M22 40h1M31 40h3M41 40h2M22 41h1M28 41h3M34 41h2M41 41h2M22 42h1M26 42h2M36 42h3M41 42h2M22 43h1M26 43h2M36 43h3M41 43h2M22 44h4M39 44h4" />
                        <path stroke="#f0dd11" d="M31 18h3M31 19h3M30 20h5M30 21h5M30 22h5M28 23h8M28 24h8M21 25h23M21 26h23M22 27h21M23 28h18M24 29h16M24 30h16M26 31h13M26 32h13M26 33h13M26 34h13M26 35h13M24 36h7M34 36h6M24 37h4M36 37h4M23 38h3M39 38h2M23 39h3M39 39h2" />
                        <path stroke="#000000" d="M48 21h1M51 21h1M54 21h2M58 21h1M62 21h1M64 21h4M71 21h5M77 21h1M80 21h1M83 21h2M87 21h5M48 22h2M51 22h1M53 22h1M56 22h1M58 22h2M61 22h2M64 22h1M73 22h1M77 22h1M80 22h1M82 22h1M85 22h1M89 22h1M48 23h1M50 23h2M53 23h4M58 23h1M60 23h1M62 23h1M64 23h3M73 23h1M77 23h4M82 23h4M89 23h1M48 24h1M51 24h1M53 24h1M56 24h1M58 24h1M62 24h1M64 24h1M73 24h1M77 24h1M80 24h1M82 24h1M85 24h1M89 24h1M48 25h1M51 25h1M53 25h1M56 25h1M58 25h1M62 25h1M64 25h4M73 25h1M77 25h1M80 25h1M82 25h1M85 25h1M89 25h1M49 27h9M61 27h15M82 27h6M94 27h9M49 28h9M61 28h15M82 28h6M94 28h9M49 29h9M61 29h15M82 29h6M94 29h9M46 30h3M67 30h3M79 30h3M88 30h3M94 30h3M103 30h3M46 31h3M67 31h3M79 31h3M88 31h3M94 31h3M103 31h3M46 32h3M67 32h3M79 32h3M88 32h3M94 32h3M103 32h3M49 33h6M67 33h3M79 33h12M94 33h9M49 34h6M67 34h3M79 34h12M94 34h9M49 35h6M67 35h3M79 35h12M94 35h9M55 36h3M67 36h3M79 36h3M88 36h3M94 36h3M100 36h3M55 37h3M67 37h3M79 37h3M88 37h3M94 37h3M100 37h3M55 38h3M67 38h3M79 38h3M88 38h3M94 38h3M100 38h3M46 39h9M67 39h3M79 39h3M88 39h3M94 39h3M103 39h3M46 40h9M67 40h3M79 40h3M88 40h3M94 40h3M103 40h3M46 41h9M67 41h3M79 41h3M88 41h3M94 41h3M103 41h3" />
                        <path stroke="#ffffff" d="M21 27h1M43 27h1M22 28h1M41 28h2M23 29h1M40 29h1M23 30h1M40 30h1M24 31h2M39 31h1M31 36h3M28 37h3M34 37h2M26 38h2M36 38h3M26 39h2M36 39h3M23 40h3M39 40h2" />
                        <path stroke="#c76904" d="M21 28h1M43 28h1M21 29h2M41 29h3M21 30h2M41 30h3M22 31h2M40 31h3M23 32h3M39 32h2M24 33h2M39 33h1M31 37h3M28 38h8M28 39h8M26 40h5M34 40h5M23 41h5M36 41h5M23 42h3M39 42h2M23 43h3M39 43h2" />
                        </svg>                    
                        `}
            />
        </hstack>
      
      
      <vstack alignment="center middle" >

        <ProgressBar width={256} onComplete={onCancel} />
      </vstack>
      
      <spacer size="small" />
      <hstack alignment="center middle">
          {renderHintHearts()}
      </hstack>
      <spacer size="small" />

      
      <vstack alignment="middle center" width="100%">
        <zstack width="250px" height="250px">
            <image
                imageHeight={512}
                imageWidth={512}
                height={GRID_SIZE}
                width={GRID_SIZE}
                url="grid-template.png"
            />
          {renderPixelGrid()}
        </zstack>
        
        
        <spacer size="medium" />
          <vstack gap="medium" width="80%" alignment="middle center">
            
            <hstack gap="medium">
              <CustomButton
                width="120px"
                height="40px"
                label="Solve"
                color={Settings.theme.primary}
                onClick={()=> { if (hintIndex < INITIAL_MAX_HINTS) return context.ui.showForm(myForm)}}
              />
            </hstack>
          </vstack>
  
   
      </vstack>
    </vstack>
  );
};