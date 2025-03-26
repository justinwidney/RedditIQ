import { Context, Devvit, JSONObject, useState, TextAreaWidget, useForm } from "@devvit/public-api";
import { GameProps, SubredditQuestion, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { PixelText } from "../Addons/PixelText.js";
import { PixelSymbol } from "../Addons/PixelSymbol.js";
import Settings from "../../Settings.json"
import { PieceSymbol } from "../Addons/PieceSymbol.js";
import { GAME_SVG } from "../../data/svgs.js";
import { ProgressBar } from "../Addons/ProgressBar.js";



interface SubredditGuessPageProps extends GameProps {
  question: SubredditQuestion;
}


const INITIAL_MAX_HINTS = 3;

const subredditOptions = [
  'r/aww',
  'r/AskReddit',
  'r/funny',
  'r/gaming',
  'r/memes',
  'r/pics',
  'r/todayilearned',
  'r/worldnews',
  'r/audiophile',
  'r/technology',
  'r/programming',
]


export const SubredditGuessPage = (
  props: SubredditGuessPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;

  const {ui, reddit} = context;

  const containerWidth = context.dimensions.width > 600 ? '450px' : '300px';
  const pictureWidth = context.dimensions.width > 600 ? '400px' : '250px';
  const textSize = context.dimensions.width > 600 ? 1.5 : 1;
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const currentQuestion = question


  const onFinish = (sovled:boolean = false) => {

    console.log('onFinish', sovled)

    const score = 3 - hintIndex;
    const guess = sovled ? '3' : '0';

    setUserGuess(prevState => [...prevState, guess])
    setScore(prevScore => prevScore + score);
    onComplete(userGuess);

  }


// Handle selecting an option for a blank
const handleOptionSelect = (option : string[] ) => {

    const guess = option[0];

    setHintIndex( prev => prev + 1);


    // Clean up and normalize the input for comparison
    const cleanedInput = guess.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.answer.toLowerCase();
    
    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer || 
                  `r/${cleanedInput}` === cleanedAnswer || 
                  cleanedInput === `r/${cleanedAnswer}`;
    
    setIsCorrect(correct);
    
    if (correct) {
      onFinish(true);
      return
    }

    if (hintIndex >= INITIAL_MAX_HINTS -1) {
      onFinish(false);
      return
    }

    
    setShowResult(true);
   
};




  const myForm = useForm(
    (data: {lableOptions? :string[]}) => {
      return {
        fields: [
          {
            type: 'select',
            name: 'answer',
            label: `Pick an option 'r/' `,
            options : data.lableOptions ? data.lableOptions.map((option) => ({
              value: option,
              label: option,
            })) : [],
          },
        ],
   
      } 
    },
    (values) => {
      handleOptionSelect(values.answer);
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
        <hstack width="100%" alignment="center middle" backgroundColor="white">
          <spacer size="small" />
          <PixelText scale={1} color={"black"}>www.</PixelText>
          <image
            imageHeight={64}
            imageWidth={64}
            width="96px"
            height="32px"
            url={GAME_SVG.subredditGuess}
          />
          <PixelText scale={1} color={"black"}>.com</PixelText>
          <spacer grow />
          <PixelText scale={1} color={"black"}>Tries</PixelText>
          {renderHintHearts()}
        </hstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle" padding="small" backgroundColor="#013839">
        <vstack alignment="middle center" width="100%" backgroundColor="white" padding="small">
          <hstack gap="small" alignment="start middle" width="100%">
            <PixelText scale={1} color="black">r/.....</PixelText>
            <PixelText scale={1} color="black">1hr ago</PixelText>
            <spacer grow />
          </hstack>
          
          <spacer size="small" />
          
          <hstack gap="small" alignment="start" width="100%">
            <PixelText scale={textSize} color="black">The speakers keep getting bigger</PixelText>
          </hstack>
          
          <hstack gap="small" alignment="start" width="100%">
            <PixelText scale={textSize} color="black">and my living room stays the same size</PixelText>
          </hstack>
          
          <spacer size="small" />
          
          <image
            imageHeight={200}
            imageWidth={400}
            height="180px"
            width="100%"
            resizeMode="fill"
            url={hintIndex > 1 ? currentQuestion.image2 : currentQuestion.image}
          />
                    
        </vstack>
      </hstack>
      
      <spacer size="small" />
      
      <hstack width="80%" alignment="center middle">
        <hstack width="60%" alignment="center middle" height="40px" padding="small" backgroundColor="#013839">
          <ProgressBar width={300} onComplete={onFinish} />
        </hstack>
        
        <spacer grow />
        
        <hstack width="35%" alignment="center middle" height="40px">
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
            onClick={() => context.ui.showForm(myForm, {lableOptions: subredditOptions} )}
          />
        </hstack>
      </hstack>
    </vstack>
  );
};