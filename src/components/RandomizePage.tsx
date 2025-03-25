import { Context, Devvit, useInterval, useState } from "@devvit/public-api";
import Settings from '../Settings.json';
import { CustomButton } from "../components/Addons/CustomButton.js";
import { PixelText } from "./Addons/PixelText.js";
import { GAME_SVG } from "../data/svgs.js";

interface PageCarouselProps {
  onComplete: (pageName: string) => void;
  onCancel: (skip:boolean) => void;
  targetPageIndex: number; // The index of the page we want to land on (0-5)
}

type PageData = {
  name: string;
  color: string;
  image: string;
}

const PAGE_SIZE = 150;
const ANIMATION_INTERVAL = 125;
const COMPLETION_DELAY = 2500;
const INITIAL_TIMEOUT = 25000;

export const PageCarousel = (
  props: PageCarouselProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, targetPageIndex } = props;

  const MAX_CYCLES = Math.floor(Math.random() * 3 );

  
  // Define the 6 pages with their properties
  const [pages] = useState<PageData[]>([
    {
      name: "celebGuess",
      color: "#FF5733",
      image: GAME_SVG.celebGuess
    },
    {
      name: "trivia",
      color: "#FF5733",
      image: GAME_SVG.trivia
    },
    {
      name: "subredditGuess",
      color: "#FF5733",
      image: GAME_SVG.subredditGuess
    },
    {
      name: "copyPasta",
      color: "#FF5733",
      image: GAME_SVG.copyPasta
    },
    {
      name: "upvotes",
      color: "#FF5733",
      image: GAME_SVG.upvotes
    },
    {
      name: "historian",
      color: "#FF5733",
      image: GAME_SVG.historian
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const [ nextQuestionTime, setNextQuestionTime] = useState(25000);



  // Set up interval to change highlighted page
  useInterval(() => {

    setNextQuestionTime( (nextQuestionTime) => nextQuestionTime - 500)

    // End of Animation, wait 2.5 seconds before showing next screen
    const remainingTime = nextQuestionTime - 500;

    if(remainingTime <= 0) onComplete(pages[currentIndex].name);
  
    if (!isAnimating) return;


    
    const nextIndex = (currentIndex + 1) % pages.length;
    setCurrentIndex(nextIndex);
    
    if (nextIndex === 0) {
      setCycleCount(cycleCount + 1);
    }

    if (cycleCount >= MAX_CYCLES && nextIndex === targetPageIndex && isAnimating) {
        setIsAnimating(false);
        setNextQuestionTime(2500)
    }


    
  }, ANIMATION_INTERVAL).start();


  const firstRowPages = pages.slice(0, 3);
  const secondRowPages = pages.slice(3, 6);


  return (
    <vstack width="100%" height="100%"  padding="medium" alignment="middle">
      <hstack width="100%" alignment="middle center">
        <PixelText scale={4}> Next Game</PixelText>
      </hstack>
      
      <spacer size="large" />
      

      <vstack width="100%" alignment="middle center" gap="medium">
        {/* First row: pages 0-2 */}
        <hstack width="100%" alignment="middle center" gap="medium">
            {firstRowPages.map((page, index) => (
            <vstack
                width={`33%`}
                height={`${PAGE_SIZE}px`}
                backgroundColor={currentIndex === index ? page.color : "#CCCCCC"}
                cornerRadius="medium"
                padding="medium"
                alignment="middle center"
                border={currentIndex === index ? "thick" : "thin"}
                borderColor={currentIndex === index ? Settings.theme.primary : "transparent"}
            >
                          
                <image
                imageHeight={64}
                imageWidth={64}
                width="128px"
                height="64px"
                url={page.image}
                />
            </vstack>
            ))}
        </hstack>
        
        {/* Second row: pages 3-5 */}
        <hstack width="100%" alignment="middle center" gap="medium">
            {secondRowPages.map((page, index) => (
            <vstack
                width={`33%`}
                height={`${PAGE_SIZE}px`}
                backgroundColor={currentIndex === (index + 3) ? page.color : "#CCCCCC"}
                cornerRadius="medium"
                padding="medium"
                alignment="middle center"
                border={currentIndex === (index + 3) ? "thick" : "thin"}
                borderColor={currentIndex === (index + 3) ? Settings.theme.primary : "transparent"}
            >
           
                    
                <image
                imageHeight={64}
                imageWidth={64}
                width="128px"
                height="64px"
                url={page.image}
                />
            </vstack>
            ))}
        </hstack>
        </vstack>
            
    </vstack>
  );
};