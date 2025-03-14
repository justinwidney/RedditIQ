import { Context, Devvit, JSONObject, useForm, useInterval, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import { CustomButton } from "../CustomButton.js";
import Settings from '../../Settings.json';
import { splitArray } from "../../utils/utils.js";
import { PixelText } from "../PixelText.js";
import { ProgressBar } from "../ProgressBar.js";

interface CelebPageProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  userData: UserData | null;
}

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
  


export const HistorianPage = (
  props: CelebPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData } = props;
  
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const drawingTime = Settings.drawTimeEasy || 60;
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [drawingData, setDrawingData] = useState<drawData[]>(Array(Settings.canvasWidth * Settings.canvasHeight).fill({color: 0, drawn: false}));


  const innerSize = 275;
  const size = '275px';

  const pieceSize: Devvit.Blocks.SizeString = `${innerSize / 16}px`;


  const currentQuestion = questions[currentIndex];


  useInterval(() => {
    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    
    const randomIndex = Math.floor(Math.random() * drawingData.length);
    const randomIndex2 = Math.floor(Math.random() * drawingData.length);

    const newDrawingData = [...drawingData];
    newDrawingData[randomIndex].drawn = true;
    newDrawingData[randomIndex2].drawn = true;
    
    setDrawingData(newDrawingData);
     

    if (remainingTime <= 0) props.onComplete(score);
  }, 250).start();



  const handleSubmit = (name:string) => {
    // Clean up and normalize the input for comparison
    const cleanedInput = name.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.name.toLowerCase();
    
    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer || 
                   cleanedAnswer.includes(cleanedInput) || 
                   cleanedInput.includes(cleanedAnswer);
    
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  

 

  const pixels = drawingData.map((pixel, index) => (

    <>
    <hstack
      height={pieceSize}
      width={pieceSize}
      backgroundColor={
        pixel.drawn === true ? "transparent" : "black" 
      }

    > 
    </hstack>
    </>
  ));

  const grid = (
    <vstack height={size} width={size} padding="none">
      {splitArray(pixels, 16).map((row) => (
        <hstack>{row}</hstack>
      ))}
    </vstack>
  );


  

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
  (values) => {
    handleSubmit(values.name);
  }
);     





  return (
    <vstack width="100%" height="100%" padding="large" backgroundColor={Settings.theme.background}>
      <hstack width="100%" alignment="middle center">
      <image
                imageHeight={128}
                imageWidth={128}
                width="128px"
                height="64px"
                        url={`data:image/svg+xml,
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 128 64" shape-rendering="crispEdges">
                        <metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
                        <path stroke="#8d6034" d="M6 7h28M5 8h1M34 8h1M5 55h1M34 55h1M6 56h4M11 56h23" />
                        <path stroke="#8a5d31" d="M6 8h1M12 8h1M17 8h2M25 8h1M32 8h2M7 10h1M32 53h1M6 55h4M12 55h22" />
                        <path stroke="#875b2f" d="M7 8h5M13 8h4M19 8h6M26 8h6M7 9h26M8 10h24M8 53h24M7 54h26M10 55h2" />
                        <path stroke="#895d31" d="M6 9h1M33 54h1" />
                        <path stroke="#8c5f33" d="M33 9h1M6 54h1" />
                        <path stroke="#8e5e32" d="M6 10h1" />
                        <path stroke="#8b5e32" d="M32 10h1M7 53h1" />
                        <path stroke="#906139" d="M33 10h1" />
                        <path stroke="#000000" d="M13 11h2M26 11h2M12 12h1M28 12h1M11 13h1M29 13h1M10 14h1M30 14h1M9 15h1M31 15h1M9 16h1M31 16h1M8 17h1M32 17h1M8 18h1M32 18h1M7 19h1M33 19h1M7 20h1M33 20h1M7 21h1M33 21h1M7 22h1M33 22h1M7 23h1M33 23h1M8 24h1M32 24h1M9 25h1M31 25h1M10 26h1M30 26h1M11 27h1M29 27h1M34 27h2M40 27h2M44 27h6M54 27h6M62 27h10M76 27h4M84 27h6M94 27h6M104 27h4M112 27h2M118 27h2M12 28h2M27 28h2M34 28h2M40 28h2M44 28h6M54 28h6M62 28h10M76 28h4M84 28h6M94 28h6M104 28h4M112 28h2M118 28h2M14 29h1M26 29h1M34 29h2M40 29h2M46 29h2M52 29h2M66 29h2M74 29h2M80 29h2M84 29h2M90 29h2M96 29h2M102 29h2M108 29h2M112 29h4M118 29h2M15 30h3M23 30h3M34 30h2M40 30h2M46 30h2M52 30h2M66 30h2M74 30h2M80 30h2M84 30h2M90 30h2M96 30h2M102 30h2M108 30h2M112 30h4M118 30h2M17 31h1M23 31h1M34 31h8M46 31h2M54 31h4M66 31h2M74 31h2M80 31h2M84 31h6M96 31h2M102 31h8M112 31h2M116 31h4M17 32h1M23 32h1M34 32h8M46 32h2M54 32h4M66 32h2M74 32h2M80 32h2M84 32h6M96 32h2M102 32h8M112 32h2M116 32h4M16 33h1M24 33h1M34 33h2M40 33h2M46 33h2M58 33h2M66 33h2M74 33h2M80 33h2M84 33h2M88 33h2M96 33h2M102 33h2M108 33h2M112 33h2M118 33h2M14 34h1M26 34h1M34 34h2M40 34h2M46 34h2M58 34h2M66 34h2M74 34h2M80 34h2M84 34h2M88 34h2M96 34h2M102 34h2M108 34h2M112 34h2M118 34h2M13 35h1M27 35h1M34 35h2M40 35h2M44 35h6M52 35h6M66 35h2M76 35h4M84 35h2M90 35h2M94 35h6M102 35h2M108 35h2M112 35h2M118 35h2M11 36h1M29 36h1M34 36h2M40 36h2M44 36h6M52 36h6M66 36h2M76 36h4M84 36h2M90 36h2M94 36h6M102 36h2M108 36h2M112 36h2M118 36h2M10 37h1M30 37h1M9 38h1M31 38h1M8 39h1M32 39h1M8 40h1M32 40h1M7 41h1M33 41h1M7 42h1M33 42h1M7 43h1M33 43h1M7 44h1M33 44h1M7 45h1M33 45h1M8 46h1M32 46h1M8 47h1M32 47h1M9 48h1M31 48h1M10 49h1M30 49h1M11 50h1M29 50h1M12 51h1M28 51h1M13 52h2M26 52h2" />
                        <path stroke="#2ce8f5" d="M15 11h2M24 11h2M13 12h2M27 12h1M12 13h1M28 13h1M12 27h1M27 27h2M14 28h1M15 29h1M24 29h2M23 33h1M15 34h1M24 34h2M14 35h1M12 36h1M27 36h2M30 38h1M12 50h1M28 50h1M13 51h2M27 51h1M15 52h1M24 52h2" />
                        <path stroke="#2ae6f3" d="M17 11h1M32 19h1M32 20h1M32 21h1M32 22h1M17 33h1M32 42h1M32 43h1M32 44h1M32 45h1" />
                        <path stroke="#27e5f2" d="M18 11h6M15 12h11M13 13h2M17 13h11M12 14h1M16 14h13M11 15h1M15 15h15M10 16h1M15 16h16M9 17h2M14 17h17M9 18h1M12 18h19M9 19h1M11 19h21M9 20h23M29 25h1M12 26h1M27 26h2M14 27h1M18 30h1M19 31h1M19 32h1M18 33h2M21 33h2M17 34h3M21 34h3M15 35h5M21 35h5M14 36h6M21 36h6M12 37h8M21 37h8M11 38h9M21 38h9M10 39h10M21 39h10M9 40h11M21 40h10M9 41h11M21 41h11M9 42h11M21 42h11M9 43h11M21 43h11M9 44h11M21 44h11M9 45h11M21 45h11M10 46h1M30 46h1M10 47h1M30 47h1M12 49h1M28 49h1M15 51h1M25 51h1M17 52h7" />
                        <path stroke="#2ae7f4" d="M26 12h1M8 19h1M8 20h1M8 21h1M8 22h1M30 25h1M26 28h1M26 35h1M8 42h1M8 43h1M8 44h1M8 45h1M26 51h1" />
                        <path stroke="#ffffff" d="M15 13h2M14 14h2M13 15h2M12 16h2M11 17h2M10 18h2" />
                        <path stroke="rgba(47,231,254,0.9568627450980393)" d="M11 14h1" />
                        <path stroke="#2fe8f5" d="M13 14h1" />
                        <path stroke="rgba(51,255,255,0.9803921568627451)" d="M29 14h1" />
                        <path stroke="rgba(43,234,246,0.9058823529411765)" d="M10 15h1" />
                        <path stroke="#29e6f3" d="M12 15h1M30 15h1M22 30h1M21 32h1M30 48h1" />
                        <path stroke="#30e9f6" d="M11 16h1" />
                        <path stroke="#33ebf8" d="M14 16h1" />
                        <path stroke="#3cf0fc" d="M13 17h1" />
                        <path stroke="#28e5f2" d="M31 17h1M31 18h1M16 29h1M21 31h1M16 34h1M31 40h1M16 52h1" />
                        <path stroke="#2be7f4" d="M10 19h1M13 27h1M13 36h1" />
                        <path stroke="#43e2e7" d="M9 21h1" />
                        <path stroke="#49dbdc" d="M10 21h1" />
                        <path stroke="#3dced4" d="M11 21h1" />
                        <path stroke="#3ccdd4" d="M12 21h1M28 21h1" />
                        <path stroke="#c97a5a" d="M13 21h2M27 21h1" />
                        <path stroke="#9c634e" d="M15 21h11M12 22h17M18 23h4" />
                        <path stroke="#bf7557" d="M26 21h1" />
                        <path stroke="#46d3d7" d="M29 21h1" />
                        <path stroke="#4ae2e5" d="M30 21h1" />
                        <path stroke="#3cd8df" d="M31 21h1M25 28h1" />
                        <path stroke="#c5d7b7" d="M9 22h1" />
                        <path stroke="#e5ae7c" d="M10 22h1" />
                        <path stroke="#a06750" d="M11 22h1" />
                        <path stroke="#d3825e" d="M29 22h1" />
                        <path stroke="#ead4aa" d="M30 22h1" />
                        <path stroke="#9d9f8b" d="M31 22h1M24 51h1" />
                        <path stroke="rgba(43,231,245,0.7176470588235294)" d="M8 23h1" />
                        <path stroke="#87c5b1" d="M9 23h1" />
                        <path stroke="#dac197" d="M10 23h1" />
                        <path stroke="#e7c295" d="M11 23h1" />
                        <path stroke="#db9f79" d="M12 23h1" />
                        <path stroke="#b98d70" d="M13 23h2M26 23h1" />
                        <path stroke="#b57859" d="M15 23h1" />
                        <path stroke="#b06d53" d="M16 23h1M23 23h2" />
                        <path stroke="#a86951" d="M17 23h1" />
                        <path stroke="#9f654f" d="M22 23h1" />
                        <path stroke="#b8896c" d="M25 23h1" />
                        <path stroke="#d98e64" d="M27 23h1" />
                        <path stroke="#e4a672" d="M28 23h1M17 25h7M18 26h5M21 27h1M19 28h1M17 47h1" />
                        <path stroke="#e7c193" d="M29 23h1" />
                        <path stroke="#d3805d" d="M30 23h1M12 25h1M14 26h1M26 26h1M25 27h1M16 28h3M22 28h3M18 29h2M21 29h2M19 46h3M12 48h1M28 48h1M27 49h1M14 50h2M26 50h1M17 51h7" />
                        <path stroke="#71b9b2" d="M31 23h1" />
                        <path stroke="rgba(44,232,244,0.7490196078431373)" d="M32 23h1" />
                        <path stroke="rgba(46,233,244,0.8235294117647058)" d="M9 24h1" />
                        <path stroke="#31e2ec" d="M10 24h1" />
                        <path stroke="#c98867" d="M11 24h1" />
                        <path stroke="#d48561" d="M12 24h1" />
                        <path stroke="#e5aa7a" d="M13 24h2M26 24h2M14 25h3M24 25h3M16 26h2M24 26h2M16 27h5M22 27h3M20 28h2M20 29h1M20 30h1M20 31h1M20 32h1M20 33h1M20 34h1M20 35h1M20 36h1M20 37h1M20 38h1M20 39h1M20 40h1M20 41h1M20 42h1M20 43h1M20 44h1M20 45h1M12 47h5M18 47h11M13 48h15M13 49h14M16 50h10" />
                        <path stroke="#e3a571" d="M15 24h1" />
                        <path stroke="#e2a370" d="M16 24h1M23 24h2" />
                        <path stroke="#e1a270" d="M17 24h1" />
                        <path stroke="#dfa16f" d="M18 24h4" />
                        <path stroke="#e0a26f" d="M22 24h1" />
                        <path stroke="#e4a874" d="M25 24h1" />
                        <path stroke="#d4825e" d="M28 24h1" />
                        <path stroke="#32e1e9" d="M29 24h1" />
                        <path stroke="#31dee8" d="M30 24h1" />
                        <path stroke="rgba(45,232,245,0.7058823529411765)" d="M31 24h1" />
                        <path stroke="rgba(42,231,247,0.8784313725490196)" d="M10 25h1" />
                        <path stroke="#5ec4c2" d="M11 25h1" />
                        <path stroke="#dd986a" d="M13 25h1" />
                        <path stroke="#de996b" d="M27 25h1" />
                        <path stroke="#62c2bf" d="M28 25h1" />
                        <path stroke="rgba(48,240,243,0.9372549019607843)" d="M11 26h1M11 49h1" />
                        <path stroke="#2ae3ef" d="M13 26h1M27 50h1" />
                        <path stroke="#df9c6c" d="M15 26h1" />
                        <path stroke="#e3a471" d="M23 26h1" />
                        <path stroke="rgba(43,231,254,0.9725490196078431)" d="M29 26h1M29 49h1" />
                        <path stroke="#d78962" d="M15 27h1" />
                        <path stroke="#4ccfd1" d="M26 27h1" />
                        <path stroke="#52cbcc" d="M15 28h1" />
                        <path stroke="#67bfba" d="M17 29h1" />
                        <path stroke="#cd8361" d="M23 29h1" />
                        <path stroke="#92a594" d="M19 30h1M21 30h1" />
                        <path stroke="rgba(39,229,254,0.9686274509803922)" d="M18 31h1" />
                        <path stroke="rgba(47,232,244,0.9137254901960784)" d="M22 31h1" />
                        <path stroke="rgba(40,229,254,0.9686274509803922)" d="M18 32h1" />
                        <path stroke="rgba(43,234,245,0.9058823529411765)" d="M22 32h1" />
                        <path stroke="rgba(41,236,244,0.9490196078431372)" d="M11 37h1" />
                        <path stroke="rgba(43,231,254,0.9764705882352941)" d="M29 37h1" />
                        <path stroke="rgba(44,234,245,0.8156862745098039)" d="M10 38h1" />
                        <path stroke="rgba(40,229,246,0.8941176470588236)" d="M9 39h1" />
                        <path stroke="rgba(40,233,244,0.8235294117647058)" d="M31 39h1" />
                        <path stroke="rgba(43,232,244,0.7411764705882353)" d="M8 41h1" />
                        <path stroke="rgba(44,230,243,0.7686274509803922)" d="M32 41h1" />
                        <path stroke="rgba(40,231,243,0.9176470588235294)" d="M9 46h1" />
                        <path stroke="#6dbbb4" d="M11 46h1M11 48h1" />
                        <path stroke="#79c9ba" d="M12 46h1M16 46h1M27 46h1" />
                        <path stroke="#79c9b9" d="M13 46h1" />
                        <path stroke="#72b8b0" d="M14 46h1M26 46h1M28 46h1" />
                        <path stroke="#74bcb3" d="M15 46h1" />
                        <path stroke="#9db49a" d="M17 46h1" />
                        <path stroke="#dc9568" d="M18 46h1" />
                        <path stroke="#dc9468" d="M22 46h1" />
                        <path stroke="#da9066" d="M23 46h1" />
                        <path stroke="#bda888" d="M24 46h1" />
                        <path stroke="#73bdb5" d="M25 46h1" />
                        <path stroke="#70b9b2" d="M29 46h1M29 48h1" />
                        <path stroke="rgba(44,234,243,0.8627450980392157)" d="M31 46h1" />
                        <path stroke="rgba(43,234,245,0.8117647058823529)" d="M9 47h1" />
                        <path stroke="#c88666" d="M11 47h1" />
                        <path stroke="#ce8260" d="M29 47h1" />
                        <path stroke="rgba(45,233,246,0.6862745098039216)" d="M31 47h1" />
                        <path stroke="rgba(40,237,246,0.8941176470588236)" d="M10 48h1" />
                        <path stroke="#2de1ec" d="M13 50h1" />
                        <path stroke="#9f9e89" d="M16 51h1" />
                        <path stroke="rgba(144,97,57,0.2980392156862745)" d="M6 53h1" />
                        <path stroke="rgba(142,94,50,0.6470588235294118)" d="M33 53h1" />
                        <path stroke="#9c5a3c" d="M10 56h1" />
                        </svg>`}
                description="chess paint logo"
                />

      </hstack>
      
      <spacer size="medium" />
      
      <vstack alignment="center middle" >

        <ProgressBar width={256} onComplete={onCancel} />
      </vstack>
      
      <spacer size="medium" />
      
      
      <vstack alignment="middle center" width="100%">
        <zstack width="250px" height="250px">
            <image
                imageHeight={512}
                imageWidth={512}
                height={size}
                width={size}
                url="grid-template.png"
            />
          {grid}
        </zstack>
        
        <spacer size="large" />
        
      
        
        <spacer size="medium" />
        
          <vstack gap="medium" width="80%" alignment="middle center">
            
            
            <hstack gap="medium">
              <CustomButton
                width="120px"
                height="40px"
                text="Solve"
                color={Settings.theme.primary}
                onClick={()=> context.ui.showForm(myForm)}
              />
            </hstack>
          </vstack>
  
   
      </vstack>
    </vstack>
  );
};