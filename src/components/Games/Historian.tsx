import { Context, Devvit, JSONObject, useState, useForm } from "@devvit/public-api";
import { GameProps, GameScore, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { PixelText } from "../Addons/PixelText.js";
import { PixelSymbol } from "../Addons/PixelSymbol.js";
import { ScoreToLetter } from "../../utils/utils.js";
import { GAME_SVG } from "../../data/svgs.js";
import { PieceSymbol } from "../Addons/PieceSymbol.js";



interface HistorianQuestion extends JSONObject {
  image: string;
  title: string;
  content: string;
  subreddit: string;
  date: {
    month: number;
    year: number;
  };
  hints: string[];
}

const INITIAL_MAX_HINTS = 3;

export const HistorianPage = (
  props: GameProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess } = props;
  const { ui } = context;
  
  // Sample historical post questions
  const [questions] = useState<HistorianQuestion[]>([
    {
      image: "historic_post1.png",
      title: "The iPhone has been announced!",
      content: "Steve Jobs just unveiled this revolutionary device that's a phone, iPod, and internet device all in one!",
      subreddit: "technology",
      date: {
        month: 1,
        year: 2007
      },
      hints: ["First smartphone with multi-touch", "Before Android existed", "Revolutionary Apple product"]
    },
    {
      image: "historic_post2.png",
      title: "Gangnam Style just hit 1 billion views!",
      content: "This Korean music video is the first to reach this milestone on YouTube. PSY is taking over the world!",
      subreddit: "music",
      date: {
        month: 12,
        year: 2012
      },
      hints: ["K-pop becomes global", "Early viral YouTube sensation", "Horse dance meme"]
    },
    {
      image: "historic_post3.png",
      title: "Bitcoin just hit $1000 for the first time!",
      content: "Can't believe this digital currency has grown so much. Anyone else mining?",
      subreddit: "cryptocurrency",
      date: {
        month: 11,
        year: 2013
      },
      hints: ["Early cryptocurrency milestone", "Before the major boom", "Mt. Gox was still operating"]
    },
    {
      image: "historic_post4.png",
      title: "The Dress - What colors do you see?",
      content: "Is it blue and black or white and gold? My family is having a huge argument over this!",
      subreddit: "pics",
      date: {
        month: 2,
        year: 2015
      },
      hints: ["Viral optical illusion", "Internet-wide debate", "Color perception phenomenon"]
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  //const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [userAnswer, setAnswer] = useState({ month: "", year: "" });

  const currentQuestion = questions[currentIndex];


  const handleShowHint = () => {
    if (hintIndex < currentQuestion.hints.length - 1) {
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
      
      const correctMonth = currentQuestion.date.month;
      const correctYear = currentQuestion.date.year;
      
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
            <PixelText scale={1} color="black">{ currentQuestion.subreddit}</PixelText>
            <spacer size="small" />
            <PixelText scale={1} color="black">??? ago</PixelText>
          </hstack>

          <spacer size="small" />

          <hstack gap="small" alignment="start">
            <PixelText scale={1.5} color="black">{currentQuestion.title}</PixelText>
          </hstack>

          <spacer size="small" />

          <image
            imageHeight={180}
            imageWidth={400}
            height="180px"
            width="400px"
            resizeMode="fill"
            url={currentQuestion.image}
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